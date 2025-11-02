import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsEntity } from './products.entity';
import { CategoriesModule } from '../categories/categories.module';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsEntity]), SellersModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

