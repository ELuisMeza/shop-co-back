import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiExtraModels, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import type { RequestWithUser } from '../auth/dto/request-with-user.interface';
import { CreateOrderItemDto } from '../order_items/dto/create-order-item.dto';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiExtraModels(CreateOrderItemDto)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una orden' })
  @ApiBody({ type: CreateOrderDto })
  @ApiOkResponse({ description: 'Retorna la orden creada' })
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: RequestWithUser) {
    return this.ordersService.createOrderPending(createOrderDto, req.user.userId);
  }

  @Post('capture/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Capturar orden después del pago en PayPal' })
  @ApiParam({ name: 'token', description: 'Token de la orden de PayPal (orderId)', required: false })
  @ApiOkResponse({ description: 'Orden capturada exitosamente' })
  async captureOrder(@Param('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token no proporcionado');
    }

    return this.ordersService.captureOrder(token);
  }

  @Get('buyer/my-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las ordenes del usuario' })
  @ApiOkResponse({ description: 'Retorna todas las ordenes del usuario' })
  async getBuyerOrders(@Req() req: RequestWithUser) {
    return this.ordersService.getMyOrdersBuyer(req.user.userId);
  }

  @Get('seller/my-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las ordenes del vendedor' })
  @ApiOkResponse({ description: 'Retorna todas las ordenes del vendedor' })
  async getSellerOrders(@Req() req: RequestWithUser) {
    return this.ordersService.getSellerOrders(req.user.userId);
  }
}
