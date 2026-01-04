import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class UpdateDoctorScheduleDtoBySecretary {
  @ApiProperty({ example: '1' })
  @IsNumber()
  dayOfWeek: number;

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
