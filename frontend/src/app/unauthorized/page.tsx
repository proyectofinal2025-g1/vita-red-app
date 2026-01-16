import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <div className='text-center max-w-md'>
        <h1 className='text-2xl font-bold text-gray-800 mb-3'>
          Acceso Restringido
        </h1>
        <p className='text-gray-600 mb-6'>
          No tienes permisos para acceder a esta página.
        </p>
        <Link
          href='/'
          className='bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:bg-blue-700 transition'
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
