const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getDoctorAvailability = async (
  doctorId: string,
  date: string,
  token: string
) => {
  const response = await fetch(
    `${API_URL}/appointments/availability?doctorId=${doctorId}&date=${date}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener disponibilidad del médico");
  }

  return response.json();
};
