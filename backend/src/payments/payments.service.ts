import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppointmentsService } from '../appointments/appointments.service';
import { AppointmentsRepository } from '../appointments/appointments.repository';
import { MercadoPagoService } from './mercado-pago.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { ResponsePaymentDto } from './dto/response-payment.dto';

import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly mercadoPagoService: MercadoPagoService,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async createPreference(dto: CreatePaymentDto): Promise<ResponsePaymentDto> {
    const appointment = await this.appointmentsService.findPreReservedById(
      dto.appointmentId,
    );

    const now = new Date();
    const diffSeconds =
      (appointment.expiresAt.getTime() - now.getTime()) / 1000;

    const BLOCK_SECONDS = Number(
      process.env.PAYMENT_BLOCK_BEFORE_EXPIRATION_SECONDS ?? 60,
    );

    if (diffSeconds <= BLOCK_SECONDS) {
      throw new BadRequestException(
        'El turno está por expirar. No se puede iniciar el pago.',
      );
    }

    const description = appointment.speciality
      ? `Consulta médica - ${appointment.speciality.name}`
      : 'Consulta médica';

    const initPoint = await this.mercadoPagoService.createPreference({
      appointmentId: appointment.id,
      price: appointment.priceAtBooking,
      description,
      payerEmail: appointment.patient.email,
      expiresAt: appointment.expiresAt,
    });

    return { initPoint };
  }

  async processApprovedPayment(data: {
    appointmentId: string;
    externalPaymentId: string;
    amount: number;
    paidAt: Date;
  }): Promise<void> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: data.appointmentId },
    });

    if (!appointment) {
      return;
    }

    // Si ya está confirmado, no tocamos el turno
    if (appointment.status === AppointmentStatus.PENDING) {
      appointment.status = AppointmentStatus.CONFIRMED;
      await this.appointmentsRepository.save(appointment);
    }

    // Buscar pago existente
    let payment = await this.paymentsRepository.findOne({
      where: { externalPaymentId: data.externalPaymentId },
    });

    if (!payment) {
      // Crear pago
      payment = this.paymentsRepository.create({
        appointment,
        provider: 'MERCADO_PAGO',
        externalPaymentId: data.externalPaymentId,
        amount: data.amount,
        status: PaymentStatus.APPROVED,
        paidAt: data.paidAt,
      });
    } else {
      // Actualizar pago existente
      payment.status = PaymentStatus.APPROVED;
      payment.amount = data.amount;
      payment.paidAt = data.paidAt;
    }

    await this.paymentsRepository.save(payment);
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

    return this.paymentsRepository.save(
      this.paymentsRepository.create({
        appointment,
        provider: 'MERCADO_PAGO',
        externalPaymentId: data.externalPaymentId,
        amount: data.amount,
        status: PaymentStatus.APPROVED,
        paidAt: data.paidAt,
      }),
    );
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
