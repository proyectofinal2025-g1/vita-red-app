import { IAppointment } from "@/interfaces/IAppointment";
import { ICreateAppointmentDTO } from "@/interfaces/ICreateAppointmentDTO";

export async function getAppointmentsPatient(): Promise<IAppointment[]> {

    await new Promise(resolve => setTimeout(resolve, 600));

    return [
        {
        id: 1,
        specialty: "Cardiología",
        doctorName: "Dr. Juan",
        date: "2025-01-20",
        time: "10:00",
        status: "ACTIVO",
        },
        {
        id: 2,
        specialty: "Dermatología",
        doctorName: "Dra. Silvina",
        date: "2024-12-10",
        time: "15:30",
        status: "CANCELADO",
        },
    ];
}

export async function createAppointment(
    payload: ICreateAppointmentDTO
): Promise<IAppointment> {

    console.log("MOCK - creando turno", payload);

    return {
        id: Math.random(),
        specialty: payload.specialty,
        doctorName: "Pendiente asignación",
        date: payload.date,
        time: payload.time,
        status: "ACTIVO"
    };
}
