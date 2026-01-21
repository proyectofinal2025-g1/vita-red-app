import { cookies } from "next/headers"

export async function getDoctorAppointments() {
  const token = cookies().get("token")?.value

  if (!token) return []

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/doctors/appointments/list`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  )

  if (!res.ok) return []

  return res.json()
}
