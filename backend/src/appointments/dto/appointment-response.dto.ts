import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class AppointmentResponseDto {
  @ApiProperty({ example: 'b3c1c8d2-4b92-4f44-8e2f-9a3f92e0c111' })
  id: string;

  @ApiProperty({ example: '2025-08-15' })
  date: Date;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @ApiProperty({
    example: 'Consulta cardiológica',
    required: false,
  })
  reason?: string;

  @ApiProperty({ example: '2025-08-01T14:32:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-01T14:47:00.000Z',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Precio de la consulta al momento de la reserva',
    example: 20000,
  })
  price: number;

  @ApiProperty({
    description: 'Paciente',
    example: {
      id: 'uuid',
      fullName: 'Juan Pérez',
      email: 'juan@email.com',
    },
  })
  patient: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Médico',
    example: {
      id: 'uuid',
      fullName: 'Dra. María Gómez',
    },
  })
  doctor: {
    id: string;
    fullName: string;
    consultationFee: number;
  };

  @ApiProperty({
    description: 'Especialidad',
    required: false,
    example: {
      id: 'uuid',
      name: 'Cardiología',
    },
  })
  speciality?: {
    id: string;
    name: string;
  };
  
}
