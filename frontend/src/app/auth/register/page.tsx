'use client';

import { useFormik } from 'formik';
import {
  registerFormInitialValues,
  registerformValidatorSchema,
} from '@/validators/registerSchema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: registerFormInitialValues,
    validationSchema: registerformValidatorSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setError('');

      try {
        const response = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: values.first_name,
            last_name: values.last_name,
            dni: values.dni,
            email: values.email,
            password: values.password,
            confirmPassword: values.confirmPassword, // Este valor es redundante (el backend no lo necesita para nada), el DTO del backend lo tiene como campo obligatorio, así se enviará por ahora.
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.message || data.error || 'Error en el registro';

          if (
            errorMsg.toLowerCase().includes('email') ||
            errorMsg.toLowerCase().includes('correo')
          ) {
            setFieldError('email', errorMsg);
          } else if (errorMsg.toLowerCase().includes('dni')) {
            setFieldError('dni', errorMsg);
          } else if (errorMsg.toLowerCase().includes('password')) {
            setFieldError('password', errorMsg);
          } else {
            setError(errorMsg);
          }
          return;
        }

        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        router.push('/auth/login');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            'No se pudo conectar al servidor. Verifica que el backend esté corriendo.'
          );
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-blue-200'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-800'>Crear cuenta</h1>
            <p className='text-gray-600 mt-2'>
              Regístrate para comenzar a usar VitaRed
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg'>
                {error}
              </div>
            )}

            {/* Primer nombre */}
            <div>
              <label
                htmlFor='first_name'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Primer nombre
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

            {/* Apellido */}
            <div>
              <label
                htmlFor='last_name'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Apellido
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
                Número de documento (DNI)
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
                Correo electrónico
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
                <p className='mt-1 text-sm text-red-600'>
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className='relative'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Contraseña
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
                Confirmar contraseña
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

            {/* Botón de Registro */}
            <button
              type='submit'
              disabled={formik.isSubmitting}
              className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {formik.isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>

            {/* Enlace a Login */}
            <div className='text-center mt-6'>
              <p className='text-gray-600 text-sm'>
                ¿Ya tienes cuenta?{' '}
                <a
                  href='/auth/login'
                  className='font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200'
                >
                  Inicia sesión
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
