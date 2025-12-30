import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './enums/payment-status.enum';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  create(payment: Partial<Payment>): Payment {
    return this.paymentsRepository.create(payment);
  }

  save(payment: Payment): Promise<Payment> {
    return this.paymentsRepository.save(payment);
  }

  findByExternalPaymentId(externalPaymentId: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: { externalPaymentId },
      relations: { appointment: true },
    });
  }
}
