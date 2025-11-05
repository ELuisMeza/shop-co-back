import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsEntity } from './products.entity';
import { CategoriesModule } from '../categories/categories.module';
import { SellersModule } from '../sellers/sellers.module';
import { FilesEntity } from '../files/files.entity';
import { ProductCategoriesEntity } from '../product-categories/product-categories.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductsEntity, FilesEntity, ProductCategoriesEntity]),
    SellersModule,
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

