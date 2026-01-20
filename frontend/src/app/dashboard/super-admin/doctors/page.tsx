// frontend/src/app/dashboard/super-admin/doctors/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface IDoctorUsers {
  id: string;
  bio: string | null;
  consultationPrice: string;
  isActive: boolean; // ⚠️ Este campo puede estar desactualizado
  licence_number: string;
  speciality: {
    name: string;
    description?: string;
    isActive?: boolean;
  };
  user: {
    id: string;
    dni: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean; // ✅ Esta es la fuente de verdad
    profileImagePublicId: string | null;
    profileImageUrl: string | null;
    role: string;
  };
}

export default function SuperAdminDoctorsPage() {
  useRoleGuard('superadmin');

  const [doctors, setDoctors] = useState<IDoctorUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpeciality, setFilterSpeciality] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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

        const data: IDoctorUsers[] = await res.json();
        setDoctors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filtrar médicos — usando user.is_active como fuente de verdad
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.licence_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.speciality.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpeciality =
      filterSpeciality === '' || doctor.speciality.name === filterSpeciality;

    const matchesStatus =
      filterStatus === '' ||
      (filterStatus === 'active' && doctor.user.is_active) ||
      (filterStatus === 'inactive' && !doctor.user.is_active);

    return matchesSearch && matchesSpeciality && matchesStatus;
  });

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='flex items-center space-x-2 text-lg'>
          <ArrowPathIcon className='h-6 w-6 animate-spin text-blue-600' />
          <span>Cargando médicos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-6xl mx-auto p-6'>
        <div className='bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6'>
          <h3 className='text-lg font-semibold text-red-700'>⚠️ Error</h3>
          <p className='mt-2 text-red-600'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition'
          >
            Reintentar
          </button>
        </div>
        <div className='text-center'>
          <Link
            href='/dashboard/super-admin'
            className='px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition'
          >
            ← Volver al Panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>
          👨‍⚕️ Gestión de Médicos
        </h1>
        <Link
          href='/dashboard/super-admin'
          className='text-blue-600 hover:underline flex items-center gap-1'
        >
          ← Volver al Panel
        </Link>
      </div>

      {/* Filtros con botón de crear médico */}
      <div className='bg-white p-4 rounded-xl shadow-sm mb-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Búsqueda */}
          <div className='relative flex-1'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar por nombre, licencia o especialidad...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Filtro por especialidad */}
          <select
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value=''>Todas las especialidades</option>
            {[...new Set(doctors.map((d) => d.speciality.name))].map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          {/* Filtro por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value=''>Todos los estados</option>
            <option value='active'>Activos</option>
            <option value='inactive'>Inactivos</option>
          </select>

          {/* Botón de crear médico */}
          <Link
            href='/dashboard/super-admin/doctors/new'
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2'
          >
            <PlusIcon className='h-4 w-4' />➕ Crear Médico
          </Link>

          {/* Reset */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterSpeciality('');
              setFilterStatus('');
            }}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition'
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tarjetas */}
      {filteredDoctors.length === 0 ? (
        <div className='text-center py-10 text-gray-500 italic'>
          No se encontraron médicos con estos filtros.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className='bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 p-5 transition'
            >
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center'>
                  <span className='text-xl'>👨‍⚕️</span>
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-lg'>
                    {doctor.user.first_name} {doctor.user.last_name}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Licencia: {doctor.licence_number}
                  </p>
                  <p className='text-sm text-purple-600 mt-1'>
                    Especialidad: {doctor.speciality.name}
                  </p>
                  <p className='text-sm text-green-600 mt-1'>
                    Precio consulta: ${doctor.consultationPrice}
                  </p>
                  <div className='mt-3 flex items-center gap-2'>
                    {/* ✅ Usamos user.is_active como fuente de verdad */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {doctor.user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='mt-4 flex gap-2'>
                <Link
                  href={`/dashboard/super-admin/doctors/${doctor.id}`}
                  className='flex-1 text-center px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm transition'
                >
                  Más información
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pie */}
      <div className='mt-8 text-center'>
        <Link
          href='/dashboard/super-admin'
          className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition'
        >
          ← Volver al Panel
        </Link>
      </div>
    </div>
  );
}
