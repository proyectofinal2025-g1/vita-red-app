const apiURL = process.env.NEXT_PUBLIC_API_URL;

export async function createPaymentPreference(
  appointmentId: string,
  token: string,
) {
  const res = await fetch(`${apiURL}/payments/preference`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ appointmentId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al iniciar el pago');
  }

  return res.json(); // { initPoint }
}
