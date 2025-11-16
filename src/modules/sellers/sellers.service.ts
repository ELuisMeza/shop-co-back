import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SellersEntity } from './sellers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CreateUserSellerDto } from '../auth/dto/create-user.dto';
import { FilesService } from '../files/files.service';
import { UploadFilesData } from '../files/dto/files.dto';
import { GlobalTypesFiles } from 'src/globals/enums/global-types-files';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(SellersEntity)
    private readonly sellersRepository: Repository<SellersEntity>,
    private readonly filesService: FilesService,
  ) {}

  async createSeller(createSellerDto: CreateUserSellerDto, user_id: string, logoFile?: Express.Multer.File): Promise<SellersEntity> {
    // Extraer solo los campos del seller (excluir campos de usuario como email, password, etc.)
    const { shop_name, description, ruc, business_address } = createSellerDto;
    
    const seller = this.sellersRepository.create({
      user_id,
      shop_name,
      description,
      ruc,
      business_address,
    });

    const savedSeller = await this.sellersRepository.save(seller);
    
    if (logoFile) {

      const payload: UploadFilesData = {
        parent_id: savedSeller.id,
        parent_type: GlobalTypesFiles.SELLER,
        files: [{
          file: logoFile,
          is_main: false,
        }],
      };

      await this.filesService.uploadFiles(payload);
    }
    
    return savedSeller;
  }

  async getById(id: string): Promise<SellersEntity> {
    const seller = await this.sellersRepository.findOne({ where: { id }, relations: ['user'] });
    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado');
    }
    return seller;
  }

  async getByUserId(userId: string) {
    const seller = await this.sellersRepository.findOne({ where: { user_id: userId } });

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    const files = await this.filesService.getByParentIdAndActive(seller.id);
    return {
      ...seller,
      logo_image_path: files[0].path_file,
    };
  }

  async updateSeller(id: string, updateSellerDto: UpdateSellerDto, logoFile?: Express.Multer.File) {
    const seller = await this.getById(id);
    const { shop_name, description, business_address } = updateSellerDto;
    const updateData: Partial<SellersEntity> = {};
    
    // Solo agregar campos que tienen valores definidos
    if (shop_name !== undefined) {
      updateData.shop_name = shop_name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (business_address !== undefined) {
      updateData.business_address = business_address;
    }
    
    // Solo hacer update si hay campos para actualizar
    if (Object.keys(updateData).length > 0) {
      await this.sellersRepository.update(id, updateData);
    }

    console.log('se actualizo el seller');


    if (logoFile) {
      const files = await this.filesService.getByParentIdAndActive(seller.id);
      if (files.length > 0) {
        await this.filesService.deleteFiles([files[0].id]);
      }
      const payload: UploadFilesData = {
        parent_id: seller.id,
        parent_type: GlobalTypesFiles.SELLER,
        files: [{
          file: logoFile,
          is_main: true,
        }],
      };
      await this.filesService.uploadFiles(payload);
    }

    const updatedSeller = await this.getById(id);
    const files = await this.filesService.getByParentIdAndActive(updatedSeller.id);
    return {
      ...updatedSeller,
      logo_image_path: files[0].path_file,
    };
  }

  async userIsSeller(userId: string): Promise<SellersEntity> {
    const seller = await this.sellersRepository.findOne({ where: { user_id: userId } });
    if (!seller) {
      throw new NotFoundException('El usuario no es vendedor');
    }
    return seller;
  }
}

