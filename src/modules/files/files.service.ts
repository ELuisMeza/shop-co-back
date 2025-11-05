import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FilesEntity } from './files.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateFileDto } from './dto/update-file.dto';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { UploadFilesData } from './dto/files.dto';
import { StorageService } from './storage.service';

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
   * Obtiene el buffer del archivo desde el sistema de archivos
   * @param id ID del archivo
   * @returns Buffer del archivo
   */
  async getFileBuffer(id: string): Promise<Buffer> {
    const file = await this.getById(id);
    if (!file.path_file) {
      throw new NotFoundException('Ruta del archivo no encontrada');
    }
    return this.storageService.getFile(file.path_file);
  }

  async getByParentIdAndActive(parentId: string, parentType: string): Promise<FilesEntity[]> {
    return this.filesRepository.find({
      where: { 
        parent_id: parentId,
        parent_type: parentType,
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
   * Guarda uno o múltiples archivos con parent_id y parent_type
   * @param data Objeto con parent_id, parent_type y array de archivos
   * @returns Array con los archivos guardados
   */
  async uploadFiles(data: UploadFilesData): Promise<FilesEntity[]> {
    if (!data.files || data.files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    const { parent_id, parent_type, files } = data;

    // Verificar si hay algún archivo marcado como principal
    const hasMainFile = files.some(fileData => fileData.is_main === true);
    if (hasMainFile) {
      // Desmarcar otros archivos principales del mismo parent
      await this.filesRepository.update(
        { parent_id, parent_type, is_main: true },
        { is_main: false }
      );
    }

    const savedFiles: FilesEntity[] = [];

    for (const fileData of files) {
      const { file, is_main } = fileData;

      if (!file) {
        throw new BadRequestException('Uno de los archivos no es válido');
      }

      // Validar que sea una imagen
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `El archivo ${file.originalname} debe ser una imagen (JPEG, PNG, GIF, WEBP)`
        );
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          `El archivo ${file.originalname} no puede ser mayor a 10MB`
        );
      }

      // Guardar archivo en el sistema de archivos
      const filePath = await this.storageService.saveFile(file, parent_id);

      const fileEntity = this.filesRepository.create({
        filename: file.originalname,
        mimetype: file.mimetype,
        path_file: filePath,
        parent_id,
        parent_type,
        is_main: is_main || false,
        status: GlobalStatus.ACTIVE,
      });

      const savedFile = await this.filesRepository.save(fileEntity);
      savedFiles.push(savedFile);
    }

    return savedFiles;
  }
}

