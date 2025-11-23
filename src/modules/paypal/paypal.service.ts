import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderRequest, OrdersController } from '@paypal/paypal-server-sdk';
import { paypalClient } from './paypal.client';

@Injectable()
export class PaypalService {
  private ordersController: OrdersController;

  constructor() {
    this.ordersController = new OrdersController(paypalClient);
  }

  async createOrderPaypal(orderData: OrderRequest) {

    try {
      const response = await this.ordersController.createOrder({
        body: orderData,
        prefer: 'return=representation'
      });

      return response.result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async captureOrder(orderId: string) {
    const response = await this.ordersController.captureOrder({
      id: orderId,
      prefer: 'return=representation'
    });

    const capture = response?.result?.purchaseUnits?.[0]?.payments?.captures?.[0];

    return {
      orderId: response?.result?.id,
      status: response?.result?.status,
      captureId: capture?.id,
      captureStatus: capture?.status,
      amount: capture?.amount,
      payer: response?.result?.payer,
      createTime: capture?.createTime,
      updateTime: capture?.updateTime
    };
  }

  async getOrder(orderId: string) {
    const response = await this.ordersController.getOrder({
      id: orderId
    });

    return {
      orderId: response?.result?.id,
      status: response?.result?.status,
      intent: response?.result?.intent,
      payer: response?.result?.payer,
      purchaseUnits: response?.result?.purchaseUnits,
      createTime: response?.result?.createTime,
      updateTime: response?.result?.updateTime,
      links: response?.result?.links
    };
  }
}
