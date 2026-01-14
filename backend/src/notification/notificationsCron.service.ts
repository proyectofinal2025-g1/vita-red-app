import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { NotificationService } from './notification.service';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationsCronService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  async cronService() {
    const now = new Date();

    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 1000);

    const appointments = await this.appointmentRepo.find({
      where: {
        date: Between(start, end),
        status: AppointmentStatus.CONFIRMED,
      },
      relations: ['notifications', 'patient', 'doctor', 'doctor.user'],
    });

    for (const appointment of appointments) {
      const alreadyNotified = appointment.notifications.some(
        (n) => n.type === NotificationType.APPOINTMENT_REMINDER,
      );

      if (alreadyNotified) continue;

      const dateArgentina = appointment.date.toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      });

      const timeArgentina = appointment.date.toLocaleTimeString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
      });

      await this.notificationService.sendAppointmentReminder({
        email: appointment.patient.email,
        first_name: appointment.patient.first_name,
        date: dateArgentina,
        time: timeArgentina,
        doctorName: appointment.doctor.user.first_name,
      });
    }

    console.log(
      `CRON: ${appointments.length} turnos encontrados para recordatorio`,
    );
  }
}
