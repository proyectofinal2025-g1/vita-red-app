import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min, Max, Matches } from 'class-validator';

export class CreateDoctorScheduleDto {
  @ApiProperty({ description: 'ID del médico' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ example: 1, description: '0=domingo, 1=lunes, ..., 6=sábado' })
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
