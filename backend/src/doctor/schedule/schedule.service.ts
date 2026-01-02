import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorSchedule } from './entities/schedule.entity';
import { Doctor } from '../entities/doctor.entity';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { DoctorService } from '../doctor.service';
import { mapDayToNumber } from './helper/mapDayOfWeek.helper';
import { DoctorScheduleResponseDto } from './dto/doctor-schedule-response.dto';
import { mapNumberToDay } from './helper/mapDaysOfWeekNumToString.helper';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { RolesEnum } from '../../user/enums/roles.enum';

@Injectable()
export class DoctorScheduleService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly scheduleRepo: Repository<DoctorSchedule>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    private readonly doctorService: DoctorService
  ) { }


  async create(
    dto: CreateDoctorScheduleDto,
    userId: string,
    role: RolesEnum,
  ): Promise<DoctorScheduleResponseDto> {

    let doctor: Doctor | null = null;

    if (role === RolesEnum.Medic) {
      doctor = await this.doctorRepo.findOne({
        where: {
          user: { id: userId },
          isActive: true,
        },
        relations: { user: true },
      });

      if (!doctor) {
        throw new ForbiddenException('The user is not a doctor.');
      }

      if (dto.doctorId && dto.doctorId !== doctor.id) {
        throw new ForbiddenException('You cannot create schedules for another doctor.');
      }
    }

    if (role === RolesEnum.Secretary) {
      doctor = await this.doctorRepo.findOne({
        where: { id: dto.doctorId, isActive: true },
      });

      if (!doctor) {
        throw new NotFoundException('Not found doctor.');
      }
    }

    if (!doctor) {
      throw new ForbiddenException('Unauthorized role.');
    }

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException(
        'The start time must be earlier than the end time.',
      );
    }


    const findDay = await this.scheduleRepo.findOne({
      where: {
        doctor: { id: doctor.id },
        dayOfWeek: mapDayToNumber(dto.dayOfWeek),
      },
    })
    if (findDay) throw new BadRequestException('There is already a schedule available for the requested day.')

    const schedule = await this.scheduleRepo.create({
      doctor,
      dayOfWeek: mapDayToNumber(dto.dayOfWeek),
      startTime: dto.startTime,
      endTime: dto.endTime,
      slotDuration: dto.slotDuration,
    });

    const saved = await this.scheduleRepo.save(schedule);

    return {
      id: saved.id,
      doctorId: doctor.id,
      dayOfWeek: mapNumberToDay(saved.dayOfWeek),
      startTime: saved.startTime,
      endTime: saved.endTime,
      slotDuration: saved.slotDuration,
    };
  }


  async findByDoctor(
    doctorId: string,
    userId: string,
    userRole: RolesEnum,
  ): Promise<DoctorScheduleResponseDto[]> {

    let doctor: Doctor | null = null;

    if (userRole === RolesEnum.Medic) {
      doctor = await this.doctorRepo.findOne({
        where: {
          user: { id: userId },
          isActive: true,
        },
        relations: { user: true },
      });

      if (!doctor) {
        throw new ForbiddenException(
          'The user is not associated with a doctor',
        );
      }

      if (doctor.id !== doctorId) {
        throw new ForbiddenException("You can't see another doctor's schedule.");
      }
    }

    if (
      userRole === RolesEnum.Secretary ||
      userRole === RolesEnum.SuperAdmin
    ) {
      doctor = await this.doctorRepo.findOne({
        where: { id: doctorId, isActive: true },
      });

      if (!doctor) {
        throw new NotFoundException('Not found doctor.');
      }
    }

    if (!doctor) {
      throw new ForbiddenException('Unauthorized role.');
    }

    const schedulesList = await this.scheduleRepo.find({
      where: { doctor: { id: doctor.id } },
      relations: { doctor: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });

    if (schedulesList.length === 0) {
      throw new NotFoundException(
        'There are no appointments available for this doctor.',
      );
    }

    return schedulesList.map((sch) => ({
      id: sch.id,
      doctorId: sch.doctor.id,
      dayOfWeek: mapNumberToDay(sch.dayOfWeek),
      startTime: sch.startTime,
      endTime: sch.endTime,
      slotDuration: sch.slotDuration,
    }));
  }



  async validateScheduleForAppointment(
    doctorId: string,
    appointmentDate: Date,
  ): Promise<void> {
    const schedules = await this.scheduleRepo.find({
      where: { doctor: { id: doctorId } },
    });

    if (schedules.length === 0) {
      throw new BadRequestException('The doctor does not have set hours.');
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
        "The appointment is not within the doctor's office hours."
      );
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }



  async updateScheduleDoctor(
    doctorId: string,
    dto: UpdateDoctorScheduleDto,
    role: RolesEnum,
  ): Promise<DoctorScheduleResponseDto> {

    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('You cannot pass an empty object');
    }

    const doctor = await this.doctorService.findyById(doctorId);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const dayNumber = mapDayToNumber(dto.dayOfWeek);

    const schedule = await this.scheduleRepo.findOne({
      where: {
        doctor: { id: doctor.id },
        dayOfWeek: dayNumber,
      },
      relations: { doctor: true },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (role === RolesEnum.Medic && schedule.doctor.id !== doctorId) {
      throw new ForbiddenException(
        "You cannot modify another doctor's schedule"
      );
    }

    const updateData: Partial<DoctorSchedule> = {
      ...dto,
      dayOfWeek: dayNumber,
    };

    await this.scheduleRepo.update(schedule.id, updateData);

    const updatedSchedule = await this.scheduleRepo.findOne({
      where: { id: schedule.id },
      relations: { doctor: true },
    });

    if (!updatedSchedule) throw new NotFoundException('No schedules were found for change.')

    return {
      id: updatedSchedule.id,
      doctorId: updatedSchedule.doctor.id,
      dayOfWeek: mapNumberToDay(updatedSchedule.dayOfWeek),
      startTime: updatedSchedule.startTime,
      endTime: updatedSchedule.endTime,
      slotDuration: updatedSchedule.slotDuration,
    };
  }


}
