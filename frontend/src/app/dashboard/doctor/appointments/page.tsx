'use client'

import { useEffect, useState } from 'react';
import { getDoctorAppointments } from '../services';
import AppointmentList from './components/AppointmentList';
import AppointmentSkeleton from './components/AppointmentSkeleton';
import { DoctorAppointment } from '../types';
import { sortAppointmentsByDate } from './utils/sortAppointments';

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
    const [loading, setLoading] = useState(true);

    const token = ''; //lógica de auth

    useEffect(() => {
        getDoctorAppointments(token)
        .then((data) => setAppointments(sortAppointmentsByDate(data)))
        .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Mi agenda
            </h2>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <AppointmentSkeleton key={i} />
                    ))}
                </div>
            ): (
                <AppointmentList appointments={appointments} />
            )}
        </div>
    );
}