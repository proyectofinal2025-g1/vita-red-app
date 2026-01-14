// frontend/src/app/dashboard/super-admin/overview/page.tsx

'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface OverviewData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalDoctors: number;
  totalSecretaries: number;
  totalAppointments: number;
}

export default function SuperAdminOverview() {
  // Protección de acceso
  const { dataUser } = useAuth();
  useRoleGuard('superadmin', dataUser?.token);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);

        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');

        const session = JSON.parse(userSession);
        const token = session.token;

        const response = await fetch(`${apiURL}/superadmin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Error al cargar estadísticas');

        const data = await response.json();
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-lg'>Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-red-600'>
          <p className='font-semibold'>Error:</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6 text-center'>
        📊 Panel de Estadísticas
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Usuarios Totales
          </h2>
          <p className='text-3xl font-bold text-blue-600'>
            {overview?.totalUsers || 0}
          </p>
        </div>

        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Usuarios Activos
          </h2>
          <p className='text-3xl font-bold text-green-600'>
            {overview?.activeUsers || 0}
          </p>
        </div>

        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Usuarios Inactivos
          </h2>
          <p className='text-3xl font-bold text-red-600'>
            {overview?.inactiveUsers || 0}
          </p>
        </div>

        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold text-gray-800'>Médicos</h2>
          <p className='text-3xl font-bold text-purple-600'>
            {overview?.totalDoctors || 0}
          </p>
        </div>

        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold text-gray-800'>Secretarias</h2>
          <p className='text-3xl font-bold text-indigo-600'>
            {overview?.totalSecretaries || 0}
          </p>
        </div>

        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Turnos Registrados
          </h2>
          {overview?.totalAppointments !== undefined ? (
            <p className='text-3xl font-bold text-orange-600'>
              {overview.totalAppointments}
            </p>
          ) : (
            <p className='text-gray-500 italic'>No disponible</p>
          )}
        </div>
      </div>

      <div className='mt-8 text-center'>
        <Link
          href='/dashboard/super-admin'
          className='px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'
        >
          Volver al Panel
        </Link>
      </div>
    </div>
  );
}
