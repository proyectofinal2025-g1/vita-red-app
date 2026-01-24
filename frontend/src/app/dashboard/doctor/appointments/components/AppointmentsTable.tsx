import StatusBadge from "./StatusBadge"
import {
  formatArgentinaDate,
  formatArgentinaTime,
} from "@/utils/formatArgentinaDateTime"

type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed"


interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface Appointment {
  id: string
  patient: Patient | null
  date: string
  hour: string
  status: AppointmentStatus
}

export default function AppointmentsTable({
  appointments,
  onAttend,
}: {
  appointments: Appointment[]
  onAttend: (a: Appointment) => void
}) {
  if (!appointments.length) {
    return (
      <div className="bg-white rounded-2xl p-6 border text-slate-500">
        No tenés turnos asignados
      </div>
    )
  }

  return (
    <div className="bg-indigo-50 rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-blue-200 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left">Paciente</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Hora</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Acción</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((a) => {

            return (
              <tr
                key={a.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  {a.patient
                    ? `${a.patient.first_name} ${a.patient.last_name}`
                    : "Paciente"}
                </td>

                <td className="px-4 py-3 text-center">
                  {formatArgentinaDate(a.date)}
                </td>

                <td className="px-4 py-3 text-center">
                  {formatArgentinaTime(a.date)}
                </td>

                <td className="px-4 py-3 text-center">
                  <StatusBadge status={a.status} />
                </td>

                <td className="px-4 py-3 text-center">
                  {a.status === "confirmed" ? (
                    <button
                      onClick={() => onAttend(a)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold"
                    >
                      Atender
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
