import { Injectable, Logger } from '@nestjs/common';

import { MercadoPagoService } from '../mercado-pago.service';
import { PaymentsService } from '../payments.service';

@Injectable()
export class MercadoPagoWebhookService {
  private readonly logger = new Logger(MercadoPagoWebhookService.name);

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async handle(rawBody: Buffer): Promise<void> {
    try {
      const body = JSON.parse(rawBody.toString());

      this.logger.log(`Webhook recibido | topic=${body.topic}`);

      // SOLO merchant_order
      if (body.topic !== 'merchant_order') {
        this.logger.warn('Webhook ignorado (no merchant_order)');
        return;
      }

      const merchantOrderId = body.id || body.resource?.split('/').pop();
      if (!merchantOrderId) {
        this.logger.warn('merchant_order sin id');
        return;
      }

      // Fuente de verdad
      const merchantOrder =
        await this.mercadoPagoService.getMerchantOrder(merchantOrderId);

      const approvedPayment = merchantOrder.payments?.find(
        (p) => p.status === 'approved',
      );

      if (!approvedPayment) {
        this.logger.warn(
          `Merchant order ${merchantOrderId} sin pagos aprobados`,
        );
        return;
      }

      const appointmentId = merchantOrder.external_reference;
      if (!appointmentId) {
        this.logger.warn(
          `Pago aprobado sin external_reference | paymentId=${approvedPayment.id}`,
        );
        return;
      }

      await this.paymentsService.processApprovedPayment({
        appointmentId,
        externalPaymentId: approvedPayment.id.toString(),
        amount: approvedPayment.transaction_amount,
        paidAt: new Date(approvedPayment.date_approved),
      });

      this.logger.log(
        `Pago confirmado | paymentId=${approvedPayment.id} | appointmentId=${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Error procesando webhook Mercado Pago',
        error.stack,
      );
    }
  }
}
