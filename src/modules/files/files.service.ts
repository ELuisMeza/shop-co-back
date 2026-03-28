import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FilesEntity } from './files.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GlobalStatus } from '../../globals/enums/global-status.enum';
import { UploadFilesData } from './dto/files.dto';
import { CloudinaryUploadService } from '../../cloudinary/cloudinary-upload.service';
import { CloudinaryDeleteService } from '../../cloudinary/cloudinary-delete.service';
import { toDeliveryUrl } from '../../cloudinary/cloudinary-delivery';
import { randomUUID } from 'crypto';
import { GlobalTypesFiles } from '../../globals/enums/global-types-files';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FilesEntity)
    private readonly filesRepository: Repository<FilesEntity>,
    private readonly cloudinaryUploadService: CloudinaryUploadService,
    private readonly cloudinaryDeleteService: CloudinaryDeleteService,
  ) {}

  private mapFileUrl(file: FilesEntity): FilesEntity {
    return {
      ...file,
      path_file: toDeliveryUrl(file.path_file) ?? file.path_file,
    };
  }

  async getById(id: string): Promise<FilesEntity> {
    const file = await this.filesRepository.findOne({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return this.mapFileUrl(file);
  }

  /**
   * Convierte el parent_type en un nombre de carpeta
   * @param parentType Tipo de parent (product, seller, etc.)
   * @returns Nombre de la carpeta (products, sellers, etc.)
   */
  private getFolderName(parentType: string): string {
    const folderMap: { [key: string]: string } = {
      [GlobalTypesFiles.PRODUCT]: GlobalTypesFiles.PRODUCT,
      [GlobalTypesFiles.SELLER]: GlobalTypesFiles.SELLER,
    };
    return folderMap[parentType] || parentType;
  }

  async getByParentIdAndActive(parentId: string): Promise<FilesEntity[]> {
    const list = await this.filesRepository.find({
      where: {
        parent_id: parentId,
        status: GlobalStatus.ACTIVE,
      },
      order: { is_main: 'DESC', created_at: 'ASC' },
    });
    return list.map((f) => this.mapFileUrl(f));
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

      const fileId = randomUUID();
      const folderName = this.getFolderName(parent_type);

      const { publicId } = await this.cloudinaryUploadService.uploadImage(
        file,
        folderName,
        fileId,
      );

      const fileEntity = this.filesRepository.create({
        id: fileId,
        filename: file.originalname,
        mimetype: file.mimetype,
        path_file: publicId,
        parent_id,
        parent_type,
        is_main: is_main || false,
        status: GlobalStatus.ACTIVE,
      });

      const savedFile = await this.filesRepository.save(fileEntity);
      savedFiles.push(savedFile);

      if (is_main) {
        await this.updateFileIsMain(savedFile.id, parent_id);
      }
    }

    return savedFiles.map((f) => this.mapFileUrl(f));
  }

  async deleteFiles(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }

    const files = await this.filesRepository.find({
      where: { id: In(ids) },
    });

    for (const file of files) {
      try {
        await this.cloudinaryDeleteService.deleteImage(file.path_file);
      } catch (error) {
        console.error(`Error al eliminar imagen en Cloudinary ${file.id}:`, error);
      }

      await this.filesRepository.delete(file.id);
    }
  }
}
