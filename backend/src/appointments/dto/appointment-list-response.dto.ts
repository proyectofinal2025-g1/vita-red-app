import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class AppointmentListResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '2025-08-15' })
  date: string;

  @ApiProperty({ example: '10:30' })
  time: string;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Nombre del médico',
    example: 'Dra. María Gómez',
  })
  doctorName: string;

  @ApiProperty({
    description: 'Especialidad',
    example: 'Cardiología',
    required: false,
  })
  specialty?: string;
}
