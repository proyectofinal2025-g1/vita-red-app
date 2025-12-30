import AppointmentList from "@/app/dashboard/patient/appointments/components/AppointmentList";
import Link from "next/link";

export default function AppointmentsPage() {
    return (
        <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">
                    Mis turnos
                </h1>

                <Link href="/dashboard/patient/Appointments/newAppointment" className="px-4 py-2 bg-blue-600 text-white rounded">
                    Añadir nuevo turno
                </Link>

            <AppointmentList />
        </div>
    );
}