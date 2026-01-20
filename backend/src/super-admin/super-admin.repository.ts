import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { RolesEnum } from '../user/enums/roles.enum';
import { Doctor } from '../doctor/entities/doctor.entity';
import { SpecialityEnum } from './enum/speciality.enum';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Between } from 'typeorm';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';

@Injectable()
export class SuperAdminRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async findAll(role?: RolesEnum, isActive?: boolean) {
    const usersFound = await this.userRepository.find({
      where: { role, is_active: isActive },
    });
    return usersFound;
  }

  async findAllDoctors(specialty?: SpecialityEnum) {
    const roleDoctor = await this.doctorRepository.find({
      relations: { speciality: true, user: true },
    });
    let doctors = roleDoctor;
    if (specialty) {
      const specialityForDb = specialty.toLowerCase().split('_').join(' ');
      doctors = roleDoctor.filter(
        (doctor) =>
          doctor.speciality.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') ===
          specialityForDb.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      );
    }
    return doctors.map((doctor) => {
      const { password, ...safeUser } = doctor.user;

      return {
        ...doctor,
        user: safeUser,
        speciality: {
          name: doctor.speciality.name,
        },
      };
    });
  }

  async update(user: User) {
    return await this.userRepository.save(user);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async countAppointmentsByDateRange(
    start: Date,
    end: Date,
    status?: AppointmentStatus,
  ) {
    const where: any = {
      date: Between(start, end),
    };

    if (status) {
      where.status = status;
    }

    return this.appointmentRepository.count({ where });
  }

  async sumAppointmentPriceByDateRange(start: Date, end: Date) {
    const result = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('COALESCE(SUM(appointment.priceAtBooking), 0)', 'total')
      .where('appointment.date BETWEEN :start AND :end', { start, end })
      .getRawOne();

    return Number(result.total);
  }

  async countAppointmentsGroupedByMonth(year: number) {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('EXTRACT(MONTH FROM appointment.date)', 'month')
      .addSelect('COUNT(*)', 'total')
      .where('EXTRACT(YEAR FROM appointment.date) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async sumPriceGroupedByMonth(year: number) {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('EXTRACT(MONTH FROM appointment.date)', 'month')
      .addSelect('SUM(appointment.priceAtBooking)', 'revenue')
      .where('EXTRACT(YEAR FROM appointment.date) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async countAppointmentsGroupedByStatus(year: number) {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.status', 'status')
      .addSelect('COUNT(*)', 'total')
      .where('EXTRACT(YEAR FROM appointment.date) = :year', { year })
      .groupBy('appointment.status')
      .getRawMany();
  }
}
