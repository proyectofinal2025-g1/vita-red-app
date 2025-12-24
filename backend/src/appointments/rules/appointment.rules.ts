import { BadRequestException } from '@nestjs/common';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class AppointmentRules {
  static validateWorkingDay(date: Date): void {
    const day = date.getDay();

    if (day === 0 || day === 6) {
      throw new BadRequestException(
        'No se pueden agendar turnos los fines de semana',
      );
    }
  }

  static validateWorkingHours(
    date: Date,
    startHour: number,
    endHour: number,
  ): void {
    const hour = date.getHours();
    const minutes = date.getMinutes();

    if (hour < startHour) {
      throw new BadRequestException(
        `Los turnos comienzan a partir de las ${startHour}:00`,
      );
    }

    if (hour >= endHour) {
      throw new BadRequestException(
        `Los turnos no pueden ser después de las ${endHour}:00`,
      );
    }

    if (minutes !== 0 && minutes !== 30) {
      throw new BadRequestException(
        'Los turnos solo pueden ser en intervalos de 30 minutos',
      );
    }
  }

  static validateMinimumAnticipation(
    appointmentDate: Date,
    now: Date,
    minHours: number,
  ): void {
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < minHours) {
      throw new BadRequestException(
        `Los turnos deben reservarse con al menos ${minHours} horas de anticipación`,
      );
    }
  }

  static validateCancellableStatus(status: AppointmentStatus): void {
    if (status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('El turno ya se encuentra cancelado');
    }
  }

  static validateCancellationWindow(
    appointmentDate: Date,
    now: Date,
    minHoursBefore: number,
  ): void {
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < minHoursBefore) {
      throw new BadRequestException(
        `No se puede cancelar el turno con menos de ${minHoursBefore} horas de anticipación`,
      );
    }
  }

  static validateConfirmableStatus(status: AppointmentStatus): void {
    if (status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        'Solo se pueden confirmar turnos en estado pendiente',
      );
    }
  }

  static validateNotExpired(
    expiresAt: Date | null | undefined,
    now: Date,
  ): void {
    if (expiresAt && expiresAt.getTime() < now.getTime()) {
      throw new BadRequestException(
        'El turno expiró y no puede ser confirmado',
      );
    }
  }

  static validatePayableStatus(status: AppointmentStatus): void {
    if (status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        'El turno no se encuentra en estado pendiente de pago',
      );
    }
  }

  static validateNotInPast(appointmentDate: Date, now: Date): void {
    if (appointmentDate.getTime() <= now.getTime()) {
      throw new BadRequestException(
        'No se puede reservar un turno en una fecha u horario pasado',
      );
    }
  }
}
