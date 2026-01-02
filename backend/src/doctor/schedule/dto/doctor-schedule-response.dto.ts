import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeekEnum } from '../enum/enumDays';

export class DoctorScheduleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doctorId: string

  @ApiProperty()
  dayOfWeek: DayOfWeekEnum;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  slotDuration: number;
}
