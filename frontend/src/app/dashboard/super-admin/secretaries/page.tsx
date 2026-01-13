'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface Secretary {
  id: string;
  fullName: string;
  email: string;
  is_active: boolean;
}

export default function SuperAdminSecretariesPage() {
  useRoleGuard('superadmin');

  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecretaries = async () => {
      try {
        setLoading(true);
        setError(null);

        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        const res = await fetch(`${apiURL}/superadmin/secretaries`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al cargar secretarias');
        }

        const data: Secretary[] = await res.json();
        setSecretaries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSecretaries();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Cargando secretarias...</p>
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
        <h1 className='text-2xl font-bold text-gray-800'>👩‍💻 Secretarias</h1>
        <Link
          href='/dashboard/super-admin'
          className='text-blue-600 hover:underline'
        >
          ← Volver al panel
        </Link>
      </div>

      {secretaries.length === 0 ? (
        <p className='text-gray-500'>
          No se encontraron secretarias registradas.
        </p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {secretaries.map((sec) => (
            <div
              key={sec.id}
              className={`p-4 rounded-lg border ${
                sec.is_active
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <h3 className='font-semibold text-lg'>{sec.fullName}</h3>
              <p className='text-sm text-gray-600'>{sec.email}</p>
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  sec.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {sec.is_active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
