import { Module } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { SpecialityController } from './speciality.controller';
import { Speciality } from './entities/speciality.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialityRepository } from './speciality.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Speciality]),],
  controllers: [SpecialityController],
  providers: [SpecialityService, SpecialityRepository],
  exports:[SpecialityService]
})
export class SpecialityModule {}
