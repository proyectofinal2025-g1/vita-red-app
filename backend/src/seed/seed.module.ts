import { Module } from '@nestjs/common';
import { SeederService } from './seed.service';
import { UserModule } from '../user/user.module';
import { DoctorModule } from '../doctor/doctor.module';
import { SpecialityModule } from '../speciality/speciality.module';

@Module({
  imports: [
    UserModule,
    DoctorModule,
    SpecialityModule,
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule {}
