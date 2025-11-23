import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersEntity } from './orders.entity';
import { PaypalModule } from '../paypal/paypal.module';
import { OrderItemsModule } from '../order_items/order_items.module';
import { CartItemsModule } from '../cart_items/cart_items.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrdersEntity]), PaypalModule, OrderItemsModule, CartItemsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
