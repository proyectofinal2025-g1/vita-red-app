export type AppointmentStatus =
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED";

export interface Appointment {
    id: string;
    date: string;
    status: AppointmentStatus;
    reason?: string;
    createdAt: string;
    expiresAt?: string;
    price: number;

    patient: {
        id: string;
        fullName: string;
        email: string;
    };

    doctor: {
        id: string;
        fullName: string;
        consultationFee: number;
    };

    speciality?: {
        id: string;
        name: string;
    };
}
