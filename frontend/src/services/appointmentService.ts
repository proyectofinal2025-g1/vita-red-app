const apiURL = process.env.NEXT_PUBLIC_API_URL;

export interface DoctorSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  doctorId: string;
}

export interface AppointmentPreReserveDto {
  doctorId: string;
  dateTime: string; // ISO 8601
  specialtyId?: string;
}

export const getDoctorSchedules = async (
  doctorId: string,
  token: string
): Promise<DoctorSchedule[]> => {
  const res = await fetch(`${apiURL}/doctors/schedules/${doctorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("No se pudieron cargar los horarios del médico");
  }

  return res.json();
};

export const preReserveAppointment = async (
  dto: AppointmentPreReserveDto,
  token: string
): Promise<any> => {
  try {
    const res = await fetch(`${apiURL}/appointments/pre-reserve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "No se pudo crear la cita");
    }

    return await res.json();
  } catch (error) {
    console.error("Error en preReserveAppointment:", error);
    throw error;
  }
};

export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  duration: number
): string[] => {
  const cleanStart =
    startTime.length > 5 ? startTime.substring(0, 5) : startTime;
  const cleanEnd = endTime.length > 5 ? endTime.substring(0, 5) : endTime;

  const [startH, startM] = cleanStart.split(":").map(Number);
  const [endH, endM] = cleanEnd.split(":").map(Number);

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  const slots: string[] = [];
  for (let time = start; time < end; time += duration) {
    const h = Math.floor(time / 60);
    const m = time % 60;
    slots.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
  }
  return slots;
};
