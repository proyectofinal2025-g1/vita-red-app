import AppointmentCard from "./AppointmentCard";
import { IAppointment } from "@/interfaces/IAppointment";

const appointmentsMock: IAppointment[] = [
    {
    id: 1,
    date: "12/03/2025",
    time: "10:30",
    specialty: "Cardiología",
    doctorName: "Dr. Pérez",
    status: "ACTIVO",
    },
    {
    id: 2,
    date: "20/02/2025",
    time: "09:00",
    specialty: "Dermatología",
    doctorName: "Dra. Gómez",
    status: "CANCELADO",
    },
];

export default function AppointmentList() {
    if (!appointmentsMock.length) {
        return (
            <p>
                No tenés turnos programados
            </p>
        );
    }

    return (
        <div>
            {appointmentsMock.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
        </div>
    );
}
