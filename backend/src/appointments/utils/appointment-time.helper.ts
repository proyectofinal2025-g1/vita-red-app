import { toZonedTime } from 'date-fns-tz';

const ARG_TIMEZONE = 'America/Argentina/Buenos_Aires';

export class AppointmentTimeHelper {
  static nowArgentina(): Date {
    return toZonedTime(new Date(), ARG_TIMEZONE);
  }

  static parseArgentinaDate(dateFromFront: string): Date {
    const [date, time] = dateFromFront.split('T');
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const utcDate = new Date(Date.UTC(year, month - 1, day, hour + 3, minute));

    return utcDate;
  }

  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60_000);
  }

  static toArgentina(date: Date): Date {
    return toZonedTime(date, ARG_TIMEZONE);
  }
}
