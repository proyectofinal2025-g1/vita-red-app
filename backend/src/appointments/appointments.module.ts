import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

import { Appointment } from './entities/appointment.entity';
import { User } from '../user/entities/user.entity';
import { Speciality } from '../speciality/entities/speciality.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { DoctorModule } from '../doctor/doctor.module';
import { SheduleModule } from '../doctor/schedule/schedule.module';
import { AppointmentsExpirationService } from './appointments-expiration.service';
import { AppointmentsRepository } from './appointments.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User, Speciality, Doctor]),
    DoctorModule,
    SheduleModule,
  ],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentsExpirationService,
    AppointmentsRepository,
  ],
  exports: [AppointmentsService, AppointmentsRepository],
})
export class AppointmentsModule {}
