// frontend/src/app/dashboard/super-admin/users/page.tsx

'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
  medic: 'Médico',
  secretary: 'Secretaria',
  super_admin: 'Super Admin',
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  patient: 'bg-blue-100 text-blue-800',
  medic: 'bg-purple-100 text-purple-800',
  secretary: 'bg-indigo-100 text-indigo-800',
  super_admin: 'bg-gray-100 text-gray-800',
};

export default function SuperAdminUsersPage() {
  useRoleGuard('superadmin');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

      // Llamada SIN parámetros → trae todos los usuarios
      const response = await fetch(`${apiURL}/superadmin/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMsg = await response.text().catch(() => 'Error desconocido');
        throw new Error(`Error al cargar usuarios: ${errorMsg}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-lg'>Cargando lista de usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6'>
          <p className='text-red-700'>
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={fetchUsers}
            className='mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
          >
            Reintentar
          </button>
        </div>
        <div className='text-center'>
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

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>👥 Todos los Usuarios</h1>

      {/* Resumen */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-blue-50 p-4 rounded-lg text-center'>
          <p className='text-sm text-blue-700'>Total de Usuarios</p>
          <p className='text-2xl font-bold text-blue-900'>{totalUsers}</p>
        </div>
        <div className='bg-green-50 p-4 rounded-lg text-center'>
          <p className='text-sm text-green-700'>Activos</p>
          <p className='text-2xl font-bold text-green-900'>{activeUsers}</p>
        </div>
        <div className='bg-red-50 p-4 rounded-lg text-center'>
          <p className='text-sm text-red-700'>Inactivos</p>
          <p className='text-2xl font-bold text-red-900'>{inactiveUsers}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className='overflow-x-auto border rounded-lg shadow-sm'>
        <table className='min-w-full bg-white'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='py-3 px-4 text-left text-sm font-semibold text-gray-700'>
                Nombre Completo
              </th>
              <th className='py-3 px-4 text-left text-sm font-semibold text-gray-700'>
                Email
              </th>
              <th className='py-3 px-4 text-left text-sm font-semibold text-gray-700'>
                Rol
              </th>
              <th className='py-3 px-4 text-left text-sm font-semibold text-gray-700'>
                Estado
              </th>
              <th className='py-3 px-4 text-left text-sm font-semibold text-gray-700'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-6 text-center text-gray-500'>
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className='hover:bg-gray-50 transition'>
                  <td className='py-3 px-4 font-medium'>
                    {user.first_name} {user.last_name}
                  </td>
                  <td className='py-3 px-4 text-gray-700'>{user.email}</td>
                  <td className='py-3 px-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ROLE_BADGE_CLASSES[user.role] ||
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className='py-3 px-4'>
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
                  <td className='py-3 px-4 space-x-2'>
                    <button
                      className='text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50'
                      disabled
                    >
                      Cambiar Rol
                    </button>
                    <button
                      className={`text-sm px-3 py-1 rounded transition disabled:opacity-50 ${
                        user.is_active
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                      disabled
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

      <div className='mt-8 text-center'>
        <Link
          href='/dashboard/super-admin'
          className='px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition'
        >
          Volver al Panel
        </Link>
      </div>
    </div>
  );
}
