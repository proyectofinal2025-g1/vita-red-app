import { Module } from '@nestjs/common';
import { SeederService } from './seed.service';
import { UserModule } from '../user/user.module';
import { DoctorModule } from '../doctor/doctor.module';
import { SpecialityModule } from '../speciality/speciality.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
    UserModule,
    DoctorModule,
    SpecialityModule,
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule {}
