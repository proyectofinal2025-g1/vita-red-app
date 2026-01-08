import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AppointmentTimeHelper } from "../appointments/utils/appointment-time.helper";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "../appointments/entities/appointment.entity";
import { Between, Repository } from "typeorm";
import { AppointmentStatus } from "../appointments/enums/appointment-status.enum";
import { NotificationService } from "./notification.service";
import { NotificationType } from "./enums/notification-type.enum";

@Injectable()
export class NotificationsCronService {
    constructor(
        @InjectRepository(Appointment) private readonly appointmentRepo: Repository<Appointment>,
        private readonly notificationService: NotificationService
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async cronService() {
        const now = AppointmentTimeHelper.nowArgentina()
        const nextDay = AppointmentTimeHelper.addMinutesInArgentina(now, 1440);
        const limitDate = AppointmentTimeHelper.addMinutesInArgentina(now, 1441);
        const appointments = await this.appointmentRepo.find({
            where: {
                date: Between(nextDay, limitDate),
                status: AppointmentStatus.CONFIRMED
            }, relations: ["notifications", "patient", "doctor", "doctor.user"]
        });
        for (const appointment of appointments) {
            if (appointment.notifications.some(notification => notification.type === NotificationType.APPOINTMENT_REMINDER)) {
                continue;
            }
            const dateArgentina = appointment.date.toLocaleDateString('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires',
            });

            const timeArgentina = appointment.date.toLocaleTimeString('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires',
                hour: '2-digit',
                minute: '2-digit',
            });
            const params = {
                email: appointment.patient.email,
                first_name: appointment.patient.first_name,
                date: dateArgentina,
                time:timeArgentina,
                doctorName: appointment.doctor.user.first_name
            }
            await this.notificationService.sendAppointmentReminder(params)

        }
        console.log(`CRON: ${appointments.length} turnos encontrados para recordatorio`);
    }
}