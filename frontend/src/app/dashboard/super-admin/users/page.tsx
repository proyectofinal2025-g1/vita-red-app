// frontend/src/app/dashboard/super-admin/users/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  patient: 'Paciente',
  medico: 'Médico',
  superadmin: 'Super Admin',
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  patient: 'bg-blue-100 text-blue-800',
  medico: 'bg-purple-100 text-purple-800',
  superadmin: 'bg-gray-100 text-gray-800',
};

export default function SuperAdminUsersPage() {
  useRoleGuard('superadmin');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const userSession = localStorage.getItem('userSession');
        if (!userSession) {
          throw new Error('No se encontró la sesión de usuario');
        }

        const session = JSON.parse(userSession);
        const token = session.token;
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        // Definir las combinaciones de filtros
        const filters = [
          { role: 'patient', is_active: 'true' },
          { role: 'patient', is_active: 'false' },
          { role: 'medico', is_active: 'true' },
          { role: 'medico', is_active: 'false' },
          { role: 'superadmin', is_active: 'true' },
          { role: 'superadmin', is_active: 'false' },
        ];

        // Hacer todas las llamadas concurrentemente
        const promises = filters.map((filter) => {
          return fetch(
            `${apiURL}/superadmin/users?role=${filter.role}&is_active=${filter.is_active}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          ).then((res) => {
            if (!res.ok) {
              throw new Error(
                `Error al cargar usuarios con filtro ${JSON.stringify(filter)}`
              );
            }
            return res.json();
          });
        });

        const responses = await Promise.all(promises);

        // Combinar todos los resultados
        const allUsers: User[] = responses.flat();

        // Eliminar duplicados por ID
        const uniqueUsers = allUsers.filter(
          (user, index, self) =>
            self.findIndex((u) => u.id === user.id) === index
        );

        setUsers(uniqueUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === '' || user.role === filterRole;
    const matchesStatus =
      filterStatus === '' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='flex items-center space-x-2 text-lg'>
          <ArrowPathIcon className='h-6 w-6 animate-spin text-blue-600' />
          <span>Cargando usuarios...</span>
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
          👥 Gestión de Usuarios
        </h1>
        <Link
          href='/dashboard/super-admin'
          className='text-blue-600 hover:underline flex items-center gap-1'
        >
          ← Volver al Panel
        </Link>
      </div>

      {/* Resumen rápido */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-blue-50 p-4 rounded-xl text-center shadow-sm'>
          <p className='text-sm text-blue-700 font-medium'>Total</p>
          <p className='text-2xl font-bold text-blue-900'>{totalUsers}</p>
        </div>
        <div className='bg-green-50 p-4 rounded-xl text-center shadow-sm'>
          <p className='text-sm text-green-700 font-medium'>Activos</p>
          <p className='text-2xl font-bold text-green-900'>{activeUsers}</p>
        </div>
        <div className='bg-red-50 p-4 rounded-xl text-center shadow-sm'>
          <p className='text-sm text-red-700 font-medium'>Inactivos</p>
          <p className='text-2xl font-bold text-red-900'>{inactiveUsers}</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className='bg-white p-4 rounded-xl shadow-sm mb-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Búsqueda global */}
          <div className='relative flex-1'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar por nombre o email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Filtro por rol */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value=''>Todos los roles</option>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
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

          {/* Botón de reset */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterRole('');
              setFilterStatus('');
            }}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition'
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
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Rol
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-4 text-center text-gray-500 italic'
                  >
                    No se encontraron usuarios con estos filtros.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-4 whitespace-nowrap font-medium text-gray-900'>
                      {user.first_name} {user.last_name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-gray-600'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ROLE_BADGE_CLASSES[user.role] ||
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm space-x-2'>
                      <button
                        onClick={async () => {
                          const name = `${user.first_name} ${user.last_name}`;
                          const currentRole = user.role;

                          // Mostrar SweetAlert con selección de rol
                          const { value: newRole } = await Swal.fire({
                            title: `¿Cambiar rol de ${name}?`,
                            text: `Rol actual: ${
                              ROLE_LABELS[currentRole] || currentRole
                            }`,
                            input: 'select',
                            inputOptions: {
                              patient: 'Paciente',
                              medico: 'Médico',
                              superadmin: 'Super Admin',
                            },
                            inputPlaceholder: 'Selecciona un nuevo rol',
                            inputValue: currentRole,
                            showCancelButton: true,
                            confirmButtonText: 'Cambiar Rol',
                            cancelButtonText: 'Cancelar',
                            reverseButtons: true,
                            confirmButtonColor: '#28a745',
                            cancelButtonColor: '#6c757d',
                            inputValidator: (value) => {
                              if (!value) {
                                return 'Debes seleccionar un rol';
                              }
                            },
                          });

                          if (!newRole) return;

                          // Confirmación final
                          const confirmResult = await Swal.fire({
                            title: `¿Estás seguro de cambiar el rol de ${name} a ${
                              ROLE_LABELS[newRole] || newRole
                            }?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, cambiarlo',
                            cancelButtonText: 'Cancelar',
                            reverseButtons: true,
                            confirmButtonColor: '#28a745',
                            cancelButtonColor: '#6c757d',
                          });

                          if (!confirmResult.isConfirmed) return;

                          try {
                            const userSession =
                              localStorage.getItem('userSession');
                            if (!userSession)
                              throw new Error('Sesión no encontrada');
                            const token = JSON.parse(userSession).token;

                            const res = await fetch(
                              `${apiURL}/superadmin/users/${user.id}/role`,
                              {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ role: newRole }),
                              }
                            );

                            if (!res.ok) {
                              const errorData = await res
                                .json()
                                .catch(() => ({}));
                              throw new Error(
                                errorData.message || 'No se pudo cambiar el rol'
                              );
                            }

                            // ✅ Actualizar localmente
                            setUsers((prev) =>
                              prev.map((u) =>
                                u.id === user.id ? { ...u, role: newRole } : u
                              )
                            );

                            // ✅ Éxito
                            await Swal.fire({
                              title: '¡Éxito!',
                              text: `${name} ahora tiene el rol de ${
                                ROLE_LABELS[newRole] || newRole
                              }.`,
                              icon: 'success',
                              timer: 2500,
                              showConfirmButton: false,
                            });
                          } catch (err) {
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
                        className='inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                      >
                        Cambiar Rol
                      </button>
                      {/* Botón de Activar/Desactivar con SweetAlert2 */}
                      <button
                        onClick={async () => {
                          const action = user.is_active
                            ? 'desactivar'
                            : 'activar';
                          const name = `${user.first_name} ${user.last_name}`;

                          const result = await Swal.fire({
                            title: `¿${
                              action.charAt(0).toUpperCase() + action.slice(1)
                            } a ${name}?`,
                            text: `Esta acción tendrá efecto en el uso de la plataforma.`,
                            icon: user.is_active ? 'warning' : 'question',
                            showCancelButton: true,
                            confirmButtonText: `Sí, ${action}`,
                            cancelButtonText: 'Cancelar',
                            reverseButtons: true,
                            confirmButtonColor: user.is_active
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
                              `${apiURL}/superadmin/users/${user.id}/status`,
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

                            // Actualizar localmente el estado del usuario
                            setUsers((prev) =>
                              prev.map((u) =>
                                u.id === user.id
                                  ? { ...u, is_active: !user.is_active }
                                  : u
                              )
                            );

                            // Éxito
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
                          user.is_active
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {user.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie de página */}
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
