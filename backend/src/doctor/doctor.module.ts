import { forwardRef, Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Speciality } from '../speciality/entities/speciality.entity';
import { DoctorRepository } from './doctor.repository';
import { Doctor } from './entities/doctor.entity';
import { User } from '../user/entities/user.entity';
import { ScheduleModule } from './schedule/schedule.module';
import { UserModule } from '../user/user.module';


@Module({
  imports: [TypeOrmModule.forFeature([Doctor, User, Speciality]),
forwardRef(() => ScheduleModule), UserModule],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository ],
  exports: [DoctorRepository, DoctorService ],
})
export class DoctorModule {}
