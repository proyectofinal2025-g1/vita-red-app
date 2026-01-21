'use client'

import { useEffect, useState } from "react"

export default function NextAppointmentCard() {
  const [appointment, setAppointment] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctors/appointments/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setAppointment(data[0]))
  }, [])

  if (!appointment) {
    return (
      <div className="bg-slate-200 rounded-xl p-5 border-b-stone-300">
        <p className="text-slate-700">
          No tenés turnos programados 🎉
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-200 rounded-xl p-5 border-b-stone-300">
      <h3 className="font-semibold mb-2">Próximo turno</h3>
      <p>Paciente: {appointment.patient_name}</p>
      <p>Fecha: {appointment.date}</p>
      <p>Hora: {appointment.hour}</p>
    </div>
  )
}
