import { ApiProperty } from "@nestjs/swagger";

export class DoctorSimpleDto {
  @ApiProperty({
    example: 'e3c9b1b2-8f4c-4e9e-a9a2-4a9e2b1c7d01',
  })
  id: string;

  @ApiProperty({ example: 'MP-1001' })
  licence_number: string;
}