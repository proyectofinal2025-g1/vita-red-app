import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DoctorSchedule } from './entities/schedule.entity';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class DoctorScheduleService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly scheduleRepo: Repository<DoctorSchedule>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async create(
    data: Pick<
      DoctorSchedule,
      'dayOfWeek' | 'startTime' | 'endTime' | 'slotDuration'
    >,
    doctorId: string,
  ): Promise<DoctorSchedule> {
    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId, isActive: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    if (data.startTime >= data.endTime) {
      throw new BadRequestException(
        'La hora de inicio debe ser menor a la de fin',
      );
    }

    const schedule = this.scheduleRepo.create({
      ...data,
      doctor,
    });

    return this.scheduleRepo.save(schedule);
  }

  async findByDoctor(doctorId: string): Promise<DoctorSchedule[]> {
    return this.scheduleRepo.find({
      where: { doctor: { id: doctorId } },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async validateScheduleForAppointment(
    doctorId: string,
    appointmentDate: Date,
  ): Promise<void> {
    const schedules = await this.findByDoctor(doctorId);

    if (schedules.length === 0) {
      throw new BadRequestException('El médico no tiene horarios configurados');
    }

    const appointmentDay = appointmentDate.getDay();

    const appointmentMinutes =
      appointmentDate.getHours() * 60 + appointmentDate.getMinutes();

    const isValid = schedules.some((s) => {
      if (s.dayOfWeek !== appointmentDay) return false;

      const startMinutes = this.timeToMinutes(s.startTime);
      const endMinutes = this.timeToMinutes(s.endTime);

      return (
        appointmentMinutes >= startMinutes && appointmentMinutes < endMinutes
      );
    });

    if (!isValid) {
      throw new BadRequestException(
        'El turno no se encuentra dentro del horario de atención del médico',
      );
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
