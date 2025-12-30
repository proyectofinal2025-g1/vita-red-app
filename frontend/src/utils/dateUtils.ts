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

export const isWithin24Hours = (dateStr: string, timeStr: string): boolean => {
  const selected = new Date(`${dateStr}T${timeStr}`);
  const min = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return selected < min;
};
