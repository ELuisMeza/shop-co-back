import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FilesEntity } from './files.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UpdateFileDto } from './dto/update-file.dto';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { UploadFilesData } from './dto/files.dto';
import { StorageService } from '../../storage/storage.service';
import { randomUUID } from 'crypto';
import { GlobalTypesFiles } from 'src/globals/enums/global-types-files';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FilesEntity)
    private readonly filesRepository: Repository<FilesEntity>,
    private readonly storageService: StorageService,
  ) {}

  async getById(id: string): Promise<FilesEntity> {
    const file = await this.filesRepository.findOne({ 
      where: { id }
    });
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return file;
  }

  /**
   * Convierte el parent_type en un nombre de carpeta
   * @param parentType Tipo de parent (product, seller, etc.)
   * @returns Nombre de la carpeta (products, sellers, etc.)
   */
  private getFolderName(parentType: string): string {
    // Mapeo de parent_type a nombre de carpeta
    // Puedes agregar más mapeos aquí según necesites
    const folderMap: { [key: string]: string } = {
      [GlobalTypesFiles.PRODUCT]: GlobalTypesFiles.PRODUCT,
      [GlobalTypesFiles.SELLER]: GlobalTypesFiles.SELLER,
    };
    return folderMap[parentType] || parentType;
  }

  /**
   * Obtiene la extensión de archivo basándose en el mimetype
   * @param mimetype Tipo MIME del archivo
   * @returns Extensión del archivo (ej: .jpg, .png, etc.)
   */
  private getExtensionFromMimeType(mimetype: string): string {
    const extensionMap: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };

    return extensionMap[mimetype] || '.jpg';
  }

  async getByParentIdAndActive(parentId: string): Promise<FilesEntity[]> {
    return this.filesRepository.find({
      where: { 
        parent_id: parentId,
        status: GlobalStatus.ACTIVE
      },
      order: { is_main: 'DESC', created_at: 'ASC' }
    });
  }


  async deactivateFile(id: string): Promise<FilesEntity> {
    await this.getById(id);
    await this.filesRepository.update(id, { status: GlobalStatus.INACTIVE });
    return this.getById(id);
  }

  async activateFile(id: string): Promise<FilesEntity> {
    await this.getById(id);
    await this.filesRepository.update(id, { status: GlobalStatus.ACTIVE });
    return this.getById(id);
  }

  /**
   * Actualiza el estado is_main de un archivo existente
   * Si se marca como principal, desmarca otros archivos principales del mismo parent
   */
  async updateFileIsMain(id: string, parentId: string): Promise<FilesEntity> {
    await this.getById(id);
    

      await this.filesRepository
        .createQueryBuilder()
        .update(FilesEntity)
        .set({ is_main: false })
        .where('parent_id = :parentId', { parentId })
        .andWhere('id != :id', { id })
        .execute();
    
    
    await this.filesRepository.update(id, { is_main: true });
    return this.getById(id);
  }


  /**
   * Guarda uno o múltiples archivos con parent_id y parent_type
   * @param data Objeto con parent_id, parent_type y array de archivos
   * @returns Array con los archivos guardados
   */
  async uploadFiles(data: UploadFilesData): Promise<FilesEntity[]> {
    if (!data.files || data.files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    const { parent_id, parent_type, files } = data;

    const savedFiles: FilesEntity[] = [];

    for (const fileData of files) {
      const { file, is_main } = fileData;

      if (!file) {
        throw new BadRequestException('Uno de los archivos no es válido');
      }

      // La validación de tipo y tamaño se hace en el interceptor
      // Generar ID único para el archivo
      const fileId = randomUUID();

      // Usar parent_type como nombre de carpeta (ej: 'product' -> 'products', 'seller' -> 'sellers')
      // La carpeta se creará automáticamente si no existe
      const folderName = this.getFolderName(parent_type);

      // Guardar archivo en el sistema de archivos usando el ID y folderName
      await this.storageService.saveFile(file, fileId, folderName);

      // Construir la ruta completa: carpeta/id.extensión
      const fileExtension = this.getExtensionFromMimeType(file.mimetype);
      const fullPath = `${folderName}/${fileId}${fileExtension}`;

      // Crear entidad con el ID generado y guardar la ruta completa en path_file
      const fileEntity = this.filesRepository.create({
        id: fileId,
        filename: file.originalname,
        mimetype: file.mimetype,
        path_file: fullPath, // Guardamos la ruta completa: carpeta/id.extensión
        parent_id,
        parent_type,
        is_main: is_main || false,
        status: GlobalStatus.ACTIVE,
      });
      
      const savedFile = await this.filesRepository.save(fileEntity);
      savedFiles.push(savedFile);

      // Si el archivo es principal, actualizar el archivo principal y desmarcar los otros archivos principales
      if(is_main) {
        await this.updateFileIsMain(savedFile.id, parent_id);
      }

    }

    return savedFiles;
  }

  async deleteFiles(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }

    // Obtener los archivos antes de eliminarlos para tener sus rutas y mimetypes
    const files = await this.filesRepository.find({
      where: { id: In(ids) },
    });

    // Eliminar archivos físicos y registros de la base de datos
    for (const file of files) {
      try {
        // Extraer folderName y fileId del path_file
        // path_file tiene formato: "folderName/fileId.extension" (ej: "products/uuid.jpg")
        const pathParts = file.path_file.split('/');
        if (pathParts.length === 2) {
          const folderName = pathParts[0];
          const fileNameWithExt = pathParts[1];
          // Extraer el fileId (sin extensión)
          const fileId = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));

          // Eliminar archivo físico
          await this.storageService.deleteFile(fileId, file.mimetype, folderName);
        }
      } catch (error) {
        // Si falla la eliminación del archivo físico, continuar con la eliminación de la BD
        console.error(`Error al eliminar archivo físico ${file.id}:`, error); 
      }

      // Eliminar registro de la base de datos
      await this.filesRepository.delete(file.id);
    }
  }
}

