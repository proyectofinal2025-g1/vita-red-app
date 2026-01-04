import { ApiProperty } from '@nestjs/swagger';

export class DoctorForSpecialityDto {
  @ApiProperty({
    example: 'd06af9f0-7a1e-477e-8bc3-4733d2606572',
    description: 'ID único del médico',
  })
  id: string;

  @ApiProperty({
    example: 'MP-9002',
    description: 'Número de matrícula profesional',
  })
  licence_number: string;

  @ApiProperty({
    example: 'Marcos ',
    description: 'Nombre del médico',
  })
  first_name: string;

  @ApiProperty({
    example: 'Luna',
    description: 'Apellido del médico',
  })
  last_name: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/ds6anafmo/image/upload/v1767278713/istockphoto-1162198273-612x612_whldhm.jpg',
    description: 'Foto de perfil del médico',
  })
  profileImageUrl:string
}
