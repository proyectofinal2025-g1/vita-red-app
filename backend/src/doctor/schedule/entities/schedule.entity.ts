import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Doctor } from '../../entities/doctor.entity';

@Entity({ name: 'doctor_schedules' })


@Index(['doctor', 'dayOfWeek'])
export class DoctorSchedule {
  @ApiProperty({
    description: 'ID del horario',
    example: 'b7a9d5e2-12e4-4f18-8f5e-11d5b6a8f999',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Médico al que pertenece el horario',
    type: () => Doctor,
  })
  @ManyToOne(() => Doctor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ApiProperty({
    description: 'Día de la semana (0=Domingo, 6=Sábado)',
    example: 1,
  })
  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number;

  @ApiProperty({
    description: 'Hora de inicio',
    example: '08:00',
  })
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @ApiProperty({
    description: 'Hora de fin',
    example: '12:00',
  })
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ApiProperty({
    description: 'Duración del turno en minutos',
    example: 30,
  })
  @Column({ name: 'slot_duration', type: 'int', default: 30 })
  slotDuration: number;
}
