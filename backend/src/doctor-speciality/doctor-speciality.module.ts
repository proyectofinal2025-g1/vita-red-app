import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorSpeciality } from './entities/doctor-speciality.entity';
import { DoctorSpecialityRepository } from './doctor-speciality.repository';
import { DoctorSpecialityService } from './doctor-speciality.service';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorSpeciality])],
  providers: [DoctorSpecialityRepository, DoctorSpecialityService],
  exports: [DoctorSpecialityService],
})
export class DoctorSpecialityModule {}
