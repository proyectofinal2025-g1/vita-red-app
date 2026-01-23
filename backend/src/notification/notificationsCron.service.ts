import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AppointmentTimeHelper } from "../appointments/utils/appointment-time.helper";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "../appointments/entities/appointment.entity";
import { Between, Repository } from "typeorm";
import { AppointmentStatus } from "../appointments/enums/appointment-status.enum";
import { NotificationService } from "./notification.service";
import { NotificationType } from "./enums/notification-type.enum";
import { toZonedTime } from "date-fns-tz";

const ARG_TIMEZONE = 'America/Argentina/Buenos_Aires';

@Injectable()
export class NotificationsCronService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    private readonly notificationService: NotificationService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cronService() {
    const now = AppointmentTimeHelper.now();
    const nextDay = AppointmentTimeHelper.addMinutes(now, 720);
    const limitDate = AppointmentTimeHelper.addMinutes(now, 725);

    const appointments = await this.appointmentRepo.find({
      where: {
        date: Between(nextDay, limitDate),
        status: AppointmentStatus.CONFIRMED
      },
      relations: ["notifications", "patient", "doctor", "doctor.user"]
    });

    for (const appointment of appointments) {
      if (
        appointment.notifications.some(
          notification =>
            notification.type === NotificationType.APPOINTMENT_REMINDER
        )
      ) {
        continue;
      }

      const argentinaDate = toZonedTime(
        appointment.date,
        ARG_TIMEZONE
      );

      const dateArgentina = argentinaDate.toLocaleDateString('es-AR');
      const timeArgentina = argentinaDate.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      await this.notificationService.sendAppointmentReminder({
        email: appointment.patient.email,
        first_name: appointment.patient.first_name,
        date: dateArgentina,
        time: timeArgentina,
        doctorName: appointment.doctor.user.first_name
      });
    }

    console.log(
      `CRON: ${appointments.length} turnos encontrados para recordatorio`
    );
  }
}
