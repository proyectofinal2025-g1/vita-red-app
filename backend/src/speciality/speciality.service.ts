import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SpecialityRepository } from './speciality.repository';
import { Speciality } from './entities/speciality.entity';

@Injectable()
export class SpecialityService {
  constructor(private readonly specialityRepository: SpecialityRepository) {}

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
    const created = await this.specialityRepository.create(data);
    return this.toResponseDto(created);
  }

  async findAll() {
    const list = await this.specialityRepository.findAll();
    return list.map((s) => this.toResponseDto(s));
  }

  async findById(id: string) {
  const speciality = await this.specialityRepository.findByIdWithDoctors(id);

  if (!speciality) {
    throw new NotFoundException(`Speciality with id ${id} not found`);
  }

  return {
    id: speciality.id,
    name: speciality.name,
    description: speciality.description,
    isActive: speciality.isActive,
    doctors: speciality.doctor.map((doctor) => ({
      id: doctor.id,
      first_name: doctor.user.first_name,
      last_name: doctor.user.last_name,
      licence_number: doctor.licence_number,
      profileImageUrl: doctor.user.profileImageUrl,
    })),
  };
}


  async findByNameWithDoctors(name: string) {
    const speciality =
      await this.specialityRepository.findByNameWithDoctors(name);

    if (!speciality) {
      throw new NotFoundException(`Speciality with name ${name} not found`);
    }

    return {
      id: speciality.id,
      name: speciality.name,
      description: speciality.description,
      isActive: speciality.isActive,
      doctors: speciality.doctor.map((doctor) => ({
        id: doctor.id,
        first_name: doctor.user.first_name,
        last_name: doctor.user.last_name,
        licence_number: doctor.licence_number,
        profileImageUrl: doctor.user.profileImageUrl
      })),
    };
  }

  async update(
    id: string,
    data: Partial<Pick<Speciality, 'name' | 'description'>>,
  ) {
    if (!data.name && !data.description) {
      throw new BadRequestException('Nothing to update');
    }

    const current = await this.specialityRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Speciality with id ${id} not found`);
    }

    if (data.name && data.name !== current.name) {
      const existsByName = await this.specialityRepository.findByName(
        data.name,
      );
      if (existsByName) {
        throw new ConflictException('Speciality name already exists');
      }
    }

    const updated = await this.specialityRepository.update(id, data);
    if (!updated)
      throw new NotFoundException(`Speciality with id ${id} not found`);

    return this.toResponseDto(updated);
  }

  async remove(id: string) {
    const current = await this.specialityRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Speciality with id ${id} not found`);
    }

    if (!current.isActive) {
      throw new BadRequestException('Speciality is already inactive');
    }

    return this.specialityRepository.remove(id);
  }

  async chargeSpeciality(name: string) {
    const exists = await this.specialityRepository.findByName(name);
    if (exists) return exists;
    return await this.specialityRepository.create({
      name,
      description: `Especialidad de ${name}`,
    });
  }
}
