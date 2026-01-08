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

  // ======================================================
  // PRE-RESERVA (AJUSTE DE HORA + EXPIRACIÓN UTC)
  // ======================================================
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

    // 📅 Fecha/hora del turno (Argentina)
    const appointmentDate =
      AppointmentTimeHelper.parseArgentinaDate(dto.dateTime);

    const nowArgentina = AppointmentTimeHelper.nowArgentina();

    AppointmentRules.validateNotInPast(appointmentDate, nowArgentina);
    AppointmentRules.validateWorkingDay(appointmentDate);
    AppointmentRules.validateWorkingHours(appointmentDate, 8, 18);
    AppointmentRules.validateMinimumAnticipation(
      appointmentDate,
      nowArgentina,
      12,
    );

    await this.doctorScheduleService.validateScheduleForAppointment(
      doctor.id,
      appointmentDate,
    );

    const sameDayWithDoctor =
      await this.appointmentRepository.existsSameDayWithDoctor(
        patient.id,
        doctor.id,
        appointmentDate,
      );

    if (sameDayWithDoctor) {
      throw new BadRequestException(
        'No podés agendar más de un turno el mismo día con el mismo médico',
      );
    }

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

    // 🔑 EXPIRACIÓN CORRECTA (UTC, EMPAREJADA CON PAYMENT SERVICE)
    const nowUtc = new Date();
    const expiresAt = new Date(nowUtc.getTime() + 10 * 60 * 1000); // +10 min

    const appointment = this.appointmentRepository.create({
      date: appointmentDate,
      status: AppointmentStatus.PENDING,
      expiresAt,
      patient: { id: patient.id } as User,
      doctor,
      speciality: speciality ?? undefined,
      priceAtBooking: doctor.consultationPrice,
    });

    const saved = await this.appointmentRepository.save(appointment);

    return {
      appointmentId: saved.id,
      expiresAt: saved.expiresAt!,
      price: saved.priceAtBooking,
    };
  }

  // ======================================================
  // RESPUESTA
  // ======================================================
  private toResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      date: appointment.date,
      status: appointment.status,
      reason: appointment.reason,
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

  // ======================================================
  // CANCELAR TURNO
  // ======================================================
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

    const nowArgentina = AppointmentTimeHelper.nowArgentina();

    AppointmentRules.validateCancellableStatus(appointment.status);
    AppointmentRules.validateCancellationWindow(
      appointment.date,
      nowArgentina,
      24,
    );

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancelledAt = nowArgentina;
    appointment.cancelledBy = { id: cancelledByUserId } as any;

    await this.appointmentRepository.save(appointment);

    const dateArgentina = appointment.date.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    });

    const timeArgentina = appointment.date.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.notificationService.sendAppointmentCancelledNotification({
      email: appointment.patient.email,
      first_name: appointment.patient.first_name,
      date: dateArgentina,
      time:timeArgentina
    });

    return this.toResponseDto(appointment);
  }

  // ======================================================
  // CONFIRMAR PAGO
  // ======================================================
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

    const nowUtc = new Date();

    if (
      appointment.status === AppointmentStatus.PENDING &&
      appointment.expiresAt &&
      appointment.expiresAt < nowUtc
    ) {
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.cancelledAt = nowUtc;
      await this.appointmentRepository.save(appointment);

      throw new BadRequestException(
        'El turno ha expirado y no puede ser confirmado',
      );
    }

    AppointmentRules.validatePayableStatus(appointment.status);
    AppointmentRules.validateNotExpired(appointment.expiresAt, nowUtc);

    appointment.status = AppointmentStatus.CONFIRMED;
    appointment.paidAt = nowUtc;
    appointment.paymentReference = paymentReference;

    await this.appointmentRepository.save(appointment);
    const dateArgentina = appointment.date.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    });

    const timeArgentina = appointment.date.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.notificationService.sendAppointmentCreatedNotification({
      email: appointment.patient.email,
      first_name: appointment.patient.first_name,
      date: dateArgentina,
      time: timeArgentina,
      doctorName: `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`,
    });
    return this.toResponseDto(appointment);
  }

  // ======================================================
  // PRE-RESERVA PARA PAYMENT
  // ======================================================
  async findPreReservedById(
    appointmentId: string,
  ): Promise<PreReservedAppointmentForPayment> {
    const appointment =
      await this.appointmentRepository.findPreReservedById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('El turno no existe o no está pre-reservado');
    }

    const nowUtc = new Date();
    AppointmentRules.validateNotExpired(appointment.expiresAt, nowUtc);

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

  // ======================================================
  // BÚSQUEDAS
  // ======================================================
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
      where.date = Raw((alias) => `DATE(${alias}) = :date`, { date });
    }

    if (speciality) {
      where.speciality = { name: ILike(`%${speciality}%`) };
    }

    return this.appointmentRepository.find({
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
      where.date = Raw((alias) => `DATE(${alias}) = :date`, { date });
    }

    if (patientId) {
      where.patient = { id: patientId };
    }

    return this.appointmentRepository.find({
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
  }

  async findAllByPatientId(
    patientId: string,
  ): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentRepository.find({
      where: {
        patient: { id: patientId },
      },
      relations: {
        doctor: { user: true },
        speciality: true,
        patient: true,
      },
      order: {
        date: 'ASC',
      },
    });

    return appointments.map((appointment) =>
      this.toResponseDto(appointment),
    );
  }

   async findAppointmentsByMedic(params: { doctorId?: string; fullName?: string }) {
  if (params.doctorId) {
    return this.appointmentRepository.findByDoctorId(params.doctorId);
  }

  if (params.fullName) {
    return this.appointmentRepository.findByFullName(params.fullName);
  }

  throw new BadRequestException('Debe indicar un médico por id o por nombre');
}

}
