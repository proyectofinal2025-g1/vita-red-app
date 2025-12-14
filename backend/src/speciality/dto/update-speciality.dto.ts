import { PartialType } from '@nestjs/mapped-types';
import { CreateEspecialityDto } from './create-speciality.dto';

export class UpdateEspecialityDto extends PartialType(CreateEspecialityDto) {}
