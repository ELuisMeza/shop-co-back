import { Module } from '@nestjs/common';
import { PhotosProductsService } from './photos-products.service';
import { PhotosProductsController } from './photos-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosProductsEntity } from './photos-products.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PhotosProductsEntity]),
    ProductsModule,
  ],
  controllers: [PhotosProductsController],
  providers: [PhotosProductsService],
  exports: [PhotosProductsService],
})
export class PhotosProductsModule {}

