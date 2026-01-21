// frontend/src/app/dashboard/super-admin/patients/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import Swal from 'sweetalert2';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface Patient {
  id: string;
  dni: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  createdAt: string;
}

export default function SuperAdminPatientsPage() {
  useRoleGuard('superadmin');

  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');

        let token: string;
        try {
          const session = JSON.parse(userSession);
          token = session.token;
          if (!token) throw new Error('Token no encontrado');
        } catch {
          throw new Error('Sesión inválida');
        }

        // ✅ Hacemos DOS llamadas: una para activos, otra para inactivos
        const [resActive, resInactive] = await Promise.all([
          fetch(`${apiURL}/superadmin/users?role=patient&is_active=true`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiURL}/superadmin/users?role=patient&is_active=false`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Verificamos errores en ambas respuestas
        if (!resActive.ok || !resInactive.ok) {
          const errorData1 = !resActive.ok
            ? await resActive.json().catch(() => ({}))
            : {};
          const errorData2 = !resInactive.ok
            ? await resInactive.json().catch(() => ({}))
            : {};
          const errorMsg =
            errorData1.message ||
            errorData2.message ||
            'Error al cargar pacientes';
          throw new Error(errorMsg);
        }

        const activePatients: Patient[] = await resActive.json();
        const inactivePatients: Patient[] = await resInactive.json();

        // ✅ Combinamos ambos arrays
        const allPatients = [...activePatients, ...inactivePatients];
        setPatients(allPatients);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filtrar pacientes localmente — ahora seguro
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      patient.first_name?.toLowerCase().includes(searchLower) ||
      false ||
      patient.last_name?.toLowerCase().includes(searchLower) ||
      false ||
      patient.dni?.toLowerCase().includes(searchLower) ||
      false ||
      patient.email?.toLowerCase().includes(searchLower) ||
      false;

    const matchesStatus =
      filterStatus === '' ||
      (filterStatus === 'active' && patient.is_active) ||
      (filterStatus === 'inactive' && !patient.is_active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='flex items-center space-x-2 text-lg'>
          <ArrowPathIcon className='h-6 w-6 animate-spin text-blue-600' />
          <span>Cargando pacientes...</span>
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
          🧑‍🤝‍🧑 Gestión de Pacientes
        </h1>
        <Link
          href='/dashboard/super-admin'
          className='text-blue-600 hover:underline flex items-center gap-1'
        >
          ← Volver al Panel
        </Link>
      </div>

      {/* Filtros + Botón Crear Paciente */}
      <div className='bg-white p-4 rounded-xl shadow-sm mb-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-end'>
          {/* Búsqueda general */}
          <div className='relative flex-1'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar por nombre, DNI o email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

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

          {/* Botón Crear Paciente (movido aquí) */}
          <Link
            href='/dashboard/super-admin/patients/new'
            className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition whitespace-nowrap'
          >
            ➕ Crear Paciente
          </Link>

          {/* Botón Limpiar */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('');
            }}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition whitespace-nowrap'
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className='bg-white rounded-xl shadow overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Nombre Completo
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  DNI
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Estado
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-4 text-center text-gray-500 italic'
                  >
                    No se encontraron pacientes con estos filtros.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-4 whitespace-nowrap font-medium text-gray-900'>
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-gray-600'>
                      {patient.dni}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-gray-600'>
                      {patient.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {patient.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm space-x-2'>
                      <Link
                        href={`/dashboard/super-admin/patients/${patient.id}`}
                        className='inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                      >
                        Más información
                      </Link>
                      <button
                        onClick={async () => {
                          const action = patient.is_active
                            ? 'desactivar'
                            : 'activar';
                          const name = `${patient.first_name} ${patient.last_name}`;

                          // ✅ Mostrar SweetAlert de confirmación
                          const result = await Swal.fire({
                            title: `¿${
                              action.charAt(0).toUpperCase() + action.slice(1)
                            } a ${name}?`,
                            text: `Esta acción tendrá efecto en el uso de la plataforma.`,
                            icon: patient.is_active ? 'warning' : 'question',
                            showCancelButton: true,
                            confirmButtonText: `Sí, ${action}`,
                            cancelButtonText: 'Cancelar',
                            reverseButtons: true,
                            confirmButtonColor: patient.is_active
                              ? '#d33'
                              : '#28a745',
                            cancelButtonColor: '#6c757d',
                          });

                          if (!result.isConfirmed) return;

                          try {
                            const userSession =
                              localStorage.getItem('userSession');
                            if (!userSession)
                              throw new Error('Sesión no encontrada');
                            const token = JSON.parse(userSession).token;

                            const res = await fetch(
                              `${apiURL}/superadmin/users/${patient.id}/status`,
                              {
                                method: 'PATCH',
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );

                            if (!res.ok) {
                              const errorData = await res
                                .json()
                                .catch(() => ({}));
                              throw new Error(
                                errorData.message ||
                                  'No se pudo cambiar el estado'
                              );
                            }

                            // ✅ Actualizar localmente
                            setPatients((prev) =>
                              prev.map((p) =>
                                p.id === patient.id
                                  ? { ...p, is_active: !patient.is_active }
                                  : p
                              )
                            );

                            // ✅ Éxito
                            await Swal.fire({
                              title: '¡Éxito!',
                              text: `${name} ha sido ${
                                action.toLowerCase() === 'activar'
                                  ? 'Activado'
                                  : 'Desactivado'
                              } correctamente.`,
                              icon: 'success',
                              timer: 2500,
                              showConfirmButton: false,
                            });
                          } catch (err) {
                            // ✅ Error
                            await Swal.fire({
                              title: 'Error',
                              text:
                                err instanceof Error
                                  ? err.message
                                  : 'No se pudo completar la acción.',
                              icon: 'error',
                              confirmButtonText: 'Aceptar',
                            });
                          }
                        }}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white ${
                          patient.is_active
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {patient.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
