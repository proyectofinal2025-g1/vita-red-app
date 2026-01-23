'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import StatCard from "./components/StatCard"
import QuickAccessCard from "./components/QuickAccessCard"
import NextAppointmentCard from "./components/NextAppointmentCard"
import DashboardSkeleton from "./components/DashboardSkeleton"
import MedicalRecordsTable from "./components/MedicalRecordsTable"
import { useAuth } from "@/contexts/AuthContext";

export default function DoctorDashboardPage() {
  const router = useRouter()

  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [filter, setFilter] = useState<"today" | "week" | "pending" | null>(null)
  const { dataUser } = useAuth();
  const [specialities, setSpecialities] = useState<any[]>([])

  useEffect(() => {
  const token = dataUser?.token

  if (dataUser === undefined) return;
  if (!dataUser?.token) {
    router.push("/auth/login")
    return
  }

  async function loadDashboard() {
  try {
    const token = dataUser?.token
    if (!token) throw new Error("No token")

    const [doctorRes, recordsRes, appointmentsRes, specialtiesRes] =
      await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctors/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-record/doctor/medical-records`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctors/appointments/list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/speciality`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

    if (!doctorRes.ok) throw new Error("Unauthorized")

    const doctorData = await doctorRes.json()

    const specialtiesJson = await specialtiesRes.json()
    const specialtiesArray = Array.isArray(specialtiesJson)
      ? specialtiesJson
      : specialtiesJson.data ?? []

    const specialtyName =
      specialtiesArray.find(
        (s: any) => s.id === doctorData.speciality_id
      )?.name ?? "Especialidad no definida"

    setDoctor({
      ...doctorData,
      first_name: dataUser?.user.first_name,
      last_name: dataUser?.user.last_name,
      specialty: specialtyName,
    })

    setMedicalRecords(await recordsRes.json())
    setAppointments(await appointmentsRes.json())
  } catch (error) {
    console.error(error)
    router.push("/auth/login")
  } finally {
    setLoading(false)
  }
}


  loadDashboard()
}, [dataUser, router])


  if (loading) return <DashboardSkeleton />
  if (!doctor) return null

  const today = new Date().toISOString().slice(0, 10)

  const todayAppointments = appointments.filter(a => a.date === today)

  const weekAppointments = appointments.filter(a => {
    const apptDate = new Date(a.date)
    const now = new Date()

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    return apptDate >= startOfWeek && apptDate < endOfWeek
  })

  const pendingAppointments = appointments.filter(a => a.status === "pending")

  const filteredAppointments =
    filter === "today"
      ? todayAppointments
      : filter === "week"
      ? weekAppointments
      : filter === "pending"
      ? pendingAppointments
      : []

  async function completeAppointment(id: number) {
    try {
      const token = localStorage.getItem("token")

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      setAppointments(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status: "completed" } : a
        )
      )
    } catch (error) {
      console.error("Error al completar turno", error)
    }
  }

  return (
    <div className="space-y-10">
      <section className="bg-indigo-100 rounded-2xl p-6 border-b-blue-300 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">
          Hola, Dr/a. {doctor.last_name} 👋
        </h2>
        <p className="text-slate-500 mt-1">
          {doctor.specialty} · {doctor.licence_number}
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Turnos hoy"
          value={todayAppointments.length}
          onClick={() => setFilter("today")}
          active={filter === "today"}
        />
        <StatCard
          title="Turnos semana"
          value={weekAppointments.length}
          onClick={() => setFilter("week")}
          active={filter === "week"}
        />
        <StatCard
          title="Pendientes"
          value={pendingAppointments.length}
          onClick={() => setFilter("pending")}
          active={filter === "pending"}
        />
      </section>

      {filter && (
        <section className="bg-blue-100 rounded-2xl p-6 border-b-blue-300 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {filter === "today" && "Turnos de hoy"}
            {filter === "week" && "Turnos de la semana"}
            {filter === "pending" && "Turnos pendientes"}
          </h3>

          {filteredAppointments.length === 0 ? (
            <p className="text-slate-500">No hay turnos</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {filteredAppointments.map(a => (
                <li key={a.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">
                      {a.patient?.first_name ?? a.patient}
                    </p>
                    <p className="text-xs text-slate-500">{a.date}</p>
                  </div>

                  <div className="flex gap-3 items-center">
                    <span className="capitalize">{a.status}</span>
                    {a.status === "pending" && (
                      <button
                        onClick={() => completeAppointment(a.id)}
                        className="text-xs px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700"
                      >
                        Atendido
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <NextAppointmentCard />

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAccessCard
          title="🧑🏻‍⚕️ Mi Perfil"
          description="Ver y editar datos"
          href="/dashboard/doctor/profile"
        />
        <QuickAccessCard
          title="🗓️ Mi Agenda"
          description="Gestionar turnos"
          href="/dashboard/doctor/appointments"
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Mis registros médicos</h3>
        <MedicalRecordsTable records={medicalRecords} />
      </section>
    </div>
  )
}
