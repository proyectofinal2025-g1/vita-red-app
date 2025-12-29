import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min, Max, Matches, IsEnum } from 'class-validator';
import { DayOfWeekEnum } from '../enum/enumDays';

export class CreateDoctorScheduleDto {
  @ApiProperty({ description: 'ID del médico' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    enum: DayOfWeekEnum,
    example: 'Lunes',
  })
  @IsEnum(DayOfWeekEnum)
  dayOfWeek: DayOfWeekEnum;

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
