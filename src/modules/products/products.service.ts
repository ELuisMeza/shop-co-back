import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsEntity } from './products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<ProductsEntity> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async getByIdAndActive(id: string): Promise<ProductsEntity> {
    const product = await this.productsRepository.findOne({ 
      where: { id, status: GlobalStatus.ACTIVE },
      relations: ['seller', 'category']
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado o inactivo');
    }
    return product;
  }

  async getById(id: string): Promise<ProductsEntity> {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['seller', 'category']
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<ProductsEntity> {
    const product = await this.getById(id);
    await this.productsRepository.update(id, updateProductDto);
    return this.getById(id);
  }

}

