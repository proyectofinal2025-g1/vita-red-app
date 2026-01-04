// src/components/UI/LoginView.tsx
'use client';

import { useFormik } from 'formik';
import {
  initialValuesLogin,
  loginValidationSchema,
} from '../../validators/loginSchema';
import { useState } from 'react';
import { loginUserService } from '@/utils/auth.helper';
import { ILoginFormValues } from '@/interfaces/ILoginFormValues';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { decodeJWT } from '@/utils/decodeJWT';
import { getDashboardRoute } from '@/utils/getDashboardRoute';

const LoginForm = () => {
  const { loginWithToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik<ILoginFormValues>({
    initialValues: initialValuesLogin,
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      setSubmitting(true);

      try {
        const data = await loginUserService(values);

        const token = data.Token;
        const payload = decodeJWT(token);

        if (!payload) {
          throw new Error('Token inválido');
        }

        loginWithToken(token);

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola ${payload.first_name}, has iniciado sesión correctamente.           Ten encuenta que tu sesion expirara en 1 hora.`,
          confirmButtonText: 'Continuar',
          timer: 6000,
          timerProgressBar: true,
        }).then(() => {
          console.log(
            'Role recibido:',
            payload.role,
            'Tipo:',
            typeof payload.role
          );
          const route = getDashboardRoute(payload.role);
          console.log('Ruta calculada:', route);
          router.push(route);
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido al iniciar sesión.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-blue-200'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-800'>Iniciar sesión</h1>
            <p className='text-gray-600 mt-2'>Bienvenido a VitaRed</p>
          </div>

          <form onSubmit={formik.handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg'>
                {error}
              </div>
            )}

            {/* Boton de google */}
            <button
              onClick={() =>
                (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
              }
              className='
    flex items-center justify-center gap-3
    w-full max-w-sm
    px-5 py-3
    border border-gray-300
    rounded-lg
    bg-white
    text-gray-700 font-medium
    shadow-sm
    hover:bg-gray-50
    hover:shadow-md
    transition
    focus:outline-none
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  '
            >
              <img
                src='https://res.cloudinary.com/ds6anafmo/image/upload/v1767363345/pngtree-google-internet-icon-vector-png-image_9183287_zv82g1.png'
                alt='Google'
                className='w-5 h-5'
              />
              <span>Iniciar Sesión con Google</span>
            </button>

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

            {/* Olvidé contraseña */}
            <div className='text-right'>
              <button
                type='button'
                className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200'
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de Login */}
            <button
              type='submit'
              disabled={formik.isSubmitting}
              className='w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {formik.isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            {/* Enlace a Registro */}
            <div className='text-center mt-6'>
              <p className='text-gray-600 text-sm'>
                ¿No tienes cuenta?{' '}
                <a
                  href='/auth/register'
                  className='font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200'
                >
                  Regístrate ahora
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
