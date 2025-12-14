import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { User } from '../user/entities/user.entity';
import { Speciality } from '../speciality/entities/speciality.entity';

@Injectable()
export class DoctorRepository {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
  ) {}

  async findByLicence(licence_number: string) {
    return await this.doctorRepository.findOne({ where: { licence_number } });
  }

  async findByActiveUser(user_id: string) {
    return await this.doctorRepository.findOne({
      where: { user: { id: user_id }, isActive: true },
      relations: { user: true },
    });
  }

  async findUserById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findSpecialityById(id: string): Promise<Speciality | undefined>  {
    const speciality = await this.specialityRepository.findOne({
      where: { id, isActive: true },
    });
    return speciality ?? undefined
  }

  async create(data: Pick<Doctor, 'licence_number' | 'user' | 'speciality'>) {
    const doctor = await this.doctorRepository.create(data);
    return this.doctorRepository.save(doctor);
  }

  async findOne(id: string) {
    return await this.doctorRepository.findOne({
      where: { id, isActive: true },
      relations: { user: true, speciality: true },
    });
  }
  
  async findAll() {
    return await this.doctorRepository.find({
      where: { isActive: true },
      relations: { user: true, speciality: true },
    });    
  }

  async update(id:string, data: Partial<Pick<Doctor, 'licence_number'| 'speciality'>>){
    await this.doctorRepository.update(id, data);
    return this.findOne(id)
  }

  async remove(id:string){
    await this.doctorRepository.update(id, {isActive:false});
    return { success: 'Doctor removed successfully'}
  }

  async findOneByUserId(userId: string): Promise<Doctor | null> {
  return this.doctorRepository.findOne({
    where: {
      user: { id: userId },
      isActive: true,
    },
    relations: {
      user: true,
      speciality: true,
    },
  });
}

}
