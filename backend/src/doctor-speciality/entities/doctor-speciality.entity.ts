import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Doctor } from '../../doctor/entities/doctor.entity';
import { Speciality } from '../../speciality/entities/speciality.entity';

@Entity({ name: 'doctor_specialities' })
@Unique(['doctor', 'speciality'])
export class DoctorSpeciality {
  @ApiProperty({
    description: 'Identificador único del precio por especialidad del médico',
    example: 'a12f3c4d-9b21-4e5c-8f23-123456789abc',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Médico al que pertenece el precio',
    type: () => Doctor,
  })
  @ManyToOne(() => Doctor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ApiProperty({
    description: 'Especialidad asociada al precio',
    type: () => Speciality,
  })
  @ManyToOne(() => Speciality, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'speciality_id' })
  speciality: Speciality;

  @ApiProperty({
    description: 'Precio de la consulta para esta especialidad',
    example: 20000,
  })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  price: number;

  @ApiProperty({
    description: 'Indica si este precio está activo',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
