import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity({ name: 'payments' })
export class Payment {
  @ApiProperty({
    description: 'Identificador único del pago',
    example: 'c1a4e9d3-7f22-4b1b-bb5e-9f1b2f3d9c01',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Turno asociado a este pago',
    type: () => Appointment,
  })
  @ManyToOne(() => Appointment, { nullable: false })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ApiProperty({
    description: 'Proveedor del pago',
    example: 'MERCADO_PAGO',
  })
  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @ApiProperty({
    description: 'Identificador del pago en Mercado Pago',
    example: '13123456789',
  })
  @Column({ name: 'external_payment_id', type: 'varchar', length: 100, nullable:true })
  externalPaymentId: string;

  @ApiProperty({
    description: 'Monto total del pago',
    example: 20000,
  })
  @Column({ type: 'numeric', precision: 10, scale: 2 }) 
  amount: number;

  @ApiProperty({
    description: 'Estado del pago',
    enum: PaymentStatus,
    example: PaymentStatus.APPROVED,
  })
  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Identificador de la preference creada en Mercado Pago',
    example: '13123456789abcdef',
    required: false,
  })
  @Column({
    name: 'preference_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  preferenceId?: string;

  @ApiProperty({
    description:
      'URL de redirección al checkout de Mercado Pago asociada a esta preference',
    example:
      'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=13123456789',
    required: false,
  })
  @Column({
    name: 'init_point',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  initPoint?: string;

  @ApiProperty({
    description: 'Fecha de aprobación del pago',
    example: '2025-01-10T14:30:00.000Z',
    required: false,
  })
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @ApiProperty({
    description: 'Motivo de rechazo o ignorado del pago',
    example: 'APPOINTMENT_EXPIRED',
    required: false,
  })
  @Column({ name: 'rejection_reason', type: 'varchar', nullable: true })
  rejectionReason?: string;

  @ApiProperty({
    description: 'Fecha de creación del registro del pago',
    example: '2025-01-10T14:15:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
