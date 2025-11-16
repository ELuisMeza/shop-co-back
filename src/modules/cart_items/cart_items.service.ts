import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItemsEntity } from './cart_items.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItemsEntity)
    private readonly cartItemsRepository: Repository<CartItemsEntity>,
    private readonly productsService: ProductsService,
  ) {}

  async addProduct(payload: AddCartItemDto, user_id: string): Promise<CartItemsEntity> {
    const { product_id, quantity = 1 } = payload;

    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    const product = await this.productsService.getProductToAddCart(product_id);

    if (product.stock < quantity) {
      throw new BadRequestException('El producto no tiene suficiente stock');
    }

    const existingItem = await this.cartItemsRepository.findOne({
      where: { user_id, product_id },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      return this.cartItemsRepository.save(existingItem);
    }

    const newItem = this.cartItemsRepository.create({
      user_id,
      product_id,
      quantity,
    });

    return this.cartItemsRepository.save(newItem);
  }

  async removeProduct(product_id: string, user_id: string): Promise<{ message: string }> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { user_id, product_id },
    });

    if (!cartItem) {
      throw new NotFoundException('El producto no se encuentra en el carrito');
    }

    try {
      await this.cartItemsRepository.remove(cartItem);
      return { message: 'Producto eliminado del carrito' };
    } catch (error) {
      throw new BadRequestException('Error al eliminar el producto del carrito');
    }

  }

  async getCartItems(user_id: string) {
    return this.cartItemsRepository
      .createQueryBuilder('cart_items')
      .leftJoin('products', 'p', 'p.id = cart_items.product_id')
      .leftJoin('files', 'f', 'f.parent_id = p.id AND f.is_main = true')
      .where('cart_items.user_id = :user_id', { user_id }) 
      .select([
        'p.id AS product_id',
        'p.name AS product_name',
        'p.price AS product_price',
        'p.stock AS product_stock',
        'f.path_file AS file_path',
        'cart_items.quantity AS quantity',
      ])
      .getRawMany();
  }
  
  async updateProductQuantity(product_id: string, user_id: string, quantity: number): Promise<{ message: string }> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { user_id, product_id },
    });

    if (!cartItem) {
      throw new NotFoundException('El producto no se encuentra en el carrito');
    }

    cartItem.quantity = quantity;
    await this.cartItemsRepository.save(cartItem);
    return { message: 'Cantidad actualizada del producto en el carrito' };
  }

  async removeAllProductsFromCart(user_id: string): Promise<{ message: string }> {
    await this.cartItemsRepository.delete({ user_id });
    return { message: 'Todos los productos han sido eliminados del carrito' };
  }
}
