import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MercadoPagoService } from '../mercado-pago.service';
import { PaymentsService } from '../payments.service';
import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

@Injectable()
export class MercadoPagoWebhookService {
  private readonly logger = new Logger(MercadoPagoWebhookService.name);

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly paymentsService: PaymentsService,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async handle(rawBody: Buffer): Promise<void> {
    try {
      const body = JSON.parse(rawBody.toString());

      // Solo procesamos eventos de pago
      if (body.type !== 'payment') return;

      const paymentId = body.data?.id;
      if (!paymentId) return;

      // Fuente de verdad: API de Mercado Pago
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      if (payment.status !== 'approved') {
        this.logger.warn(
          `Webhook MP ignorado | paymentId=${paymentId} | status=${payment.status}`,
        );
        return;
      }

      if (!payment.external_reference) {
        this.logger.warn(
          `Pago aprobado sin external_reference | paymentId=${paymentId}`,
        );
        return;
      }

      const externalPaymentId = payment.id.toString();
      const appointmentId = payment.external_reference;

      // Idempotencia
      const existingPayment = await this.paymentsRepository.findOne({
        where: { externalPaymentId },
      });

      if (existingPayment) {
        // Solo actualizamos si aún no tenía fecha de pago
        if (!existingPayment.paidAt) {
          existingPayment.status = PaymentStatus.APPROVED;
          existingPayment.paidAt = new Date(payment.date_approved);
          existingPayment.amount = payment.transaction_amount;

          await this.paymentsRepository.save(existingPayment);

          this.logger.log(`Pago actualizado | paymentId=${externalPaymentId}`);
        }

        return;
      }

      // Confirmación final (turno + pago)
      await this.paymentsService.processApprovedPayment({
        appointmentId,
        externalPaymentId,
        amount: payment.transaction_amount,
        paidAt: new Date(payment.date_approved),
      });

      this.logger.log(
        `Pago confirmado | paymentId=${externalPaymentId} | appointmentId=${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        'Error procesando webhook de Mercado Pago',
        error.stack,
      );
    }
  }
}
