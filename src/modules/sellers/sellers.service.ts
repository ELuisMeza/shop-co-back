import { Injectable, NotFoundException } from '@nestjs/common';
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

  async createSeller(createSellerDto: CreateSellerDto): Promise<SellersEntity> {
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

  async updateSeller(id: string, updateSellerDto: UpdateSellerDto): Promise<SellersEntity> {
    const seller = await this.getById(id);
    await this.sellersRepository.update(id, updateSellerDto);
    return this.getById(id);
  }

}

