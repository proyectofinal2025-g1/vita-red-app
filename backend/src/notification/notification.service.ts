import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { MailerService } from './mail/mailer.service';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationChannel } from './enums/notification-channel.enum';

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly mailerService: MailerService
    ) { }

    async sendAppointmentReminder(params: { email: string; first_name: string; date: Date; doctorName: string; }) {
        const notification = {
            type: NotificationType.APPOINTMENT_REMINDER,
            channel: NotificationChannel.EMAIL,
            recipientEmail: params.email
        }
        const newNotification = await this.notificationRepository.createNotification(notification)
        try {
            let html = this.mailerService.loadTemplate('appointment-reminder.html');
            html = html.replace('{{name}}', params.first_name);
            html = html.replace('{{date}}', params.date.toLocaleDateString('es-AR'))
            html = html.replace('{{time}}', params.date.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
            })
            )
            html = html.replace('{{doctor}}', params.doctorName);
            const subject = 'Recordatorio de turno';
            await this.mailerService.sendEmail(params.email, subject, html)
            await this.notificationRepository.markAsSent(newNotification.id)
        } catch (error) {
            await this.notificationRepository.markAsFailed(newNotification.id, error.message)
        }
    }

    async sendWelcomeNotification(email: string, first_name: string) {
        const notification = {
            type: NotificationType.USER_REGISTERED,
            channel: NotificationChannel.EMAIL,
            recipientEmail: email
        }
        const newNotification = await this.notificationRepository.createNotification(notification)

        try {
            await this.mailerService.sendWelcomeEmail(email, first_name)
            await this.notificationRepository.markAsSent(newNotification.id)
        } catch (error) {
            await this.notificationRepository.markAsFailed(newNotification.id, error.message)
        }
    }

    async sendAppointmentCreatedNotification(params: {
        email: string;
        first_name: string;
        date: Date;
        doctorName: string;
    }) {
        const notification = {
            type: NotificationType.APPOINTMENT_CREATED,
            channel: NotificationChannel.EMAIL,
            recipientEmail: params.email
        }
        const newNotification = await this.notificationRepository.createNotification(notification)

        try {
            let html = this.mailerService.loadTemplate('appointment-created.html');
            html = html.replace('{{name}}', params.first_name);
            html = html.replace('{{date}}', params.date.toLocaleDateString('es-AR'))
            html = html.replace('{{time}}', params.date.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
            })
            )
            html = html.replace('{{doctor}}', params.doctorName);
            const subject = 'Turno confirmado';
            await this.mailerService.sendEmail(params.email, subject, html)
            await this.notificationRepository.markAsSent(newNotification.id)
        } catch (error) {
            await this.notificationRepository.markAsFailed(newNotification.id, error.message)
        }

    }

    async sendAppointmentCancelledNotification(params: {
        email: string;
        first_name: string;
        date: Date;
    }) {
        const notification = {
            type: NotificationType.APPOINTMENT_CANCELLED,
            channel: NotificationChannel.EMAIL,
            recipientEmail: params.email
        }
        const newNotification = await this.notificationRepository.createNotification(notification)

        try {
            let html = this.mailerService.loadTemplate('appointment-cancelled.html');
            html = html.replace('{{name}}', params.first_name);
            html = html.replace('{{date}}', params.date.toLocaleDateString('es-AR'))
            html = html.replace('{{time}}', params.date.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
            })
            )
            const subject = 'Turno cancelado';
            await this.mailerService.sendEmail(params.email, subject, html)
            await this.notificationRepository.markAsSent(newNotification.id)
        } catch (error) {
            await this.notificationRepository.markAsFailed(newNotification.id, error.message)
        }
    }
}
