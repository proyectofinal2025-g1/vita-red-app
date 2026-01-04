'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';
import AppointmentForm from '@/components/AppointmentForm';

import CarrouselHome from '@/components/CarrouselHome';
import SectionOneTwoHome from '@/components/SectionOneTwoHome';
import Image from 'next/image';
import { Footer } from '@/components/Footer';

export default function Home() {
  const { dataUser } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleBookAppointment = () => {
    if (!dataUser) {
      Swal.fire({
        title: '¡Ups!',
        text: 'Para agendar un turno, debes iniciar sesión.',
        icon: 'warning',
        confirmButtonText: 'Ir a Iniciar Sesión',
        confirmButtonColor: '#007bff',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#6c757d',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/auth/login';
        }
      });
    } else {
      setIsFormOpen(true);
    }
  };

  return (
    <>
      <section className='w-screen h-screen relative flex items-center justify-center text-white'>
        <Image
          src='/clinica3.png'
          alt='imagenFondo'
          fill
          className='object-cover'
          priority
        />

        <div className='absolute inset-0 bg-black/50'></div>

        <div className='relative z-10 text-center px-4'>
          <h1 className='text-5xl font-bold mb-4'>Agenda tu turno acá!</h1>

          <p className='text-xl mb-6 max-w-2xl mx-auto'>
            Atención profesional, rápida y confiable. Tu salud es nuestra
            prioridad.
          </p>

          <button
            onClick={handleBookAppointment}
            className='text-2xl cursor-pointer rounded-xl bg-blue-400 px-6 py-3 hover:bg-blue-600 transition'
          >
            Sacar turno
          </button>
        </div>
      </section>

      <SectionOneTwoHome />

      <section className='mt-20 px-6'>
        <h2 className='text-center text-3xl font-semibold mb-10'>
          Nuestras especialidades
        </h2>
        <CarrouselHome />
      </section>

      {isFormOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
            <AppointmentForm onClose={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
