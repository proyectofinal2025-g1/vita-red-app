import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

import { Appointment } from './entities/appointment.entity';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { AppointmentTimeHelper } from './utils/appointment-time.helper';

@Injectable()
export class AppointmentsExpirationService {
  private readonly logger = new Logger(AppointmentsExpirationService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  @Cron('*/1 * * * *')
  async expirePendingAppointments() {
    const now = AppointmentTimeHelper.now();

    const expired = await this.appointmentRepo.find({
      where: {
        status: AppointmentStatus.PENDING,
        expiresAt: LessThan(now),
      },
    });

    if (!expired.length) return;

    for (const appointment of expired) {
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.cancelledAt = now;
    }

    await this.appointmentRepo.save(expired);

    this.logger.log(`Se cancelaron ${expired.length} turnos vencidos`);
  }
}
