import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Raw, Repository } from 'typeorm';

import { Appointment } from './entities/appointment.entity';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { CreateAppointmentPreReserveDto } from './dto/create-appointment-pre-reserve.dto';

import { User } from '../user/entities/user.entity';
import { Speciality } from '../speciality/entities/speciality.entity';
import { Doctor } from '../doctor/entities/doctor.entity';

import { DoctorScheduleService } from '../doctor/schedule/schedule.service';
import { AppointmentRules } from './rules/appointment.rules';
import { AppointmentTimeHelper } from './utils/appointment-time.helper';
import { AppointmentsRepository } from './appointments.repository';
import { PreReserveAppointmentResponseDto } from './dto/pre-reserve-appointment-response.dto';
import { NotificationService } from '../notification/notification.service';

type PreReservedAppointmentForPayment = {
  id: string;
  expiresAt: Date;
  priceAtBooking: number;
  patient: {
    email: string;
  };
  speciality?: {
    name: string;
  };
};

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly doctorScheduleService: DoctorScheduleService,
    private readonly appointmentRepository: AppointmentsRepository,
    private readonly notificationService: NotificationService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
  ) { }

  async preReserveAppointment(
    dto: CreateAppointmentPreReserveDto,
    patientId: string,
  ): Promise<PreReserveAppointmentResponseDto> {
    const patient = await this.userRepository.findOne({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const doctor = await this.doctorRepository.findOne({
      where: { id: dto.doctorId },
      relations: ['user'],
    });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }

    if (doctor.consultationPrice == null) {
      throw new BadRequestException(
        'El médico no tiene un precio de consulta configurado',
      );
    }

    let speciality: Speciality | null = null;
    if (dto.specialtyId) {
      speciality = await this.specialityRepository.findOne({
        where: { id: dto.specialtyId },
      });
      if (!speciality) {
        throw new NotFoundException('Especialidad no encontrada');
      }
    }

    const appointmentDate = AppointmentTimeHelper.parseArgentinaDate(
      dto.dateTime,
    );

    const now = AppointmentTimeHelper.nowArgentina();

    AppointmentRules.validateNotInPast(appointmentDate, now);

    AppointmentRules.validateWorkingDay(appointmentDate);

    AppointmentRules.validateWorkingHours(appointmentDate, 8, 18);

    AppointmentRules.validateMinimumAnticipation(appointmentDate, now, 12);

    await this.doctorScheduleService.validateScheduleForAppointment(
      doctor.id,
      appointmentDate,
    );

    const doctorConflict = await this.appointmentRepository.existsConflict({
      doctorId: doctor.id,
      date: appointmentDate,
    });

    if (doctorConflict) {
      throw new BadRequestException(
        'El médico ya tiene un turno en ese horario',
      );
    }

    const patientConflict = await this.appointmentRepository.existsConflict({
      patientId: patient.id,
      date: appointmentDate,
    });

    if (patientConflict) {
      throw new BadRequestException(
        'El paciente ya tiene un turno en ese horario',
      );
    }

    const expiresAt = AppointmentTimeHelper.addMinutesInArgentina(now, 10);

    const appointment = this.appointmentRepository.create({
      date: appointmentDate,
      status: AppointmentStatus.PENDING,
      createdAt: now,
      expiresAt,
      patient,
      doctor,
      speciality: speciality ?? undefined,
      createdBy: patient,
      priceAtBooking: doctor.consultationPrice,
    });

    const saved = await this.appointmentRepository.save(appointment);

    return {
      appointmentId: saved.id,
      expiresAt: saved.expiresAt!,
      price: saved.priceAtBooking
    }
  }

  private toResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      date: appointment.date,
      status: appointment.status,
      reason: appointment.reason,
      createdAt: appointment.createdAt,
      expiresAt: appointment.expiresAt,
      price: appointment.priceAtBooking,

      patient: {
        id: appointment.patient.id,
        fullName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
        email: appointment.patient.email,
      },

      doctor: {
        id: appointment.doctor.id,
        fullName: `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`,
        consultationFee: appointment.priceAtBooking,
      },

      speciality: appointment.speciality
        ? {
          id: appointment.speciality.id,
          name: appointment.speciality.name,
        }
        : undefined,
    };
  }

  async cancelAppointment(
    appointmentId: string,
    cancelledByUserId: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: {
        patient: true,
        doctor: { user: true },
        speciality: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Turno no encontrado');
    }

    const now = AppointmentTimeHelper.nowArgentina();

    AppointmentRules.validateCancellableStatus(appointment.status);

    AppointmentRules.validateCancellationWindow(appointment.date, now, 24);

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancelledAt = now;
    appointment.cancelledBy = { id: cancelledByUserId } as any;

    await this.appointmentRepository.save(appointment);
    const notification = { email: appointment.patient.email, first_name: appointment.patient.first_name, date: appointment.date }
    await this.notificationService.sendAppointmentCancelledNotification(notification)
    return this.toResponseDto(appointment);
  }

  async confirmPayment(
    appointmentId: string,
    paymentReference?: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: {
        patient: true,
        doctor: { user: true },
        speciality: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Turno no encontrado');
    }

    const now = AppointmentTimeHelper.nowArgentina();

    if (
      appointment.status === AppointmentStatus.PENDING &&
      appointment.expiresAt &&
      appointment.expiresAt < now
    ) {
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.cancelledAt = now;
      await this.appointmentRepository.save(appointment);

      throw new BadRequestException(
        'El turno ha expirado y no puede ser confirmado',
      );
    }

    AppointmentRules.validatePayableStatus(appointment.status);

    AppointmentRules.validateNotExpired(appointment.expiresAt, now);

    appointment.status = AppointmentStatus.CONFIRMED;
    appointment.paidAt = now;
    appointment.paymentReference = paymentReference;

    await this.appointmentRepository.save(appointment);
    const notification = { email: appointment.patient.email, first_name: appointment.patient.first_name, date: appointment.date, doctorName: `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}` }
    await this.notificationService.sendAppointmentCreatedNotification(notification)
    return this.toResponseDto(appointment);
  }

  async findPreReservedById(
    appointmentId: string,
  ): Promise<PreReservedAppointmentForPayment> {
    const appointment =
      await this.appointmentRepository.findPreReservedById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('El turno no existe o no está pre-reservado');
    }

    const now = AppointmentTimeHelper.nowArgentina();

    AppointmentRules.validateNotExpired(appointment.expiresAt, now);

    return {
      id: appointment.id,
      expiresAt: appointment.expiresAt!,
      priceAtBooking: appointment.priceAtBooking,
      patient: {
        email: appointment.patient.email,
      },
      speciality: appointment.speciality
        ? { name: appointment.speciality.name }
        : undefined,
    };
  }

  async findById(id: string) {
    return this.appointmentRepository.findOne({
      where: { id },
    });
  }

  async findByFiltersPatient(filters: {
    patientId: string;
    date?: string;
    speciality?: string;
  }) {
    const { patientId, date, speciality } = filters;

    const where: any = {
      patient: { id: patientId },
    };

    if (date) {
      where.date = Raw(
        (alias) => `DATE(${alias}) = :date`,
        { date },
      );
    }
    console.log('appoint', date)

    if (speciality) {
      where.speciality = { name: ILike(`%${speciality}%`) };
    }

    const appointments = await this.appointmentRepository.find({
      where,
      relations: {
        doctor: { user: true },
        speciality: true,
        patient: true,
      },
      order: {
        date: 'ASC',
      },
    });


    return appointments;
  }


  async findByFiltersDoctor(filters: {
    doctorId: string;
    date?: string;
    patientId?: string;
  }) {
    const { doctorId, date, patientId } = filters;

    const where: any = {
      doctor: { id: doctorId },
    };

    if (date) {
      where.date = Raw(
        (alias) => `DATE(${alias}) = :date`,
        { date },
      );
    }

    if (patientId) {
      where.patientId = { id: { patientId } };
    }

    const appointments = await this.appointmentRepository.find({
      where,
      relations: {
        doctor: { user: true },
        speciality: true,
        patient: true,
      },
      order: {
        date: 'ASC',
      },
    });


    return appointments;
  }

}
