import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DoctorSpecialityRepository } from './doctor-speciality.repository';

@Injectable()
export class DoctorSpecialityService {
  constructor(
    private readonly doctorSpecialityRepository: DoctorSpecialityRepository,
  ) {}

  async getActivePrice(
    doctorId: string,
    specialityId: string,
  ): Promise<number> {
    const doctorSpeciality =
      await this.doctorSpecialityRepository.findActiveByDoctorAndSpeciality(
        doctorId,
        specialityId,
      );

    if (!doctorSpeciality) {
      throw new NotFoundException(
        'El médico no tiene un precio configurado para esta especialidad',
      );
    }

    if (doctorSpeciality.price <= 0) {
      throw new BadRequestException('El precio configurado no es válido');
    }

    return Number(doctorSpeciality.price);
  }
}
