import { IAppointment } from "@/interfaces/IAppointment";
import { IAppointmentProps } from "@/interfaces/IAppointmentProps";

export default function AppointmentCard({appointment}: IAppointmentProps) {
    const isCanceled = appointment.status === "CANCELADO";

    return (
        <div className={`border rounded-lg p-4 flex justify-between items-center ${isCanceled ? "bg-gray-100 opacity-70" : "bg-white"}`}>
            <div>
                <p>
                    {appointment.date} - {appointment.time}
                </p>
                <p>
                    {appointment.specialty} - {appointment.doctorName}
                </p>
            </div>
            <span className={`text-sm font-semibold ${isCanceled ? "text-red-500" : "text-green-600"}`}>
                {appointment.status}
            </span>
        </div>
    );
}