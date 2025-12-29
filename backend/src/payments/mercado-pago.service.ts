import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MercadoPagoService {
  async createPreference(data: {
    appointmentId: string;
    price: number;
    description: string;
    payerEmail: string;
    expiresAt: Date;
  }): Promise<string> {
    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      {
        items: [
          {
            title: data.description,
            quantity: 1,
            unit_price: Number(data.price),
          },
        ],
        payer: {
          email: data.payerEmail,
        },
        external_reference: data.appointmentId,
        expiration_date_to: data.expiresAt.toISOString(),
        notification_url: `${process.env.BACKEND_URL}/webhooks/mercadopago`,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      },
    );

    return response.data.init_point;
  }

  async getPayment(paymentId: string) {
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      },
    );

    return response.data;
  }
}
