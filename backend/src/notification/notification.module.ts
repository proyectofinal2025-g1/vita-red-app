import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './notification.repository';
import { MailerService } from './mail/mailer.service';
import { NotificationsCronService } from './notificationsCron.service';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Appointment])],
  controllers: [],
  providers: [NotificationService, NotificationRepository, MailerService, NotificationsCronService],
  exports: [NotificationService]
})
export class NotificationModule {}
