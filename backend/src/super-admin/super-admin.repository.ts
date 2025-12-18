import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { RolesEnum } from '../user/enums/roles.enum';
import { Doctor } from '../doctor/entities/doctor.entity';
import { SpecialityEnum } from './enum/speciality.enum';


@Injectable()
export class SuperAdminRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor) private readonly doctorRepository: Repository<Doctor>
  ) { }

  async findAll(role?: RolesEnum, isActive?: boolean) {
    const usersFound = await this.userRepository.find({ where: { role, is_active: isActive } })
    return usersFound;
  }

  async findAllDoctors(specialty?: SpecialityEnum) {
    const roleDoctor = await this.doctorRepository.find({ relations: { speciality: true } });
    if(!specialty) return roleDoctor;
    const specialityForDb = specialty.toLocaleLowerCase().split('_').join(' ')
    return roleDoctor.filter(doctor => doctor.speciality.name === specialityForDb)
  }

  async update(user: User) {
    return await this.userRepository.save(user)
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id })
    return user;
  }
}