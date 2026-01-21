import { forwardRef, Module } from '@nestjs/common';
import { DoctorScheduleController } from './schedule.controller';
import { DoctorScheduleService } from './schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorSchedule } from './entities/schedule.entity';
import { Doctor } from '../entities/doctor.entity';
import { DoctorModule } from '../doctor.module';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorSchedule, Doctor]),
  forwardRef(() => DoctorModule)
  ],
  providers: [DoctorScheduleService],
  controllers: [DoctorScheduleController],
  exports: [DoctorScheduleService],
})
export class ScheduleModule {}
