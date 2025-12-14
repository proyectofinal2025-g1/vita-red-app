import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SpecialityRepository } from './speciality.repository';
import { Speciality } from './entities/speciality.entity';

@Injectable()
export class SpecialityService {
  constructor(
    private readonly specialityRepository: SpecialityRepository
  ){}

  private toResponseDto(s: Speciality) {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    isActive: s.isActive,
  };
}

  async create(data: Pick<Speciality, 'name' | 'description'>) {
    const nameExist = await this.specialityRepository.findByName(data.name);
    if (nameExist) {
      throw new ConflictException('Speciality name already exists');
    }
    const created = await this.specialityRepository.create(data)
    return this.toResponseDto(created);
    
  }

  async findAll() {
    const list = await this.specialityRepository.findAll()
    return list.map((s) => this.toResponseDto(s))
  }

  async findOne(id: string) {
    const speciality = await this.specialityRepository.findOne(id);
    if (!speciality) {
      throw new NotFoundException(`Speciality with id ${id} not found`);
    }
    return this.toResponseDto(speciality);
  }

  async update(id: string, data: Partial<Pick<Speciality, 'name' | 'description'>>) {
    if (!data.name && !data.description) {
      throw new BadRequestException('Nothing to update');
    }

    const current = await this.specialityRepository.findOne(id);
    if (!current) {
      throw new NotFoundException(`Speciality with id ${id} not found`);
    }

    if (data.name && data.name !== current.name) {
      const existsByName = await this.specialityRepository.findByName(data.name);
      if (existsByName) {
        throw new ConflictException('Speciality name already exists');
      }
    }
    
    const updated = await this.specialityRepository.update(id, data);
    if (!updated) throw new NotFoundException(`Speciality with id ${id} not found`);

    return this.toResponseDto(updated);
  }

  async remove(id: string) {
    const current = await this.specialityRepository.findOne(id); 
    if (!current) {
      throw new NotFoundException(`Speciality with id ${id} not found`);
    }

    if (!current.isActive) {
      throw new BadRequestException('Speciality is already inactive');
    }

    return this.specialityRepository.remove(id);
  }
}
