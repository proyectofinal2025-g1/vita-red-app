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
import { DoctorFindResponseDto } from './dto/doctor-find-response.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { User } from '../user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUser_DoctorDto } from './dto/createUser-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly dataSource: DataSource,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    private readonly appointmentService: AppointmentsService
  ) { }

  private toResponseDto(doctor: Doctor): DoctorResponseDto {
    return {
      id: doctor.id,
      licence_number: doctor.licence_number,
      user_id: doctor.user.id,
      speciality_id: doctor.speciality.id,
      isActive: doctor.isActive,
      consultationPrice: doctor.consultationPrice as number,
    };
  }

  async createDoctorWithUser(dto: CreateUser_DoctorDto) {
    return await this.dataSource.transaction(async manager => {
      const emailExist = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (emailExist) {
        throw new BadRequestException('El email ya está en uso');
      }

      const dniExist = await manager.findOne(User, {
        where: { dni: dto.dni },
      });
      if (dniExist) {
        throw new BadRequestException('El DNI ya está en uso');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      
      const user = await manager.save(User, {
        email: dto.email,
        password: hashedPassword,
        first_name: dto.first_name,
        last_name: dto.last_name,
        dni: dto.dni,
        role: RolesEnum.Medic,
        is_active: false
      })

      await manager.save(Doctor, {
        licence_number: dto.licence_number,
        speciality: { id: dto.speciality_id },
        user
      })

      return { message: `El usuario se ha creado correctamente, tiene que esperar a que el administrador le de la alta para poder operar en la página` }
    })
  }

  async create(data: CreateDoctorDto) {

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

  async findAll(): Promise<DoctorFindResponseDto[]> {
    const listDoctors = await this.doctorRepository.findAll();

    return listDoctors.map((doctor) => ({
      id: doctor.id,
      fullName: `${doctor.user.first_name} ${doctor.user.last_name}`,
      speciality: doctor.speciality.name,
      licence_number: doctor.licence_number,
    }));
  }

  async findOne(id: string) {
    const doctor = await this.doctorRepository.findOne(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }

    return this.toResponseDto(doctor);
  }

  /* necesito q devuelva la entidad para la relaciones en medical-records*/
  async findyById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }
    return doctor;
  }


  async findByDoctorName(name: string): Promise<DoctorFindResponseDto[]> {
    const doctors = await this.doctorRepository.findByDoctorName(name);

    return doctors.map((doctor) => ({
      id: doctor.id,
      fullName: `${doctor.user.first_name} ${doctor.user.last_name}`,
      speciality: doctor.speciality.name,
      licence_number: doctor.licence_number,
    }));
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


  async getAppointments(id: string) {
    const doctor = await this.doctorRepo.findOne({
    where: { user: { id: id } },
    relations: ['user'] });
    const doctorId = doctor?.id
    if(!doctorId) throw new NotFoundException('Not found doctor')
    return await this.appointmentService.findAppointmentsByMedic(doctorId)
  }
}
