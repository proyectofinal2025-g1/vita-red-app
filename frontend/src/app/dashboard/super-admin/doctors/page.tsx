'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  licence_number: string;
  profileImageUrl?: string;
  speciality: {
    name: string;
    description: string;
    isActive: boolean;
  };
}

export default function SuperAdminDoctorsPage() {
  useRoleGuard('superadmin');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        const res = await fetch(`${apiURL}/superadmin/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al cargar médicos');
        }

        const data: Doctor[] = await res.json();
        setDoctors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Cargando médicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center text-red-600'>
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>👨‍⚕️ Médicos</h1>
        <Link
          href='/dashboard/super-admin'
          className='text-blue-600 hover:underline'
        >
          ← Volver al panel
        </Link>
      </div>

      {doctors.length === 0 ? (
        <p className='text-gray-500'>No se encontraron médicos registrados.</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className='p-4 rounded-lg border border-gray-200 bg-white shadow-sm'
            >
              <h3 className='font-semibold text-lg'>
                {doctor.first_name} {doctor.last_name}
              </h3>
              <p className='text-sm text-gray-600'>
                Licencia: {doctor.licence_number}
              </p>
              <p className='text-sm text-purple-600 mt-1'>
                Especialidad: {doctor.speciality.name}
              </p>
              {doctor.profileImageUrl && (
                <Image
                  src={doctor.profileImageUrl}
                  alt='Foto del médico'
                  className='w-12 h-12 rounded-full mt-2 object-cover'
                  width={120}
                  height={120}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
