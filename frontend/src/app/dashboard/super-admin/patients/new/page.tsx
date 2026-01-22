// frontend/src/app/dashboard/super-admin/patients/new/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import {
  registerFormInitialValues,
  registerformValidatorSchema,
} from '@/validators/registerSchema';
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
} from '@/utils/passwordStrength';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function CreatePatientPage() {
  useRoleGuard('superadmin');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Color helper (igual que en RegisterPage)
  const getPasswordColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const formik = useFormik({
    initialValues: registerFormInitialValues,
    validationSchema: registerformValidatorSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      setSubmitting(true);

      try {
        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        const res = await fetch(`${apiURL}/superadmin/patients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al crear el paciente');
        }

        // Éxito
        setTimeout(() => {
          router.push('/dashboard/super-admin/patients');
        }, 1500);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido al crear el paciente.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          👤 Crear Nuevo Paciente
        </h1>
        <Link
          href='/dashboard/super-admin/patients'
          className='text-blue-600 hover:underline flex items-center gap-1'
        >
          ← Volver a la lista
        </Link>
      </div>

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg'>
          ❌ {error}
        </div>
      )}

      {formik.isSubmitting && !error && (
        <div className='mb-4 p-3 bg-green-50 text-green-700 rounded-lg'>
          ✅ Paciente creado exitosamente. Redirigiendo...
        </div>
      )}

      <form
        onSubmit={formik.handleSubmit}
        className='bg-white p-6 rounded-xl shadow'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          {/* Nombres */}
          <div>
            <label
              htmlFor='first_name'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Nombres *
            </label>
            <input
              id='first_name'
              name='first_name'
              type='text'
              placeholder='Juan'
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formik.touched.first_name && formik.errors.first_name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.first_name && formik.errors.first_name && (
              <p className='mt-1 text-sm text-red-600'>
                {formik.errors.first_name}
              </p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label
              htmlFor='last_name'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Apellidos *
            </label>
            <input
              id='last_name'
              name='last_name'
              type='text'
              placeholder='Pérez'
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formik.touched.last_name && formik.errors.last_name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.last_name && formik.errors.last_name && (
              <p className='mt-1 text-sm text-red-600'>
                {formik.errors.last_name}
              </p>
            )}
          </div>

          {/* DNI */}
          <div>
            <label
              htmlFor='dni'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              DNI *
            </label>
            <input
              id='dni'
              name='dni'
              type='text'
              placeholder='12345678'
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formik.touched.dni && formik.errors.dni
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              value={formik.values.dni}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.dni && formik.errors.dni && (
              <p className='mt-1 text-sm text-red-600'>{formik.errors.dni}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Email *
            </label>
            <input
              id='email'
              name='email'
              type='email'
              placeholder='tu@email.com'
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className='mt-1 text-sm text-red-600'>{formik.errors.email}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          {/* Password */}
          <div className='relative'>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Contraseña *
            </label>
            <div className='relative'>
              <input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type='button'
                className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700'
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5-1.292 4.338-5.31 7.5-10.066 7.5-1.225 0-2.41-.177-3.537-.506M6.228 6.228 3.5 3.5m2.728 2.728 14.002 14.002M18.364 18.364l-2.728-2.728'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                    />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className='mt-1 text-sm text-red-600'>
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className='relative'>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Confirmar contraseña *
            </label>
            <div className='relative'>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='••••••••'
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type='button'
                className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword
                    ? 'Ocultar confirmación'
                    : 'Mostrar confirmación'
                }
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5-1.292 4.338-5.31 7.5-10.066 7.5-1.225 0-2.41-.177-3.537-.506M6.228 6.228 3.5 3.5m2.728 2.728 14.002 14.002M18.364 18.364l-2.728-2.728'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                    />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className='mt-1 text-sm text-red-600'>
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>
        </div>

        {/* Fortaleza de la contraseña (debajo de ambos campos) */}
        {formik.values.password && (
          <div className='mb-6'>
            {(() => {
              const strength = getPasswordStrength(formik.values.password);
              const color = getPasswordColor(strength);
              const label = getPasswordStrengthLabel(strength);
              const width =
                strength === 'weak'
                  ? '33%'
                  : strength === 'medium'
                  ? '66%'
                  : '100%';

              return (
                <div>
                  <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className={`h-full ${color} transition-all duration-300`}
                      style={{ width }}
                    />
                  </div>
                  <p className='text-sm mt-1 text-gray-600'>
                    Fortaleza: <span className='font-medium'>{label}</span>
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        <div className='flex gap-3 pt-4'>
          <button
            type='submit'
            disabled={formik.isSubmitting}
            className={`px-5 py-2 rounded-lg font-medium ${
              formik.isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {formik.isSubmitting ? 'Creando...' : 'Crear Paciente'}
          </button>
          <Link
            href='/dashboard/super-admin/patients'
            className='px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
