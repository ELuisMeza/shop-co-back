import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemsEntity } from './order_items.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItemsEntity)
    private readonly orderItemsRepository: Repository<OrderItemsEntity>,
  ) {}

  async createOrderItem(createOrderItemDto: CreateOrderItemDto, order_id: string) {

    const payload: Partial<OrderItemsEntity> = {
      order_id: order_id,
      product_id: createOrderItemDto.product_id,
      quantity: createOrderItemDto.quantity,
      unit_price: createOrderItemDto.unit_price,
      total_price: createOrderItemDto.unit_price * createOrderItemDto.quantity,
    }

    const orderItem = this.orderItemsRepository.create(payload);
    await this.orderItemsRepository.save(orderItem);
    return orderItem;
  }
}
