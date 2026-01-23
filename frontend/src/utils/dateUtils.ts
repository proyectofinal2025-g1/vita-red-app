export const isWeekend = (dateStr: string): boolean => {
  const date = new Date(`${dateStr}T00:00:00-03:00`);
  const day = date.getDay(); // 0 = domingo, 6 = sábado
  return day === 0 || day === 6;
};

export const getDayOfWeekAsNumber = (date: Date): number => {
  const jsDay = date.getDay(); // 0 (dom) - 6 (sab)
  return jsDay === 0 ? 7 : jsDay;
};

export const getMinDateForAppointment = (): string => {
  const now = new Date();
  const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return [
    minDate.getFullYear(),
    String(minDate.getMonth() + 1).padStart(2, "0"),
    String(minDate.getDate()).padStart(2, "0"),
  ].join("-");
};

export const isWithin24Hours = (date: Date, time: string): boolean => {
  const appointmentDateTime = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);

  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();

  return appointmentDateTime.getTime() - now.getTime() < 12 * 60 * 60 * 1000;
};


export const parseArgentinaDateTime = (dateTime: string): Date => {
  return new Date(`${dateTime}-03:00`);
};
