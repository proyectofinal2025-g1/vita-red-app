import { DayOfWeekEnum } from '../enum/enumDays';

export const DayOfWeekMap: Record<DayOfWeekEnum, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

export function mapDayToNumber(day: DayOfWeekEnum): number {
  return DayOfWeekMap[day];
}
