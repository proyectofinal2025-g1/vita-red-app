import { Module } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordController } from './medical-record.controller';
import { UserModule } from '../user/user.module';
import { DoctorModule } from '../doctor/doctor.module';
import { MedicalRecordRepository } from './medical-record.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([MedicalRecord]),
    UserModule,
    DoctorModule
  ],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService, MedicalRecordRepository],
})
export class MedicalRecordModule {}
