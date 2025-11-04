import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SellersEntity } from './sellers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CreateSellerDto } from '../auth/dto/create-user.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(SellersEntity)
    private readonly sellersRepository: Repository<SellersEntity>,
  ) {}

  async createSeller(createSellerDto: CreateSellerDto, user_id: string, logoFile?: Express.Multer.File): Promise<SellersEntity> {
    // Extraer solo los campos del seller (excluir campos de usuario como email, password, etc.)
    const { shop_name, description, ruc, business_address } = createSellerDto;
    
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

      // Crear seller con logo
      const seller = this.sellersRepository.create({
        user_id,
        shop_name,
        description,
        ruc,
        business_address,
        logo_image: logoFile.buffer,
      });
      return this.sellersRepository.save(seller);
    }

    // Si no hay archivo, crear normalmente
    const seller = this.sellersRepository.create({
      user_id,
      shop_name,
      description,
      ruc,
      business_address,
    });
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
    
    // Extraer solo los campos del seller (excluir logo_image que viene como File en el DTO)
    const { shop_name, description, ruc, business_address } = updateSellerDto;
    const updateData: Partial<SellersEntity> = {
      shop_name,
      description,
      ruc,
      business_address,
    };
    
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

      // Agregar el buffer de la imagen
      updateData.logo_image = logoFile.buffer;
    }
    
    await this.sellersRepository.update(id, updateData);
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

