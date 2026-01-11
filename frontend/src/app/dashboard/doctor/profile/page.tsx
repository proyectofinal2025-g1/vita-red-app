'use client'

import { useEffect, useState } from 'react';
import DoctorProfileCard from './components/DoctorProfileCard';
import { getDoctorProfile } from '../services';
import { DoctorProfile } from '../types';
import { useAuth } from '@/contexts/AuthContext';

export default function DoctorProfilePage() {
    const { dataUser, loading } = useAuth();
    const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
    const [error, setError] = useState(false);
    
    const token = dataUser?.token;

    useEffect(() => {
        if (!token) return;

        getDoctorProfile(token)
        .then(setDoctor)
        .catch(() => setError(true));
    }, [token]);

    if (loading) return <p>Cargando sesión...</p>;
    if (error) return <p>Error al cargar el perfil</p>;
    if (!doctor) return <p>Cargando perfil...</p>;

    return <DoctorProfileCard doctor={doctor} />;
}