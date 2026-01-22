const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function get<T>(url: string): Promise<T> {
  const userSession = localStorage.getItem('userSession');
  if (!userSession) {
    throw new Error('Sesión no encontrada');
  }

  const { token } = JSON.parse(userSession);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Error fetching dashboard data');
  }

  return res.json();
}

export const getDashboardKpis = (year?: number) => {
  const params = year ? `?year=${year}` : '';
  return get(`${API_URL}/superadmin/dashboard/kpis${params}`);
};

export const getMonthlyAppointments = (year?: number) => {
  const params = year ? `?year=${year}` : '';
  return get(
    `${API_URL}/superadmin/dashboard/appointments/monthly${params}`
  );
};

export const getMonthlyRevenue = (year?: number) => {
  const params = year ? `?year=${year}` : '';
  return get(
    `${API_URL}/superadmin/dashboard/revenue/monthly${params}`
  );
};

export const getAppointmentsByStatus = (year?: number) => {
  const params = year ? `?year=${year}` : '';
  return get(
    `${API_URL}/superadmin/dashboard/appointments/status${params}`
  );
};
