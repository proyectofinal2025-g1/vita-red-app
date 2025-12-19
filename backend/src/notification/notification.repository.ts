import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationStatus } from './enums/notification-status.enum';

@Injectable()
export class NotificationRepository {
    constructor(@InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>){}

    async createNotification(data: Pick<Notification, 'type' | 'channel'| 'recipientEmail' >): Promise<Notification> {
        const notification = this.notificationRepository.create(data);
        return await this.notificationRepository.save(notification);
    }

    async markAsSent(id: string){
        await this.notificationRepository.update(id, {status: NotificationStatus.SENT});
    }

    async markAsFailed(id: string, errorMessage: string){
        await this.notificationRepository.update(id, {status: NotificationStatus.FAILED, errorMessage});
    }
}