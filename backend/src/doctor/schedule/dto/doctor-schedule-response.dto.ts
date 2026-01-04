import { ApiProperty } from '@nestjs/swagger';

export class DoctorScheduleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doctorId: string

  @ApiProperty()
  dayOfWeek: number;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  slotDuration: number;
}
