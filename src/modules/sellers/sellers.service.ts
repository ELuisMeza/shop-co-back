import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SellersEntity } from './sellers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(SellersEntity)
    private readonly sellersRepository: Repository<SellersEntity>,
  ) {}

  async createSeller(createSellerDto: CreateSellerDto, logoFile?: Express.Multer.File): Promise<SellersEntity> {
    // Si se envía un archivo, validar y procesar
    if (logoFile) {
      // Validar que sea una imagen
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(logoFile.mimetype)) {
        throw new BadRequestException('El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP)');
      }

      // Validar tamaño (máximo 5MB para logos)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (logoFile.size > maxSize) {
        throw new BadRequestException('El archivo no puede ser mayor a 5MB');
      }

      // Agregar el buffer de la imagen al DTO
      const sellerData = {
        ...createSellerDto,
        logo_image: logoFile.buffer,
      };
      const seller = this.sellersRepository.create(sellerData);
      return this.sellersRepository.save(seller);
    }

    // Si no hay archivo, crear normalmente
    const seller = this.sellersRepository.create(createSellerDto);
    return this.sellersRepository.save(seller);
  }

  async getById(id: string): Promise<SellersEntity> {
    const seller = await this.sellersRepository.findOne({ where: { id }, relations: ['user'] });
    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado');
    }
    return seller;
  }

  async updateSeller(id: string, updateSellerDto: UpdateSellerDto, logoFile?: Express.Multer.File): Promise<SellersEntity> {
    const seller = await this.getById(id);
    
    // Si se envía un archivo, validar y procesar
    if (logoFile) {
      // Validar que sea una imagen
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(logoFile.mimetype)) {
        throw new BadRequestException('El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP)');
      }

      // Validar tamaño (máximo 5MB para logos)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (logoFile.size > maxSize) {
        throw new BadRequestException('El archivo no puede ser mayor a 5MB');
      }

      // Agregar el buffer de la imagen al DTO
      const updateData = {
        ...updateSellerDto,
        logo_image: logoFile.buffer,
      };
      await this.sellersRepository.update(id, updateData);
    } else {
      // Si no hay archivo, actualizar normalmente (sin modificar logo_image si no viene en el DTO)
      await this.sellersRepository.update(id, updateSellerDto);
    }
    
    return this.getById(id);
  }

  async userIsSeller(userId: string): Promise<SellersEntity> {
    const seller = await this.sellersRepository.findOne({ where: { user_id: userId } });
    if (!seller) {
      throw new NotFoundException('El usuario no es vendedor');
    }
    return seller;
  }
}

