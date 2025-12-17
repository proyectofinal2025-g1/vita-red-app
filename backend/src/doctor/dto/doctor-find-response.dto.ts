import { ApiProperty } from "@nestjs/swagger";

export class DoctorFindResponseDto {
  @ApiProperty({
    example: 'd06af9f0-7a1e-477e-8bc3-4733d2606572',
    description: 'ID único del médico',
  })
  id: string;

  @ApiProperty({
    example: 'Marcos Luna',
    description: 'Nombre completo del médico',
  })
  fullName: string;

  @ApiProperty({
    example: 'Nefrología',
    description: 'Especialidad del médico',
  })
  speciality: string;

  @ApiProperty({
    example: 'MP-9002',
    description: 'Número de matrícula profesional',
  })
  licence_number: string;
}
