import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersEntity } from './orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaypalService } from '../paypal/paypal.service';
import { OrderItemsService } from '../order_items/order_items.service';
import { CheckoutPaymentIntent, Order, OrderRequest, OrderTrackerStatus, PaymentTokenStatus, OrderApplicationContext } from '@paypal/paypal-server-sdk';
import { CartItemsService } from '../cart_items/cart_items.service';

@Injectable()
export class OrdersService {

  private readonly frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(OrdersEntity)
    private readonly ordersRepository: Repository<OrdersEntity>,
    private readonly paypalService: PaypalService,
    private readonly orderItemsService: OrderItemsService,
    private readonly cartItemsService: CartItemsService,
  ) {}

  async createOrderPending(createOrderDto: CreateOrderDto, buyer_id: string) {
    // PayPal redirigirá aquí después del pago, añadiendo automáticamente ?token=...&PayerID=...
    const returnUrl = `${this.frontendUrl}/store/cart/order`;

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
}
