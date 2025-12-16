import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DoctorRepository } from './doctor.repository';
import { Doctor } from './entities/doctor.entity';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { RolesEnum } from '../user/enums/roles.enum';
import { Speciality } from '../speciality/entities/speciality.entity';

@Injectable()
export class DoctorService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  private toResponseDto(doctor: Doctor): DoctorResponseDto {
    return {
      id: doctor.id,
      licence_number: doctor.licence_number,
      user_id: doctor.user.id,
      speciality_id: doctor.speciality.id,
      isActive: doctor.isActive,
    };
  }

  async create(data: {
    licence_number: string;
    user_id: string;
    speciality_id: string;
  }) {
    const licenceExist = await this.doctorRepository.findByLicence(
      data.licence_number,
    );
    if (licenceExist) {
      throw new ConflictException('Licence number already exists');
    }

    const user = await this.doctorRepository.findUserById(data.user_id);
    if (!user) {
      throw new NotFoundException('User with id ${data.user_id} not found');
    }

    if (user.role !== RolesEnum.Medic) {
      throw new ForbiddenException(
        'Only users with Medic role can have a Doctor profile',
      );
    }

    const alreadyDoctor = await this.doctorRepository.findByActiveUser(
      data.user_id,
    );
    if (alreadyDoctor) {
      throw new ConflictException('This user already has a Doctor profile');
    }

    const speciality = await this.doctorRepository.findSpecialityById(
      data.speciality_id,
    );
    if (!speciality) {
      throw new NotFoundException(
        `Speciality with id ${data.speciality_id} not found`,
      );
    }

    const created = await this.doctorRepository.create({
      licence_number: data.licence_number,
      user,
      speciality,
    });

    return this.toResponseDto(created);
  }

  async findAll() {
    const list = await this.doctorRepository.findAll();
    return list.map((doctor) => this.toResponseDto(doctor));
  }

  async findOne(id: string) {
    const doctor = await this.doctorRepository.findOne(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }

    return this.toResponseDto(doctor);
  }

  async update(
    id: string,
    data: Partial<{ licence_number: string; speciality_id: string }>,
  ) {
    if (!data.licence_number && !data.speciality_id) {
      throw new BadRequestException('Nothing to update');
    }

    const current = await this.doctorRepository.findOne(id);
    if (!current) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }

    if (data.licence_number && data.licence_number !== current.licence_number) {
      const exists = await this.doctorRepository.findByLicence(
        data.licence_number,
      );
      if (exists) {
        throw new ConflictException('Licence number already exists');
      }
    }

    let speciality: Speciality | undefined;
    if (data.speciality_id) {
      speciality = await this.doctorRepository.findSpecialityById(
        data.speciality_id,
      );
      if (!speciality) {
        throw new NotFoundException(
          `Speciality with id ${data.speciality_id} not found`,
        );
      }
    }

    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Updated doctor not found');
    }

    return updated;
  }

  async findMeDoctor(user: { sub: string; role: RolesEnum }) {
    if (user.role !== RolesEnum.Medic) {
      throw new ForbiddenException(
        'Only users with Medic role can access this resource',
      );
    }

    const doctor = await this.doctorRepository.findOneByUserId(user.sub);

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found for this user');
    }

    return this.toResponseDto(doctor);
  }

  async remove(id: string) {
    const doctor = await this.doctorRepository.findOne(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }
    return this.doctorRepository.remove(id);
  }
}
