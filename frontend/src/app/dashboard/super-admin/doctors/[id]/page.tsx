// frontend/src/app/dashboard/super-admin/doctors/[id]/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowPathIcon,
  UserCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  doctor: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface DoctorDetail {
  id: string;
  bio: string | null;
  consultationPrice: string;
  isActive: boolean;
  licence_number: string;
  speciality: {
    name: string;
    description?: string;
  };
  user: {
    id: string;
    dni: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    profileImagePublicId: string | null;
    profileImageUrl: string | null;
    role: string;
  };
}

// Nuevo tipo para editar horarios
interface EditableSchedule extends Omit<DoctorSchedule, 'id'> {
  id?: string; // opcional porque podría ser nuevo
  isEditing?: boolean;
  isNew?: boolean;
}

export default function DoctorProfilePage() {
  useRoleGuard('superadmin');

  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [schedules, setSchedules] = useState<EditableSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingSchedules, setIsEditingSchedules] = useState(false);
  const [savingSchedules, setSavingSchedules] = useState(false);

  // ✅ Estado para saber si estamos en el cliente
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isClient) return; // ✅ Solo ejecutar si estamos en el cliente
      try {
        // ✅ Validación del ID
        if (!id || typeof id !== 'string') {
          throw new Error('ID inválido');
        }

        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        // Cargar médico
        const doctorRes = await fetch(`${apiURL}/superadmin/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!doctorRes.ok) {
          const errorData = await doctorRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al cargar el médico');
        }
        const doctorData: DoctorDetail = await doctorRes.json();
        setDoctor(doctorData);

        // Cargar horarios
        const schedulesRes = await fetch(
          `${apiURL}/superadmin/doctors/${id}/schedules`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (schedulesRes.ok) {
          const schedulesData: DoctorSchedule[] = await schedulesRes.json();
          setSchedules(
            schedulesData.map((schedule) => ({ ...schedule, isEditing: false }))
          );
        }

        // Cargar citas
        const appointmentsRes = await fetch(
          `${apiURL}/superadmin/appointments/doctors/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (appointmentsRes.ok) {
          const appointmentsData: Appointment[] = await appointmentsRes.json();
          setAppointments(appointmentsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
        setLoadingSchedules(false);
        setLoadingAppointments(false);
      }
    };

    fetchData();
  }, [id, isClient]); // ✅ Dependemos de isClient

  // Funciones para manejar la edición de horarios
  const startEditingSchedules = () => {
    setIsEditingSchedules(true);
    // Asegurar que todos los horarios estén en modo edición
    setSchedules((prev) =>
      prev.map((schedule) => ({ ...schedule, isEditing: true }))
    );
  };

  const cancelEditingSchedules = () => {
    setIsEditingSchedules(false);
    // Restaurar los horarios originales y quitar el modo edición
    const originalSchedules = schedules.filter((s) => !s.isNew);
    setSchedules(
      originalSchedules.map((schedule) => ({ ...schedule, isEditing: false }))
    );
  };

  const saveSchedules = async () => {
    if (!id) return;

    try {
      setSavingSchedules(true);

      const userSession = localStorage.getItem('userSession');
      if (!userSession) throw new Error('Sesión no encontrada');
      const token = JSON.parse(userSession).token;

      // Procesar cada horario (crear, actualizar o eliminar)
      for (const schedule of schedules) {
        if (schedule.isNew) {
          // Crear nuevo horario
          const response = await fetch(
            `${apiURL}/superadmin/doctors/${id}/schedules`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                doctorId: id,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDuration: schedule.slotDuration,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                `Error al crear horario para el día ${schedule.dayOfWeek}`
            );
          }
        } else {
          // Actualizar horario existente
          const response = await fetch(
            `${apiURL}/superadmin/doctors/${id}/schedules`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDuration: schedule.slotDuration,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                `Error al actualizar horario para el día ${schedule.dayOfWeek}`
            );
          }
        }
      }

      // Recargar los horarios después de guardar
      const schedulesRes = await fetch(
        `${apiURL}/superadmin/doctors/${id}/schedules`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (schedulesRes.ok) {
        const schedulesData: DoctorSchedule[] = await schedulesRes.json();
        setSchedules(
          schedulesData.map((schedule) => ({ ...schedule, isEditing: false }))
        );
      }

      setIsEditingSchedules(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error desconocido al guardar horarios'
      );
    } finally {
      setSavingSchedules(false);
    }
  };

  const handleScheduleChange = (
    index: number,
    field: keyof Omit<EditableSchedule, 'dayOfWeek'>, // Excluir dayOfWeek
    value: EditableSchedule[typeof field]
  ) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, [field]: value } : schedule
      )
    );
  };

  const addNewSchedule = () => {
    const newSchedule: EditableSchedule = {
      doctorId: id || '',
      dayOfWeek: 1, // Default to Monday
      startTime: '08:00',
      endTime: '17:00',
      slotDuration: 30,
      isEditing: true,
      isNew: true,
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

  const removeSchedule = async (index: number) => {
    const scheduleToRemove = schedules[index];

    if (scheduleToRemove.id) {
      // Eliminar horario existente
      try {
        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        const response = await fetch(
          `${apiURL}/superadmin/doctors/${id}/schedules/${scheduleToRemove.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al eliminar el horario');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al eliminar horario'
        );
        return;
      }
    }

    // Remover de la UI
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleScheduleEdit = (index: number) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, isEditing: !schedule.isEditing } : schedule
      )
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='flex items-center space-x-2 text-lg'>
          <ArrowPathIcon className='h-6 w-6 animate-spin text-blue-600' />
          <span>Cargando información del médico...</span>
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
            href='/dashboard/super-admin/doctors'
            className='px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition'
          >
            ← Volver a Médicos
          </Link>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className='max-w-6xl mx-auto p-6'>
        <div className='text-center py-10'>
          <p className='text-gray-500'>No se encontró el médico solicitado.</p>
          <Link
            href='/dashboard/super-admin/doctors'
            className='mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
          >
            ← Volver a Médicos
          </Link>
        </div>
      </div>
    );
  }

  const daysOfWeek = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>
          👨‍⚕️ Información del Médico
        </h1>
        <Link
          href='/dashboard/super-admin/doctors'
          className='text-blue-600 hover:underline flex items-center gap-1'
        >
          ← Volver a Médicos
        </Link>
      </div>

      {/* Tarjeta de perfil */}
      <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Foto y estado */}
          <div className='flex flex-col items-center'>
            <div className='w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
              {doctor.user.profileImageUrl ? (
                <img
                  src={doctor.user.profileImageUrl}
                  alt={`${doctor.user.first_name} ${doctor.user.last_name}`}
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                <UserCircleIcon className='h-16 w-16 text-gray-400' />
              )}
            </div>
            {/* ✅ Usamos user.is_active como fuente de verdad */}
            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                doctor.user.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {doctor.user.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Datos del médico */}
          <div className='flex-1'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {doctor.user.first_name} {doctor.user.last_name}
            </h2>
            <p className='text-gray-600 mt-1'>
              <span className='font-medium'>Email:</span> {doctor.user.email}
            </p>
            <p className='text-gray-600 mt-1'>
              <span className='font-medium'>DNI:</span> {doctor.user.dni}
            </p>
            <p className='text-gray-600 mt-1'>
              <span className='font-medium'>Licencia:</span>{' '}
              {doctor.licence_number}
            </p>
            <p className='text-gray-600 mt-1'>
              <span className='font-medium'>Especialidad:</span>{' '}
              {doctor.speciality.name}
            </p>
            <p className='text-gray-600 mt-1'>
              <span className='font-medium'>Precio de Consulta:</span> $
              {doctor.consultationPrice}
            </p>
            {doctor.bio && (
              <div className='mt-4'>
                <h3 className='font-semibold text-gray-800'>Biografía</h3>
                <p className='text-gray-600'>{doctor.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold text-gray-800'>
            📅 Horarios del Médico
          </h2>
          <div className='flex space-x-2'>
            {isEditingSchedules ? (
              <>
                <button
                  onClick={addNewSchedule}
                  className='flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm'
                >
                  <PlusIcon className='h-4 w-4' />
                  Agregar
                </button>
                <button
                  onClick={saveSchedules}
                  disabled={savingSchedules}
                  className='flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50'
                >
                  {savingSchedules ? (
                    <ArrowPathIcon className='h-4 w-4 animate-spin' />
                  ) : (
                    <CheckIcon className='h-4 w-4' />
                  )}
                  Guardar
                </button>
                <button
                  onClick={cancelEditingSchedules}
                  className='flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm'
                >
                  <XMarkIcon className='h-4 w-4' />
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={startEditingSchedules}
                className='flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm'
              >
                <PencilIcon className='h-4 w-4' />
                Editar Horarios
              </button>
            )}
          </div>
        </div>

        {!loadingSchedules && schedules.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Día
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Hora Inicio
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Hora Fin
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Duración (min)
                  </th>
                  {isEditingSchedules && (
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {schedules.map((schedule, index) => (
                  <tr
                    key={schedule.id || `new-${index}`}
                    className='hover:bg-gray-50'
                  >
                    <td className='px-4 py-3 whitespace-nowrap text-gray-900'>
                      {/* Mostrar día como texto fijo - no editable */}
                      {daysOfWeek[schedule.dayOfWeek - 1]}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-600'>
                      {isEditingSchedules ? (
                        <input
                          type='time'
                          value={schedule.startTime}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              'startTime',
                              e.target.value
                            )
                          }
                          className='border border-gray-300 rounded px-2 py-1 w-full'
                        />
                      ) : (
                        schedule.startTime
                      )}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-600'>
                      {isEditingSchedules ? (
                        <input
                          type='time'
                          value={schedule.endTime}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              'endTime',
                              e.target.value
                            )
                          }
                          className='border border-gray-300 rounded px-2 py-1 w-full'
                        />
                      ) : (
                        schedule.endTime
                      )}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-600'>
                      {isEditingSchedules ? (
                        <input
                          type='number'
                          value={schedule.slotDuration}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              'slotDuration',
                              parseInt(e.target.value)
                            )
                          }
                          className='border border-gray-300 rounded px-2 py-1 w-full'
                          min='5'
                          step='5'
                        />
                      ) : (
                        schedule.slotDuration
                      )}
                    </td>
                    {isEditingSchedules && (
                      <td className='px-4 py-3 whitespace-nowrap text-sm'>
                        <button
                          onClick={() => removeSchedule(index)}
                          className='text-red-600 hover:text-red-800'
                        >
                          <TrashIcon className='h-5 w-5' />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : loadingSchedules ? (
          <p className='text-gray-500 italic'>Cargando horarios...</p>
        ) : (
          <p className='text-gray-500 italic'>No tiene horarios asignados.</p>
        )}
      </div>

      {/* Citas Asignadas */}
      <div className='bg-white rounded-xl shadow-lg p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold text-gray-800'>
            🗓️ Citas Asignadas
          </h2>
          {loadingAppointments && (
            <div className='flex items-center space-x-2 text-sm text-gray-500'>
              <ArrowPathIcon className='h-4 w-4 animate-spin' />
              <span>Cargando citas...</span>
            </div>
          )}
        </div>
        {!loadingAppointments && appointments.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Fecha y Hora
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Paciente
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Estado
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {appointments.map((appt) => (
                  <tr key={appt.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-900'>
                      {new Date(appt.date).toLocaleDateString()} {appt.time}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-600'>
                      {appt.patient.first_name} {appt.patient.last_name}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appt.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : appt.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appt.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-sm'>
                      <Link
                        href={`/dashboard/super-admin/appointments/${appt.id}`}
                        className='text-blue-600 hover:underline'
                      >
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : loadingAppointments ? (
          <p className='text-gray-500 italic'>Cargando citas...</p>
        ) : (
          <p className='text-gray-500 italic'>No tiene citas asignadas.</p>
        )}
      </div>

      {/* Pie */}
      <div className='mt-8 text-center'>
        <Link
          href='/dashboard/super-admin/doctors'
          className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition'
        >
          ← Volver a Médicos
        </Link>
      </div>
    </div>
  );
}
