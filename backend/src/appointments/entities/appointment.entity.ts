import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { User } from '../../user/entities/user.entity';
import { Speciality } from '../../speciality/entities/speciality.entity';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { Notification } from '../../notification/entities/notification.entity';

@Entity({ name: 'appointments' })
@Index(['doctor', 'date'])
@Index(['patient', 'date'])
export class Appointment {
  @ApiProperty({
    description: 'Identificador único del turno',
    example: 'b3c1c8d2-4b92-4f44-8e2f-9a3f92e0c111',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Fecha del turno (YYYY-MM-DD)',
    example: '2025-08-15',
  })
  @Column({ type: 'timestamp' })
  date: Date;

  @ApiProperty({
    description: 'Motivo del turno (opcional)',
    example: 'Consulta de control',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @ApiProperty({
    description: 'Fecha y hora en que el turno fue cancelado',
    example: '2025-12-20T14:30:00.000Z',
    required: false,
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @ApiProperty({
    description: 'Usuario que realizó la cancelación del turno',
    type: () => User,
    required: false,
    nullable: true,
  })
  @ManyToOne(() => User, { nullable: true })
  cancelledBy?: User;

  @ApiProperty({
    description: 'Estado actual del turno',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description:
      'Fecha y hora de expiración de la pre-reserva. Si se supera sin pago, el turno se cancela automáticamente.',
    example: '2025-08-01T14:47:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Paciente asociado al turno',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ApiProperty({
    description: 'Médico asignado al turno (usuario con rol DOCTOR)',
    type: () => User,
  })
  @ManyToOne(() => Doctor, { nullable: false })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ApiProperty({
    description: 'Especialidad médica del turno',
    type: () => Speciality,
    required: true,
  })
  @ManyToOne(() => Speciality, { nullable: false })
  speciality: Speciality;

  @ApiProperty({
    description: 'Precio de la consulta al momento de la reserva',
    example: 20000,
  })
  @Column({ type: 'numeric' })
  priceAtBooking: number;

  @ApiProperty({
    description: 'Fecha y hora en que el pago fue confirmado',
    required: false,
    nullable: true,
  })
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @ApiProperty({
    description: 'Referencia del pago (ej: MercadoPago payment_id)',
    required: false,
    nullable: true,
  })
  @Column({
    name: 'payment_reference',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  paymentReference?: string;

  @OneToMany(() => Notification, (notification) => notification.appointment)
  notifications: Notification[];
}
