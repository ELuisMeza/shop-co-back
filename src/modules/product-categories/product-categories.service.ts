import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ProductCategoriesEntity } from './product-categories.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { CategoriesEntity } from '../categories/categories.entity';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategoriesEntity)
    private readonly productCategoriesRepository: Repository<ProductCategoriesEntity>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async getCategoriesByProductId(product_id: string): Promise<CategoriesEntity[]> {
    const categories = await this.productCategoriesRepository.find({ where: { product_id }, relations: ['category'] });
    return categories.map(category => category.category);
  }
}

