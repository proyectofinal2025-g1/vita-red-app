export const isWeekend = (dateStr: string): boolean => {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.getUTCDay() === 0 || date.getUTCDay() === 6;
};

export const getDayOfWeekAsNumber = (date: Date): number => {
  const jsDay = date.getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
};

export const getMinDateForAppointment = (): string => {
  const now = new Date();
  return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
};

export const isWithin24Hours = (date: Date, time: string): boolean => {
  const appointmentDateTime = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);

  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();

  return appointmentDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
};
