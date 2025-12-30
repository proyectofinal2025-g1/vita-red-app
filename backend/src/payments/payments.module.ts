import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MercadoPagoService } from './mercado-pago.service';
import { AppointmentsModule } from '../appointments/appointments.module';
import { MercadoPagoWebhookController } from './webhooks/mercado-pago-webhook.controller';
import { MercadoPagoWebhookService } from './webhooks/mercado-pago-webhook.service';
import { PaymentsRepository } from './payments.repository';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), AppointmentsModule],
  controllers: [PaymentsController, MercadoPagoWebhookController],
  providers: [PaymentsService, MercadoPagoService, MercadoPagoWebhookService],
})
export class PaymentsModule {}
