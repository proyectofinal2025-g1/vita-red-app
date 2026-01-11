import { DoctorAppointment } from '../../types';

interface Props {
    appointment: DoctorAppointment;
}

const statusStyles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

export default function AppointmentCard({ appointment }: Props) {
    const { patient, date, time, status } = appointment;

    return (
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-800">
                    {patient.first_name} {patient.last_name}
                </p>

                <p>
                    📅 {date} - ⏰ {time}
                </p>
                </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                {status}
            </span>
            
            <button className="text-xs text-blue-600 hover:underline" onClick={() => alert (`Turno ID: ${appointment.id}`)}>
                Ver detalle
            </button>
            </div>
            </div>
        </div>
    );
}