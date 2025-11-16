import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/modules/auth/dto/request-with-user.interface';

@ApiTags('Carrito')
@Controller('cart-items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @ApiBody({ type: AddCartItemDto })
  @ApiOkResponse({ description: 'Retorna el item actualizado o creado en el carrito' })
  async addProduct(
    @Body() addCartItemDto: AddCartItemDto,
    @Req() req: RequestWithUser,
  ) {
    return this.cartItemsService.addProduct(addCartItemDto, req.user.userId);
  }
  
  @Put('/:product_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar cantidad de producto en el carrito' })
  @ApiParam({ name: 'product_id', description: 'ID del producto a eliminar' })
  @ApiOkResponse({ description: 'Retorna el mensaje de éxito' })
  async updateProductQuantity(@Param('product_id') product_id: string, @Req() req: RequestWithUser, @Body() updateProductQuantityDto: { quantity: number }) {
    return this.cartItemsService.updateProductQuantity(product_id, req.user.userId, updateProductQuantityDto.quantity);
  }
  
  @Get('my-cart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener carrito de compras' })
  @ApiOkResponse({ description: 'Retorna el carrito de compras' })
  async getCartItems(
    @Req() req: RequestWithUser,
  ) {
    return this.cartItemsService.getCartItems(req.user.userId);
  }
  
  @Delete('clear-cart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar todos los productos del carrito' })
  @ApiOkResponse({ description: 'Retorna el mensaje de éxito' })
  async clearCart(@Req() req: RequestWithUser) {
    return this.cartItemsService.removeAllProductsFromCart(req.user.userId);
  }
  
  @Delete('/:product_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar producto del carrito' })
  @ApiParam({ name: 'product_id', description: 'ID del producto a eliminar' })
  async removeProduct(@Param('product_id') product_id: string, @Req() req: RequestWithUser) {
    return this.cartItemsService.removeProduct(product_id, req.user.userId);
  }
}
