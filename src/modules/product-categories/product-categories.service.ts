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

  async createProductCategories(product_id: string, category_ids: string[]): Promise<ProductCategoriesEntity[]> {
    const productCategories: ProductCategoriesEntity[] = [];

    for (const category_id of category_ids) {
      // Verificar que la categoría existe y está activa
      await this.categoriesService.getByIdAndActive(category_id);

      // Crear la relación
      const productCategory = this.productCategoriesRepository.create({
        product_id,
        category_id,
      });

      const saved = await this.productCategoriesRepository.save(productCategory);
      productCategories.push(saved);
    }

    return productCategories;
  }

  async manageProductCategories(product_id: string, category_ids: string[]): Promise<ProductCategoriesEntity[]> {
    const productCategories = await this.productCategoriesRepository.find({ where: { product_id } });
    
    const newCategories = category_ids.filter(category_id => !productCategories.some(pc => pc.category_id === category_id));
    
    const deletedCategories = productCategories.filter(pc => !category_ids.includes(pc.category_id));

    for (const category of deletedCategories) {
      await this.productCategoriesRepository.delete({ product_id, category_id: category.category_id });
    }

    for (const category_id of newCategories) {
      await this.categoriesService.getByIdAndActive(category_id);

      const productCategory = this.productCategoriesRepository.create({
        product_id,
        category_id,
      });
      await this.productCategoriesRepository.save(productCategory);
    }

    return await this.productCategoriesRepository.find({ where: { product_id } });
  }
}

