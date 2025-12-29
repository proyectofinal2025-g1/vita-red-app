import { AppointmentStatus } from "@/app/dashboard/patient/appointments/types";

export interface IAppointment {
    id: number;
    date: string;
    time: string;
    specialty: string;
    doctorName: string;
    status: AppointmentStatus;
}