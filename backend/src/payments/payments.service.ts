import { Injectable, BadRequestException } from '@nestjs/common';
import { AppointmentsService } from '../appointments/appointments.service';
import { AppointmentsRepository } from '../appointments/appointments.repository';
import { MercadoPagoService } from './mercado-pago.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { ResponsePaymentDto } from './dto/response-payment.dto';

import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { PaymentsRepository } from './payments.repository';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentTimeHelper } from '../appointments/utils/appointment-time.helper';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  async createPreference(dto: CreatePaymentDto): Promise<ResponsePaymentDto> {
    const appointment = await this.appointmentsService.findPreReservedById(
      dto.appointmentId,
    );

    const nowUtc = new Date();
    const expiresAtUtc = new Date(appointment.expiresAt);

    const diffSeconds = (expiresAtUtc.getTime() - nowUtc.getTime()) / 1000;

    const BLOCK_SECONDS = 60;

    if (diffSeconds <= BLOCK_SECONDS) {
      throw new BadRequestException(
        'El turno está por expirar. No se puede iniciar el pago.',
      );
    }

    const existingPayment =
      await this.paymentsRepository.findPendingByAppointmentId(appointment.id);

    if (existingPayment?.initPoint) {
      return { initPoint: existingPayment.initPoint };
    }

    const description = appointment.speciality
      ? `Consulta médica - ${appointment.speciality.name}`
      : 'Consulta médica';

    const mpPreference = await this.mercadoPagoService.createPreference({
      appointmentId: appointment.id,
      price: appointment.priceAtBooking,
      description,
      payerEmail: appointment.patient.email,
      expiresAt: appointment.expiresAt,
    });

    const payment = this.paymentsRepository.create({
      appointment: { id: appointment.id } as Appointment,
      provider: 'MERCADO_PAGO',
      status: PaymentStatus.PENDING,
      amount: appointment.priceAtBooking,
      preferenceId: mpPreference.preferenceId,
      initPoint: mpPreference.initPoint,
    });

    await this.paymentsRepository.save(payment);

    return { initPoint: mpPreference.initPoint };
  }

  async processApprovedPayment(data: {
    appointmentId: string;
    externalPaymentId: string;
    amount: number;
    paidAt: Date;
  }): Promise<void> {
    console.log('🔥 processApprovedPayment CALLED', data);

    const existingPayment =
      await this.paymentsRepository.findByExternalPaymentId(
        data.externalPaymentId,
      );

    if (existingPayment?.status === PaymentStatus.APPROVED) {
      console.log('⚠️ Pago ya aprobado, no se reprocesa');
      return;
    }

    await this.createApproved(data);
  }

  private async createApproved(data: {
    appointmentId: string;
    externalPaymentId: string;
    amount: number;
    paidAt: Date;
  }): Promise<Payment> {
    const appointment = await this.appointmentsRepository.findOneByOrFail({
      id: data.appointmentId,
    });

    await this.appointmentsService.confirmPayment(
      data.appointmentId,
      data.externalPaymentId,
    );

    const payment = this.paymentsRepository.create({
      appointment,
      provider: 'MERCADO_PAGO',
      externalPaymentId: data.externalPaymentId,
      amount: data.amount,
      status: PaymentStatus.APPROVED,
      paidAt: data.paidAt,
    });

    return this.paymentsRepository.save(payment);
  }

  private async createRejected(data: {
    appointmentId: string;
    externalPaymentId: string;
    amount: number;
    reason: string;
  }): Promise<Payment> {
    const appointment = await this.appointmentsRepository.findOneBy({
      id: data.appointmentId,
    });

    return this.paymentsRepository.save(
      this.paymentsRepository.create({
        appointment: appointment ?? undefined,
        provider: 'MERCADO_PAGO',
        externalPaymentId: data.externalPaymentId,
        amount: data.amount,
        status: PaymentStatus.REJECTED,
        rejectionReason: data.reason,
      }),
    );
  }
}
