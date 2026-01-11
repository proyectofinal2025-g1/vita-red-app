import { DoctorAppointment } from '../../types';

export function sortAppointmentsByDate(
    appointments: DoctorAppointment[]
) {
    return [...appointments].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });
}