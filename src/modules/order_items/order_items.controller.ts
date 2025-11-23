import { Controller, UseGuards } from '@nestjs/common';
import { OrderItemsService } from './order_items.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Items de Orden')
@Controller('order-items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}
}

