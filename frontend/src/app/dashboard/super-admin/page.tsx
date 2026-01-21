// frontend/src/app/dashboard/super-admin/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function SuperAdminDashboardHome() {
  const { dataUser } = useAuth();

  useRoleGuard('superadmin');

  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  let firstName = 'SuperAdmin';
  if (dataUser?.token) {
    try {
      const parts = dataUser.token.split('.');
      const decoded = JSON.parse(atob(parts[1]));
      if (decoded.first_name) {
        firstName = decoded.first_name.split(' ')[0];
      }
    } catch (error) {
      console.error('Error decodificando token:', error);
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccioná una imagen válida');
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setAvatar(imageUrl);
  };

  return (
    <div className='min-h-[70vh] bg-gray-50 flex flex-col items-center justify-start px-4 py-8'>
      <div className='w-full max-w-md bg-white rounded-3xl shadow-xl p-6 space-y-6 border border-gray-100'>
        {/* Avatar y bienvenida */}
        <div className='text-center space-y-2'>
          <div
            onClick={handleAvatarClick}
            className='w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2 cursor-pointer overflow-hidden hover:ring-2 hover:ring-blue-500 transition'
          >
            {avatar ? (
              <img
                src={avatar}
                alt='Avatar'
                className='w-full h-full object-cover'
              />
            ) : (
              <span className='text-xl'>👤</span>
            )}
          </div>

          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className='hidden'
          />

          <h1 className='text-2xl font-bold text-gray-800'>
            ¡Hola {firstName}!
          </h1>
          <p className='text-sm text-gray-500'>
            Bienvenid@ a tu panel de SuperAdmin
          </p>
        </div>

        {/* Botones funcionales */}
        <div className='space-y-4 pt-4'>
          {/* Gestión de Usuarios */}
          <Link
            href='/dashboard/super-admin/users'
            className='block w-full text-center px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          >
            👥 Gestión de Usuarios
          </Link>

          {/* Cuadrícula de 2 botones: Médicos y Pacientes */}
          <div className='grid grid-cols-2 gap-4'>
            {/* Gestión de Médicos */}
            <Link
              href='/dashboard/super-admin/doctors'
              className='flex flex-col items-center justify-center p-5 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            >
              <span className='text-2xl mb-2'>👨‍⚕️</span>
              <span className='text-sm font-medium text-center'>
                Gestión de Médicos
              </span>
            </Link>

            {/* Gestión de Pacientes */}
            <Link
              href='/dashboard/super-admin/patients'
              className='flex flex-col items-center justify-center p-5 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            >
              <span className='text-2xl mb-2'>🧑‍🤝‍🧑</span>
              <span className='text-sm font-medium text-center'>
                Gestión de Pacientes
              </span>
            </Link>
          </div>

          {/* Estadísticas */}
          <Link
            href='/dashboard/super-admin/overview'
            className='block w-full text-center px-6 py-4 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          >
            📊 Estadísticas
          </Link>
        </div>
      </div>
    </div>
  );
}
