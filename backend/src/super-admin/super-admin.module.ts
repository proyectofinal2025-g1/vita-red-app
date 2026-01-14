import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminRepository } from './super-admin.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { secretaryModule } from '../secretary/secretary.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Doctor]), secretaryModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, SuperAdminRepository],
})
export class SuperAdminModule {}
