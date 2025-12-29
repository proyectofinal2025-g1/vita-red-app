import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeekEnum } from "../../doctor/schedule/enum/enumDays";
import { IsOptional, IsString } from "class-validator";

export class UpdateDoctorScheduleDtoBySecretary {
  @ApiProperty({ example: 'lunes' })
  @IsString()
  dayOfWeek: DayOfWeekEnum;

  @ApiProperty({ example: '09:00' })
  @IsOptional()
  startTime?: string;

  @ApiProperty({ example: '13:00' })
  @IsOptional()
  endTime?: string;

  @ApiProperty({ example: 30 })
  @IsOptional()
  slotDuration?: number;
}
