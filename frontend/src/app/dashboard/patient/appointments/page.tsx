import AppointmentList from "@/app/dashboard/patient/appointments/components/AppointmentList";
import Link from "next/link";

export default function AppointmentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis turnos</h1>
        <Link
          href="/dashboard/patient"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Volver al Panel
        </Link>
      </div>
      <Link
        href="/dashboard/patient/appointments/new"
        className="inline-block px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Agendar nuevo turno
      </Link>

      <AppointmentList />
      <div className="text-center">
        <Link
          href="/dashboard/patient"
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          ← Volver al Panel
        </Link>
      </div>
    </div>
  );
}
