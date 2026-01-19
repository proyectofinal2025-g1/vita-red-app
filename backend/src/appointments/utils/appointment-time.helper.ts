import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const ARG_TIMEZONE = 'America/Argentina/Buenos_Aires';

export class AppointmentTimeHelper {

  static now(): Date {
    return new Date();
  }

  
  static parseArgentinaDate(dateTimeFromFront: string): Date {
    return fromZonedTime(dateTimeFromFront, ARG_TIMEZONE);
  }

  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60_000);
  }

  
  static toArgentina(date: Date): Date {
    return toZonedTime(date, ARG_TIMEZONE);
  }
}
