import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min, Max, Matches } from 'class-validator';

export class CreateDoctorScheduleDto {
  @ApiProperty({ description: 'ID del médico' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'Día de la semana (0=Domingo, 6=Sábado)',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '08:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(10)
  slotDuration: number;
}
