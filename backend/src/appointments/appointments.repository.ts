import { Injectable, NotFoundException } from '@nestjs/common';
import { Between, DataSource, Raw, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppointmentsRepository extends Repository<Appointment> {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Appointment)
    private readonly AppointmentRepo: Repository<Appointment>,
  ) {
    super(Appointment, dataSource.createEntityManager());
  }

  async existsConflict(params: {
    doctorId?: string;
    patientId?: string;
    date: Date;
  }): Promise<boolean> {
    const { doctorId, patientId, date } = params;

    const qb = this.createQueryBuilder('appointment')
      .where('appointment.date = :date', { date })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      });

    if (doctorId) {
      qb.innerJoin('appointment.doctor', 'doctor').andWhere(
        'doctor.id = :doctorId',
        { doctorId },
      );
    }

    if (patientId) {
      qb.innerJoin('appointment.patient', 'patient').andWhere(
        'patient.id = :patientId',
        { patientId },
      );
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async findPreReservedById(id: string): Promise<Appointment | null> {
    return this.AppointmentRepo.findOne({
      where: {
        id,
        status: AppointmentStatus.PENDING,
      },
      relations: {
        patient: true,
        speciality: true,
      },
    });
  }


async existsSameDayWithDoctor(
  patientId: string,
  doctorId: string,
  date: Date,
): Promise<boolean> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.exists({
    where: {
      patient: { id: patientId },
      doctor: { id: doctorId },
      date: Between(startOfDay, endOfDay),
    },
  });
}



  async findByDoctorId(doctorId: string) {
    const listAppointments = await this.AppointmentRepo.find({
      where: {
        doctor: { id: doctorId },
      },
      relations: ['doctor'],
    });

    if (!listAppointments) throw new NotFoundException('Not Found for this doctor appointments.')
    return listAppointments
  }


  async findByFullName(fullName: string) {
    const listAppointments = await this.AppointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .where("user.firstName || ' ' || user.lastName ILIKE :fullName", { fullName: `%${fullName}%` })
      .getMany();

    if (!listAppointments) throw new NotFoundException('Not Found for this doctor appointments.')
    return listAppointments
  }


}
