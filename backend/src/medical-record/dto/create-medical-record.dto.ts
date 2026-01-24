import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 'ID_userPatient' })
  @IsNotEmpty()
  @IsUUID()
  patient_id: string;

  @ApiProperty({ example: 'ID_userDoctor' })
  @IsNotEmpty()
  @IsUUID()
  doctor_id: string;

  @ApiProperty({ example: 'Jaqueca y dolor corporal' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ example: 'Migraña por estres y falta de descanso adecuado' })
  @IsNotEmpty()
  @IsString()
  diagnosis: string;

  @ApiProperty({
    example: 'Dormir 8 horas diarias y tomar tafirol c/12hr por 3 días',
  })
  @IsNotEmpty()
  @IsString()
  treatment: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  notes: string;

  @ApiProperty({ example: 'appointment_uuid' })
  @IsNotEmpty()
  @IsUUID()
  appointment_id: string;
}
