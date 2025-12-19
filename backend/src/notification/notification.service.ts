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

    async sendAppointmentCreatedNotification(email: string, first_name: string) {
        const notification = {
            type: NotificationType.APPOINTMENT_CREATED,
            channel: NotificationChannel.EMAIL,
            recipientEmail: email
        }
        const newNotification = await this.notificationRepository.createNotification(notification)

        try {
            await this.mailerService.sendAppointmentCreatedEmail(email, first_name)
            await this.notificationRepository.markAsSent(newNotification.id)
        } catch (error) {
            await this.notificationRepository.markAsFailed(newNotification.id, error.message)
        }

    }

    async sendAppointmentCancelledNotification(email: string, first_name: string) {
        const notification = {
            type: NotificationType.APPOINTMENT_CANCELLED,
            channel: NotificationChannel.EMAIL,
            recipientEmail: email
        }
        const newNotification = await this.notificationRepository.createNotification(notification)

        try {
            await this.mailerService.sendAppointmentCancelledEmail(email, first_name)
            await this.notificationRepository.markAsSent(newNotification.id)
        } catch (error) {
            await this.notificationRepository.markAsFailed(newNotification.id, error.message)
        }
    }
}
