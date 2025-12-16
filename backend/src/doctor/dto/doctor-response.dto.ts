import { ApiProperty } from "@nestjs/swagger";

export class DoctorResponseDto {
  @ApiProperty({ example: '2e9a5b9b-5f6f-4e25-9a7d-2df4f24a0c11' })
  id: string;

  @ApiProperty({ example: 'MP-123456' })
  licence_number: string;

  @ApiProperty({ example: 'uuid-user' })
  user_id: string;

  @ApiProperty({ example: 'uuid-speciality' })
  speciality_id: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}
