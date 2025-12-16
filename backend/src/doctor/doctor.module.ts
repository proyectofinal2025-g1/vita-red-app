import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Speciality } from '../speciality/entities/speciality.entity';
import { DoctorRepository } from './doctor.repository';
import { SpecialityRepository } from '../speciality/speciality.repository';
import { UserRepository } from '../user/user.repository';
import { Doctor } from './entities/doctor.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, User, Speciality])],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository],
  exports: [DoctorRepository, DoctorService],
})
export class DoctorModule {}
