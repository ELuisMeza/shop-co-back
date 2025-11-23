import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersEntity } from './orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaypalService } from '../paypal/paypal.service';
import { OrderItemsService } from '../order_items/order_items.service';
import { CheckoutPaymentIntent, Order, OrderRequest, OrderTrackerStatus, PaymentTokenStatus, OrderApplicationContext } from '@paypal/paypal-server-sdk';
import { CartItemsService } from '../cart_items/cart_items.service';
import { UsersService } from '../users/users.service';
import { SellersService } from '../sellers/sellers.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {

  private readonly frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(OrdersEntity)
    private readonly ordersRepository: Repository<OrdersEntity>,
    private readonly paypalService: PaypalService,
    private readonly orderItemsService: OrderItemsService,
    private readonly cartItemsService: CartItemsService,
    private readonly usersService: UsersService,
    private readonly sellersService: SellersService,
    private readonly productsService: ProductsService,
  ) {}

  async createOrderPending(createOrderDto: CreateOrderDto, buyer_id: string) {
    const returnUrl = `${this.frontendUrl}/buyer/confirm-order`;

    const paypalOrderRequest: OrderRequest = {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: createOrderDto.items.map((item, index) => ({
        referenceId: `PRO_${index + 1}`,
        amount: {
            currencyCode: createOrderDto.currency,
            value: (item.quantity * item.unit_price).toString(),
        },
      })),
      applicationContext: {
        returnUrl: returnUrl,
        cancelUrl: `${this.frontendUrl}/checkout/error`,
      } as OrderApplicationContext,
    };

    const paypalOrder = await this.paypalService.createOrderPaypal(paypalOrderRequest);

    await this.createOrder(createOrderDto, paypalOrder, buyer_id, createOrderDto.currency);

    return {
      link: paypalOrder.links?.find(link => link.rel === 'approve')?.href,
      orderId: paypalOrder.id,
    };
  }

  async createOrder(createOrderDto: CreateOrderDto, paypalOrder: Order, buyer_id: string, currency: string) {
    const order = this.ordersRepository.create({
      buyer_id: buyer_id,
      paypal_order_id: paypalOrder.id,
      currency: currency,
      total_amount: createOrderDto.items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0),
      status: OrderTrackerStatus.Shipped,
      payment_status: PaymentTokenStatus.Created,
    });
    await this.ordersRepository.save(order);

    createOrderDto.items.forEach(async (item) => {
      await this.orderItemsService.createOrderItem({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }, order.id);
    });
  }

  async captureOrder(orderId: string) {

    const order = await this.ordersRepository.findOne({
      where: { paypal_order_id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`No se encontró ninguna orden`);
    }

    if (order.payment_status === PaymentTokenStatus.Approved) {
      throw new BadRequestException(`La orden ya ha sido capturada`);
    }

    const captureResult = await this.paypalService.captureOrder(orderId);

    if (captureResult.status !== 'COMPLETED') {
      throw new BadRequestException(`La orden no se pudo completar. Estado: ${captureResult.status}`);
    }

    order.payment_status = PaymentTokenStatus.Approved;
    order.status = OrderTrackerStatus.Shipped;
    if (captureResult.captureId) {
      order.payment_id = captureResult.captureId;
    }
    order.paid_at = new Date();
    await this.ordersRepository.save(order);
    
    const orderItems = await this.orderItemsService.getOrderItemsByOrderId(order.id);
    
    orderItems.forEach(async (item) => {
      await this.productsService.reduceStock(item.product_id, item.quantity);
      await this.sellersService.increaseSales(item.product.seller_id, item.quantity, item.total_price);
    });

    await this.cartItemsService.removeAllProductsFromCart(order.buyer_id);

    return {
      success: true,
      orderId: orderId,
      captureId: captureResult.captureId,
      status: captureResult.status,
      order: {
        id: order.id,
        total_amount: order.total_amount.toString(),
        currency: order.currency,
      },
    };
  }

  async getMyOrdersBuyer(buyer_id: string) {

      const user = await this.usersService.getById(buyer_id);
      if(user.role.name !== 'buyer') {
        throw new BadRequestException('El usuario no es un comprador');
      }

    const rawResults = await this.ordersRepository.createQueryBuilder('o')
      .select([
        'o.id as order_id',
        'o.paypal_order_id as paypal_id',
        'o.payment_id as payment_id',
        'o.paid_at as paid_at',
        'o.created_at as created_at',
        'oi.id as order_item_id',
        's.shop_name as seller_name',
        'p.name as product_name',
        'oi.quantity as quantity',
        'oi.unit_price as unit_price',
        'oi.total_price as total_price',
      ])
      .leftJoin('order_items', 'oi', 'oi.order_id = o.id')
      .leftJoin('products', 'p', 'p.id = oi.product_id')
      .leftJoin('sellers', 's', 's.id = p.seller_id')
      .where('o.buyer_id = :buyer_id', { buyer_id })
      .andWhere('o.status = :status', { status: OrderTrackerStatus.Shipped })
      .andWhere('o.payment_status = :payment_status', { payment_status: PaymentTokenStatus.Approved })
      .orderBy('o.created_at', 'DESC')
      .getRawMany();

    // Agrupar por order_id
    const groupedOrders = rawResults.reduce((acc, row) => {
      const orderId = row.order_id;
      
      if (!acc[orderId]) {
        acc[orderId] = {
          order_id: row.order_id,
          paypal_id: row.paypal_id,
          payment_id: row.payment_id,
          total_amount: 0,
          paid_at: row.paid_at,
          created_at: row.created_at,
          items: [],
        };
      }

      // Solo agregar item si existe order_item_id (evita duplicados cuando no hay items)
      if (row.order_item_id) {
        acc[orderId].items.push({
          order_item_id: row.order_item_id,
          seller_name: row.seller_name,
          product_name: row.product_name,
          quantity: row.quantity,
          unit_price: row.unit_price,
          total_price: row.total_price,
        });
        // Sumar el total_price al total_amount
        acc[orderId].total_amount += parseFloat(row.total_price) || 0;
      }

      return acc;
    }, {});

    return Object.values(groupedOrders);
  }

  async getSellerOrders(user_id: string) {
    const seller = await this.sellersService.getByUserId(user_id);

  const rawResults = await this.ordersRepository.createQueryBuilder('o')
    .select([
      'o.id as order_id',
      'o.paypal_order_id as paypal_id',
      'o.payment_id as payment_id',
      'o.paid_at as paid_at',
      'o.created_at as created_at',
      'oi.id as order_item_id',
      'u.name as buyer_name',
      'p.name as product_name',
      'oi.quantity as quantity',
      'oi.unit_price as unit_price',
      'oi.total_price as total_price',
    ])
    .leftJoin('order_items', 'oi', 'oi.order_id = o.id')
    .leftJoin('products', 'p', 'p.id = oi.product_id')
    .leftJoin('sellers', 's', 's.id = p.seller_id')
    .leftJoin('users', 'u', 'u.id = o.buyer_id')
    .where('s.id = :seller_id', { seller_id: seller.id })
    .andWhere('o.status = :status', { status: OrderTrackerStatus.Shipped })
    .andWhere('o.payment_status = :payment_status', { payment_status: PaymentTokenStatus.Approved })
    .orderBy('o.created_at', 'DESC')
    .getRawMany();

  // Agrupar por order_id
  const groupedOrders = rawResults.reduce((acc, row) => {
    const orderId = row.order_id;
    
    if (!acc[orderId]) {
      acc[orderId] = {
        order_id: row.order_id,
        paypal_id: row.paypal_id,
        payment_id: row.payment_id,
        total_amount: 0,
        paid_at: row.paid_at,
        created_at: row.created_at,
        items: [],
      };
    }

    // Solo agregar item si existe order_item_id (evita duplicados cuando no hay items)
    if (row.order_item_id) {
      acc[orderId].items.push({
        order_item_id: row.order_item_id,
        buyer_name: row.buyer_name,
        product_name: row.product_name,
        quantity: row.quantity,
        unit_price: row.unit_price,
        total_price: row.total_price,
      });
      // Sumar el total_price al total_amount
      acc[orderId].total_amount += parseFloat(row.total_price) || 0;
    }

    return acc;
  }, {});

  return Object.values(groupedOrders);
  }
}
