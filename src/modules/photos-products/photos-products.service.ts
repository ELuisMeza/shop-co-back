import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PhotosProductsEntity } from './photos-products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePhotoProductDto } from './dto/update-photo.dto';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PhotosProductsService {
  constructor(
    @InjectRepository(PhotosProductsEntity)
    private readonly photosRepository: Repository<PhotosProductsEntity>,
    private readonly productsService: ProductsService,
  ) {}

  async getById(id: string): Promise<PhotosProductsEntity> {
    const photo = await this.photosRepository.findOne({ 
      where: { id },
      relations: ['product']
    });
    if (!photo) {
      throw new NotFoundException('Foto no encontrada');
    }
    return photo;
  }

  async getByProductId(productId: string): Promise<PhotosProductsEntity[]> {
    return this.photosRepository.find({
      where: { 
        product_id: productId,
        status: GlobalStatus.ACTIVE
      },
      order: { is_main: 'DESC', created_at: 'ASC' }
    });
  }

  async updatePhoto(id: string, updatePhotoDto: UpdatePhotoProductDto): Promise<PhotosProductsEntity> {
    const photo = await this.getById(id);

    // Si se está marcando como principal y hay product_id, desmarcar otras fotos principales
    if (updatePhotoDto.is_main === true && photo.product_id) {
      await this.photosRepository
        .createQueryBuilder()
        .update(PhotosProductsEntity)
        .set({ is_main: false })
        .where('product_id = :productId', { productId: photo.product_id })
        .andWhere('is_main = :isMain', { isMain: true })
        .andWhere('id != :id', { id })
        .execute();
    }

    await this.photosRepository.update(id, updatePhotoDto);
    return this.getById(id);
  }


  async deactivatePhoto(id: string): Promise<PhotosProductsEntity> {
    await this.getById(id);
    await this.photosRepository.update(id, { status: GlobalStatus.INACTIVE });
    return this.getById(id);
  }

  async activatePhoto(id: string): Promise<PhotosProductsEntity> {
    await this.getById(id);
    await this.photosRepository.update(id, { status: GlobalStatus.ACTIVE });
    return this.getById(id);
  }

  async uploadStructuredPhotos(
    photosData: Array<{ file: Express.Multer.File; is_main: boolean }>,
    productId?: string,
  ): Promise<PhotosProductsEntity[]> {
    if (!photosData || photosData.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    // Si se proporciona product_id, validar que el producto exista
    if (productId) {
      await this.productsService.getById(productId);
    }

    // Verificar si hay alguna foto marcada como principal
    const hasMainPhoto = photosData.some(photo => photo.is_main);
    if (hasMainPhoto && productId) {
      // Desmarcar otras fotos principales del mismo producto
      await this.photosRepository.update(
        { product_id: productId, is_main: true },
        { is_main: false }
      );
    }

    const photos: PhotosProductsEntity[] = [];

    for (const photoData of photosData) {
      const { file, is_main } = photoData;

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

      const photo = this.photosRepository.create({
        filename: file.originalname,
        mimetype: file.mimetype,
        data: file.buffer,
        ...(productId && { product_id: productId }),
        is_main: is_main,
        status: GlobalStatus.ACTIVE,
      });

      const savedPhoto = await this.photosRepository.save(photo);
      photos.push(savedPhoto);
    }

    return photos;
  }
}

