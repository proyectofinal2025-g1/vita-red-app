import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEspecialityDto {
  @ApiProperty({
    description: 'Nombre de la especialidad',
    example: 'Pediatría',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descripción de la especialidad',
    example: 'Rama de la medicina que se dedica al cuidado integral de la salud de los niños, desde el nacimiento hasta la adolescencia',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

}
