export interface DoctorProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    licence_number: string;
    specialty: {
        id: string;
        name: string;
    };
}

export interface DoctorAppointment {
    id: string;
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    patient: {
        first_name: string;
        last_name: string;
    };
}