import { ApiProperty } from '@nestjs/swagger';
import { DoctorSimpleDto } from '../../doctor/dto/doctor-simple.dto';
import { DoctorForSpecialityDto } from '../../doctor/dto/doctor-speciality.dto';

export class SpecialityResponseDto {
  @ApiProperty({
    example: 'c1f4a9a6-9f2b-4b2f-bc4e-9e7c0c9c4a11',
    description: 'UUID de la especilidad',
  })
  id: string;

  @ApiProperty({ example: 'Pediatría' })
  name: string;

  @ApiProperty({ example: 'Rama de la medicina que se dedica al cuidado integral de la salud de los niños, desde el nacimiento hasta la adolescencia'})
  description: string;

  @ApiProperty({ example: true })
  isActive: boolean;
  
   @ApiProperty({
    type: () => DoctorForSpecialityDto,
    isArray: true,
    description: 'Doctores asociados a esta especialidad',
  })
   doctors: DoctorForSpecialityDto[]
}
