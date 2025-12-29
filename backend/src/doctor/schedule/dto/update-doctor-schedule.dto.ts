import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDoctorScheduleDto } from './create-doctor-schedule.dto';
import { IsEnum, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { DayOfWeekEnum } from '../enum/enumDays';

export class UpdateDoctorScheduleDto extends PartialType(
  CreateDoctorScheduleDto,
) {
  @ApiProperty({
    enum: DayOfWeekEnum,
    example: 'Lunes',
  })
  @IsEnum(DayOfWeekEnum)
  dayOfWeek: DayOfWeekEnum;

  @ApiProperty({ example: '08:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @IsOptional()
  startTime?: string;

  @ApiProperty({ example: '12:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @IsOptional()
  endTime?: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(10)
  @IsOptional()
  slotDuration?: number;
}
