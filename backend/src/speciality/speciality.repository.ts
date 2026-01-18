import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Speciality } from './entities/speciality.entity';
import { ILike, Repository, DataSource } from 'typeorm';

@Injectable()
export class SpecialityRepository {
  constructor(
    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
    private dataSource: DataSource
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
      where: { name: ILike(`%${name.trim()}%`), isActive: true },
      relations: ['doctor', 'doctor.user'],
    });
  }

  async findByIdWithDoctors(id: string) {
  return this.specialityRepository.findOne({
    where: { id },
    relations: {
      doctor: {
        user: true,
      },
    },
  });
}

async findByNameWithDoctorsChat(inputName: string) {
  if (!inputName) return null;

  console.log('REPO inputName:', inputName);
  console.log(
    'REPO input HEX:',
    Buffer.from(inputName, 'utf8').toString('hex')
  );

  const speciality = await this.dataSource
    .getRepository(Speciality)
    .createQueryBuilder('s')
    .where('s.isActive = true')
    .andWhere('s.name = :name', { name: inputName })
    .leftJoin('s.doctor', 'doctor')
    .leftJoin('doctor.user', 'user')
    .addSelect([
      'doctor.id',
      'doctor.licence_number',
      'user.first_name',
      'user.last_name',
      'user.profileImageUrl',
    ])
    .getOne();

  console.log('speciality del repo:', speciality);

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
    name: speciality.name,
    description: speciality.description,
    isActive: speciality.isActive,
    doctors,
  };
}



}
