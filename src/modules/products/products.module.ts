import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsEntity } from './products.entity';
import { CategoriesModule } from '../categories/categories.module';
import { SellersModule } from '../sellers/sellers.module';
import { FilesEntity } from '../files/files.entity';
import { FilesModule } from '../files/files.module';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductsEntity, FilesEntity]),
    SellersModule,
    CategoriesModule,
    FilesModule,
    forwardRef(() => ProductCategoriesModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

