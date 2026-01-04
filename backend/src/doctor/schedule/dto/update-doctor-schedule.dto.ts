import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDoctorScheduleDto } from './create-doctor-schedule.dto';
import { IsInt, IsOptional, Matches, Min } from 'class-validator';

export class UpdateDoctorScheduleDto extends PartialType(
  CreateDoctorScheduleDto,
) {
  @ApiProperty({
    example: '1',
  })
  dayOfWeek: number;

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
