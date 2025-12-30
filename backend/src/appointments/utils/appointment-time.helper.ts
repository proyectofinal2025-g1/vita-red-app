import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const ARG_TIMEZONE = 'America/Argentina/Buenos_Aires';

export class AppointmentTimeHelper {
  static nowArgentina(): Date {
    const nowUtc = new Date();
    return toZonedTime(nowUtc, ARG_TIMEZONE);
  }

  static parseArgentinaDate(dateFromFront: string): Date {
    return fromZonedTime(dateFromFront, ARG_TIMEZONE);
  }

  static addMinutesInArgentina(date: Date, minutes: number): Date {
    const dateInArgentina = toZonedTime(date, ARG_TIMEZONE);
    const result = new Date(dateInArgentina.getTime() + minutes * 60_000);
    return fromZonedTime(result, ARG_TIMEZONE);
  }
}
