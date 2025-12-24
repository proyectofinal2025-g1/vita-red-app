import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsString, IsOptional, Matches } from 'class-validator';

export class CreateAppointmentPreReserveDto {
  @ApiProperty({
    description: 'ID del médico',
    example: 'c1a3e2a0-9f8d-4d10-b5d1-123456789abc',
  })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'ID de la especialidad',
    example: 'b2c4d5e6-7f89-4abc-9def-123456789aaa',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiProperty({
    description: 'Fecha del turno (YYYY-MM-DD)',
    example: '2025-08-15T10:30',
  })
  @IsDateString()
  dateTime: string;

  @ApiProperty({
    description: 'Motivo del turno (opcional)',
    example: 'Consulta',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
