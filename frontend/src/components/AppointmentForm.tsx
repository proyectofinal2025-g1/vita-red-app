'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ISpeciality } from '@/interfaces/ISpeciality';
import { IDoctor } from '@/interfaces/IDoctor';
import { getAllSpecialityService } from '@/services/specialityServices';
import { getAllDoctorsService } from '@/services/doctorService';
import {
  getDoctorSchedules,
  preReserveAppointment,
  generateTimeSlots,
} from '@/services/appointmentService';
import {
  isWeekend,
  getDayOfWeekAsNumber,
  getMinDateForAppointment,
  isWithin24Hours,
} from '@/utils/dateUtils';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const userSession = localStorage.getItem('userSession');
  if (!userSession) return null;
  try {
    const session = JSON.parse(userSession);
    return session.token || null;
  } catch {
    return null;
  }
};

export default function AppointmentForm({ onClose }: { onClose: () => void }) {
  const [specialities, setSpecialities] = useState<ISpeciality[]>([]);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);

  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Especialidades
  useEffect(() => {
    const loadSpecialities = async () => {
      try {
        const data = await getAllSpecialityService();
        setSpecialities(data.filter((spec) => spec.isActive));
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
      }
    };
    loadSpecialities();
  }, []);

  // Doctores
  useEffect(() => {
    if (!selectedSpeciality) {
      setDoctors([]);
      setSelectedDoctor(null);
      return;
    }

    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const allDoctors = await getAllDoctorsService();
        const filtered = allDoctors.filter(
          (doc) => doc.speciality === selectedSpeciality
        );
        setDoctors(filtered);
      } catch (error) {
        console.error('Error al cargar doctores:', error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [selectedSpeciality]);

  // Horarios disponibles
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setAvailableTimes([]);
      setErrorMessage(null);
      return;
    }

    if (isWeekend(selectedDate)) {
      setAvailableTimes([]);
      setErrorMessage('No se atiende los fines de semana.');
      return;
    }

    const loadAvailableSlots = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const schedules = await getDoctorSchedules(selectedDoctor);

        const date = new Date(selectedDate + 'T00:00:00Z');
        const dayOfWeek = getDayOfWeekAsNumber(date);

        const scheduleForDay = schedules.find((s) => s.dayOfWeek === dayOfWeek);
        if (!scheduleForDay) {
          setAvailableTimes([]);
          setErrorMessage('No hay horarios disponibles para esta fecha.');
          return;
        }

        const slots = generateTimeSlots(
          scheduleForDay.startTime,
          scheduleForDay.endTime,
          scheduleForDay.slotDuration
        );
        setAvailableTimes(slots);
      } catch (error: any) {
        console.error('Error al cargar horarios:', error);
        setAvailableTimes([]);
        setErrorMessage('No se pudieron cargar los horarios disponibles.');
      } finally {
        setLoading(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDoctor, selectedDate]);

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const timeInput = formData.get('time') as string;

    if (!selectedDoctor || !selectedDate || !timeInput) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
        icon: 'warning',
      });
      return;
    }

    if (isWithin24Hours(selectedDate, timeInput)) {
      Swal.fire({
        title: 'Anticipación insuficiente',
        text: 'Debes agendar tu turno con al menos 24 horas de anticipación.',
        icon: 'warning',
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      Swal.fire({
        title: 'Sesión expirada',
        text: 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.',
        icon: 'warning',
      }).then(() => {
        window.location.href = '/auth/login';
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await preReserveAppointment(
        {
          doctorId: selectedDoctor,
          dateTime: `${selectedDate}T${timeInput}:00`,
          specialtyId: specialities.find((s) => s.name === selectedSpeciality)
            ?.id,
        },
        token
      );

      Swal.fire({
        title: '¡Turno pre-reservado!',
        text: 'Tu cita ha sido reservada. Completa el pago para confirmar.',
        icon: 'success',
        confirmButtonText: 'Continuar con el pago!',
        confirmButtonColor: '#28a745',
      }).then(() => {
        onClose();
        window.location.href = '/payment';
      });
    } catch (error: any) {
      Swal.fire({
        title: 'Error al agendar',
        text: error.message || 'Ocurrió un problema. Inténtalo nuevamente.',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto'
    >
      <h2 className='text-2xl font-bold mb-4 text-gray-800'>Agenda tu cita</h2>

      {/* Especialidad */}
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1 text-gray-700'>
          Especialidad
        </label>
        <select
          value={selectedSpeciality}
          onChange={(e) => setSelectedSpeciality(e.target.value)}
          className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          required
        >
          <option value=''>Selecciona una especialidad</option>
          {specialities.map((spec) => (
            <option key={spec.id} value={spec.name}>
              {spec.name}
            </option>
          ))}
        </select>
      </div>

      {/* Médico */}
      {selectedSpeciality && (
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1 text-gray-700'>
            Médico
          </label>
          {loadingDoctors ? (
            <p className='text-gray-500'>Cargando...</p>
          ) : (
            <select
              value={selectedDoctor || ''}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
            >
              <option value=''>Selecciona un médico</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fullName}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Fecha */}
      {selectedDoctor && (
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1 text-gray-700'>
            Fecha
          </label>
          <input
            type='date'
            value={selectedDate}
            min={getMinDateForAppointment()}
            onChange={(e) => {
              const newDate = e.target.value;
              if (newDate && isWeekend(newDate)) {
                setSelectedDate(newDate);
                setAvailableTimes([]);
                setErrorMessage('No se atiende los fines de semana.');
              } else {
                setSelectedDate(newDate);
                setErrorMessage(null);
              }
            }}
            className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            required
          />
        </div>
      )}

      {/* Hora disponible */}
      {selectedDoctor && selectedDate && (
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1 text-gray-700'>
            Hora disponible
          </label>
          {loading ? (
            <p className='text-gray-500'>Cargando horarios...</p>
          ) : availableTimes.length > 0 ? (
            <select
              name='time'
              className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
            >
              <option value=''>Selecciona una hora</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          ) : (
            <p className='text-red-500'>
              {errorMessage || 'No hay horarios disponibles para esta fecha.'}
            </p>
          )}
        </div>
      )}

      {/* Botones */}
      <div className='flex justify-between mt-6'>
        <button
          type='button'
          onClick={onClose}
          className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition'
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type='submit'
          className={`px-4 py-2 rounded text-white transition ${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={
            isSubmitting ||
            !selectedDoctor ||
            !selectedDate ||
            loading ||
            isWeekend(selectedDate) ||
            availableTimes.length === 0
          }
        >
          {isSubmitting ? (
            <span className='flex items-center'>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Procesando...
            </span>
          ) : (
            'Confirmar turno'
          )}
        </button>
      </div>
    </form>
  );
}
