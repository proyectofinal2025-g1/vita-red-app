import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DoctorSpeciality } from './entities/doctor-speciality.entity';

@Injectable()
export class DoctorSpecialityRepository {
  constructor(
    @InjectRepository(DoctorSpeciality)
    private readonly repository: Repository<DoctorSpeciality>,
  ) {}

  async findActiveByDoctorAndSpeciality(
    doctorId: string,
    specialityId: string,
  ): Promise<DoctorSpeciality | null> {
    return this.repository.findOne({
      where: {
        doctor: { id: doctorId },
        speciality: { id: specialityId },
        isActive: true,
      },
      relations: {
        doctor: true,
        speciality: true,
      },
    });
  }
}
