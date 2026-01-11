import AppointmentCard from "./AppointmentCard";
import { DoctorAppointment } from "../../types";

interface Props {
    appointments: DoctorAppointment[];
}

export default function AppointmentList({ appointments }: Props) {
    if (!appointments.length) {
        return (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                No tenés turnos asignados
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {appointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment}/>
            ))}
        </div>
    );
}