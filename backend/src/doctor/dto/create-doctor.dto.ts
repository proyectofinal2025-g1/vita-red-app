import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateDoctorDto {
  @ApiProperty({ example: 'MP-123456' })
  @IsNotEmpty()
  @IsString()
  licence_number: string;

  @ApiProperty({ example: 'uuid-user' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ example: 'uuid-speciality' })
  @IsUUID()
  speciality_id: string;
}
