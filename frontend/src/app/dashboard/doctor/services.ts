import { DoctorProfile, DoctorAppointment } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDoctorProfile(token: string): Promise<DoctorProfile> {
    const res = await fetch(`${API_URL}/doctor/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new Error('Error al obtener perfil del médico');
    }
    return res.json();
}

export async function getDoctorAppointments(
    token: string
): Promise<DoctorAppointment[]> {
    const res = await fetch(`${API_URL}/doctor/appointments/list`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Error al obtener turnos');
    }

    return res.json();
}