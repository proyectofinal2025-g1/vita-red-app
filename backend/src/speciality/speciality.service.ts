import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SpecialityRepository } from './speciality.repository';
import { Speciality } from './entities/speciality.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SpecialityService {
  constructor(
    private readonly specialityRepository: SpecialityRepository,
    private dataSource: DataSource
  ) { }

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
      throw new NotFoundException(`Speciality ${name} not found`);
    }

    return {
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



  /* METODO ALTERNO PARA EL CHATBOT */
  async findByNameWithDoctorsChat(inputName: string) {
  if (!inputName) return null;

  const speciality = await this.dataSource
    .getRepository(Speciality)
    .createQueryBuilder('s')
    .where('s.isActive = true')
    .andWhere('s.name = :name', { name: inputName })
    .leftJoin('s.doctor', 'doctor')
    .leftJoin('doctor.user', 'user')
    .addSelect([
      's.id', // ✅ CLAVE
      'doctor.id',
      'doctor.licence_number',
      'user.first_name',
      'user.last_name',
      'user.profileImageUrl',
    ])
    .getOne();

  if (!speciality) return null;

  const doctors = (speciality.doctor || [])
    .filter(d => d.user)
    .map(d => ({
      id: d.id,
      first_name: d.user.first_name,
      last_name: d.user.last_name,
      licence_number: d.licence_number,
      profileImageUrl: d.user.profileImageUrl,
    }));

  return {
    id: speciality.id, // ✅ ahora EXISTE también en el tipo
    name: speciality.name,
    description: speciality.description,
    isActive: speciality.isActive,
    doctors,
  };
}

}
