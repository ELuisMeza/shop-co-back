import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SellersEntity } from './sellers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CreateSellerDto } from '../auth/dto/create-user.dto';
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

  async createSeller(createSellerDto: CreateSellerDto, user_id: string, logoFile?: Express.Multer.File): Promise<SellersEntity> {
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

  async getByUserId(userId: string): Promise<SellersEntity> {
    const seller = await this.sellersRepository.findOne({ where: { user_id: userId } });
    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado');
    }
    return seller;
  }

  async updateSeller(id: string, updateSellerDto: UpdateSellerDto): Promise<SellersEntity> {
    const seller = await this.getById(id);
    
    // Extraer solo los campos del seller (excluir logo_image que viene como File en el DTO)
    const { shop_name, description, ruc, business_address } = updateSellerDto;
    const updateData: Partial<SellersEntity> = {
      shop_name,
      description,
      ruc,
      business_address,
    };
    
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

