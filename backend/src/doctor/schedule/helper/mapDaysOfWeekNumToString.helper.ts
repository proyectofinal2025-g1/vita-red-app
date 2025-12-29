import { DayOfWeekEnum } from "../enum/enumDays";

export const dayNumberToEnum: Record<number, DayOfWeekEnum> = {
  0: DayOfWeekEnum.Domingo,
  1: DayOfWeekEnum.Lunes,
  2: DayOfWeekEnum.Martes,
  3: DayOfWeekEnum.Miercoles,
  4: DayOfWeekEnum.Jueves,
  5: DayOfWeekEnum.Viernes,
  6: DayOfWeekEnum.Sabado,
};

export function mapNumberToDay(day: number): DayOfWeekEnum {
  const result = dayNumberToEnum[day];
  if (result === undefined) {
    throw new Error('Invalid day number');
  }
  return result;
}
