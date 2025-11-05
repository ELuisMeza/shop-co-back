import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductCategoriesEntity } from './product-categories.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategoriesEntity)
    private readonly productCategoriesRepository: Repository<ProductCategoriesEntity>,
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

}

