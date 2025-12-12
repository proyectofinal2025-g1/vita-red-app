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
  const router = useRouter(); // Para redirecciones si es necesario

  const formik = useFormik({
    initialValues: registerFormInitialValues,
    validationSchema: registerformValidatorSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Simulación de registro
        console.log('Datos de registro:', values);
        alert(`¡Registro exitoso para ${values.name} (${values.email})!`);
        resetForm(); // Limpia el formulario
        router.push('/auth/login'); // Opcional: redirigir a login
      } catch (err) {
        setError('Error al registrarse. Por favor, inténtalo de nuevo.');
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

            {/* Nombre */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Nombre completo
              </label>
              <input
                id='name'
                name='name'
                type='text'
                placeholder='Tu nombre completo'
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formik.touched.name && formik.errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className='mt-1 text-sm text-red-600'>
                  {formik.errors.name}
                </p>
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
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Contraseña
              </label>
              <input
                id='password'
                name='password'
                type='password'
                placeholder='••••••••'
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <p className='mt-1 text-sm text-red-600'>
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Confirmar contraseña
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                placeholder='••••••••'
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
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
