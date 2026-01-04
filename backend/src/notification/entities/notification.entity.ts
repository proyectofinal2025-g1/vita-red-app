import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NotificationStatus } from "../enums/notification-status.enum";
import { NotificationType } from "../enums/notification-type.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";
import { Appointment } from "../../appointments/entities/appointment.entity";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType

    @Column({
        type: 'enum',
        enum: NotificationChannel,
    })
    channel: NotificationChannel

    @Column()
    recipientEmail: string

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    })
    status: NotificationStatus

    @Column({
        type: 'text',
        nullable: true,
    })
    errorMessage: string | null

    @Column({ type: 'timestamp', nullable: true })
    sentAt: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(()=> Appointment, appointment => appointment.notifications)
    appointment: Appointment;
}