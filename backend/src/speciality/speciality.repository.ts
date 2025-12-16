import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Speciality } from './entities/speciality.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialityRepository {
  constructor(
    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
  ) {}

  async create(data: Pick<Speciality, 'name' | 'description'>) {
    const speciality = this.specialityRepository.create(data);
    return this.specialityRepository.save(speciality);
  }

  async findAll() {
    return this.specialityRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string) {
    return this.specialityRepository.findOne({ where: { id, isActive: true } });
  }

  async update(
    id: string,
    data: Partial<Pick<Speciality, 'name' | 'description'>>,
  ) {
    await this.specialityRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.specialityRepository.update(id, { isActive: false });
    return { success: 'Speciality removed successfully' };
  }

  async findByName(name: string) {
    return this.specialityRepository.findOne({ where: { name } });
  }

  async findById(id: string): Promise<Speciality | null> {
    return this.specialityRepository.findOne({
      where: { id, isActive: true },
      relations: ['doctor'],
    });
  }

  async findByNameWithDoctors(name: string) {
    return await this.specialityRepository.findOne({
      where: { name, isActive: true },
      relations: ['doctor', 'doctor.user'],
    });
  }
}
