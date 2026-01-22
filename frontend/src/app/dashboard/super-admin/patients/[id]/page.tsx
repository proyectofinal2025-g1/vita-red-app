// frontend/src/app/dashboard/super-admin/patients/[id]/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';

registerLocale('es', es);
const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface Patient {
  id: string;
  dni: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  createdAt: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  doctorName?: string;
  speciality?: string;
}

interface Doctor {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    profileImagePublicId: string | null;
    profileImageUrl: string | null;
    role: string;
  };
  licence_number: string;
  bio: string | null;
  consultationPrice: string;
  speciality: {
    // ⚠️ El backend actual NO devuelve 'id' aquí, solo 'name'
    name: string;
    description?: string;
  };
}

interface Specialty {
  id: string;
  name: string;
}

interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface DoctorAvailability {
  occupiedTimes: string[];
}

export default function PatientDetailPage() {
  useRoleGuard('superadmin');

  const params = useParams();
  const { id } = params;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [preReserveData, setPreReserveData] = useState({
    doctorId: '',
    specialtyId: '',
    date: null as Date | null,
    time: '',
    reason: '',
  });

  const [showPreReserveForm, setShowPreReserveForm] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false); // ✅ Nuevo
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]); // ✅ Nuevo
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [doctorAvailableDays, setDoctorAvailableDays] = useState<number[]>([]);
  const [preReserveSuccess, setPreReserveSuccess] = useState(false);
  const [preReserveError, setPreReserveError] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchData = async () => {
      try {
        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        const patientRes = await fetch(`${apiURL}/superadmin/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!patientRes.ok) {
          const errorData = await patientRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Paciente no encontrado');
        }

        const data: Patient = await patientRes.json();
        setPatient(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          dni: data.dni,
          email: data.email,
        });

        const appointmentsRes = await fetch(
          `${apiURL}/superadmin/appointments/${id}/list`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!appointmentsRes.ok) {
          if (appointmentsRes.status === 404) {
            setAppointments([]);
            setLoadingAppointments(false);
            return;
          }
          const errorData = await appointmentsRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al cargar citas');
        }

        const appointmentsData: Appointment[] = await appointmentsRes.json();
        setAppointments(appointmentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
        setLoadingAppointments(false);
      }
    };

    if (id) fetchData();
  }, [id, isClient]);

  // ✅ Cargar doctores Y especialidades cuando se abre el formulario
  useEffect(() => {
    if (!isClient || !showPreReserveForm) return;

    const loadDoctorsAndSpecialties = async () => {
      try {
        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        setLoadingDoctors(true);
        setLoadingSpecialties(true);

        // Cargar especialidades (con id)
        const specialtiesRes = await fetch(`${apiURL}/speciality`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (specialtiesRes.ok) {
          const specialtiesData: Specialty[] = await specialtiesRes.json();
          setSpecialties(specialtiesData);
        }

        // Cargar doctores (solo con nombre de especialidad)
        const doctorsRes = await fetch(`${apiURL}/superadmin/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (doctorsRes.ok) {
          const doctorsData: Doctor[] = await doctorsRes.json();
          setDoctors(doctorsData);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoadingDoctors(false);
        setLoadingSpecialties(false);
      }
    };

    loadDoctorsAndSpecialties();
  }, [showPreReserveForm, isClient]);

  useEffect(() => {
    if (!preReserveData.doctorId) {
      setDoctorAvailableDays([]);
      setPreReserveData((prev) => ({ ...prev, date: null }));
      return;
    }

    const loadSchedules = async () => {
      try {
        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        setLoadingSchedules(true);
        const schedulesRes = await fetch(
          `${apiURL}/superadmin/doctors/${preReserveData.doctorId}/schedules`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (schedulesRes.ok) {
          const schedulesData: DoctorSchedule[] = await schedulesRes.json();
          setDoctorSchedules(schedulesData);
          setDoctorAvailableDays(schedulesData.map((s) => s.dayOfWeek));
          setPreReserveData((prev) => ({ ...prev, date: null }));
        } else {
          setDoctorSchedules([]);
          setDoctorAvailableDays([]);
        }
      } catch (err) {
        console.error('Error cargando horarios:', err);
        setDoctorSchedules([]);
        setDoctorAvailableDays([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadSchedules();
  }, [preReserveData.doctorId]);

  useEffect(() => {
    if (!preReserveData.doctorId || !preReserveData.date) {
      setAvailableTimes([]);
      return;
    }

    const loadAvailability = async () => {
      try {
        const userSession = localStorage.getItem('userSession');
        if (!userSession) throw new Error('Sesión no encontrada');
        const token = JSON.parse(userSession).token;

        const formattedDate = preReserveData.date!.toISOString().split('T')[0];
        const dayOfWeek = preReserveData.date!.getDay();

        const schedule = doctorSchedules.find((s) => s.dayOfWeek === dayOfWeek);
        if (!schedule) {
          setAvailableTimes([]);
          return;
        }

        const allSlots = generateTimeSlots(
          schedule.startTime,
          schedule.endTime,
          schedule.slotDuration
        );

        setLoadingAvailability(true);
        const availabilityRes = await fetch(
          `${apiURL}/superadmin/doctors/${preReserveData.doctorId}/availability?date=${formattedDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let occupiedTimes: string[] = [];
        if (availabilityRes.ok) {
          const availabilityData: DoctorAvailability =
            await availabilityRes.json();
          occupiedTimes = availabilityData.occupiedTimes;
        }

        const availableSlots = allSlots.filter(
          (time) => !occupiedTimes.includes(time)
        );
        setAvailableTimes(availableSlots);
      } catch (err) {
        console.error('Error cargando disponibilidad:', err);
        setAvailableTimes([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    loadAvailability();
  }, [preReserveData.doctorId, preReserveData.date, doctorSchedules]);

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    slotDuration: number
  ): string[] => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const current = new Date();
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    while (current <= end) {
      const hours = String(current.getHours()).padStart(2, '0');
      const minutes = String(current.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${minutes}`);

      current.setMinutes(current.getMinutes() + slotDuration);
    }

    return slots;
  };

  const isDoctorAvailableDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    return doctorAvailableDays.includes(dayOfWeek);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const userSession = localStorage.getItem('userSession');
      if (!userSession) throw new Error('Sesión no encontrada');
      const token = JSON.parse(userSession).token;

      const res = await fetch(`${apiURL}/superadmin/patients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al actualizar paciente');
      }

      let updatedPatient;
      try {
        updatedPatient = await res.json();
      } catch (e) {
        updatedPatient = { ...patient, ...formData };
      }

      setSuccess(true);
      setEditMode(false);
      setPatient(updatedPatient as Patient);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handlePreReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreReserveError('');
    setPreReserveSuccess(false);

    if (
      !preReserveData.doctorId ||
      !preReserveData.specialtyId ||
      !preReserveData.date ||
      !preReserveData.time
    ) {
      setPreReserveError('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const userSession = localStorage.getItem('userSession');
      if (!userSession) throw new Error('Sesión no encontrada');
      const token = JSON.parse(userSession).token;

      const formattedDate = preReserveData.date.toISOString().split('T')[0];
      const dateTime = `${formattedDate}T${preReserveData.time}:00`;

      const response = await fetch(
        `${apiURL}/superadmin/appointments/pre-reserve/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: preReserveData.doctorId,
            specialtyId: preReserveData.specialtyId,
            dateTime,
            reason: preReserveData.reason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al pre-reservar el turno');
      }

      setPreReserveData({
        doctorId: '',
        specialtyId: '',
        date: null,
        time: '',
        reason: '',
      });
      setPreReserveSuccess(true);

      const appointmentsRes = await fetch(
        `${apiURL}/superadmin/appointments/${id}/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (appointmentsRes.ok) {
        const appointmentsData: Appointment[] = await appointmentsRes.json();
        setAppointments(appointmentsData);
      }
    } catch (err) {
      setPreReserveError(
        err instanceof Error ? err.message : 'Error desconocido'
      );
    }
  };

  if (!isClient) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Cargando...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Cargando perfil del paciente...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6'>
          <p className='text-red-700'>{error}</p>
        </div>
        <Link
          href='/dashboard/super-admin/patients'
          className='text-blue-600 hover:underline'
        >
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className='max-w-3xl mx-auto p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          👤 Información del paciente {patient.first_name} {patient.last_name}
        </h1>
        <Link
          href='/dashboard/super-admin/patients'
          className='text-blue-600 hover:underline flex items-center gap-1'
        >
          ← Volver a la lista
        </Link>
      </div>

      {success && (
        <div className='mb-4 p-3 bg-green-50 text-green-700 rounded-lg'>
          ✅ Datos actualizados correctamente.
        </div>
      )}

      {error && !loading && (
        <div className='mb-4 p-3 bg-red-50 text-red-700 rounded-lg'>
          ❌ {error}
        </div>
      )}

      {editMode ? (
        <form onSubmit={handleSave} className='bg-white p-6 rounded-xl shadow'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nombres
              </label>
              <input
                type='text'
                name='first_name'
                value={formData.first_name}
                onChange={handleEditChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                DNI
              </label>
              <input
                type='text'
                name='dni'
                value={formData.dni}
                onChange={handleEditChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Apellidos
              </label>
              <input
                type='text'
                name='last_name'
                value={formData.last_name}
                onChange={handleEditChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleEditChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='submit'
              disabled={saving}
              className={`px-5 py-2 rounded-lg font-medium ${
                saving
                  ? 'bg-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type='button'
              onClick={() => {
                setEditMode(false);
                setError(null);
                setSuccess(false);
              }}
              className='px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className='bg-white p-6 rounded-xl shadow'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>Nombres</p>
              <p className='font-medium'>{patient.first_name}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>DNI</p>
              <p className='font-medium'>{patient.dni}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Apellidos</p>
              <p className='font-medium'>{patient.last_name}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Email</p>
              <p className='font-medium'>{patient.email}</p>
            </div>
          </div>

          <div className='mt-6'>
            <button
              onClick={() => setEditMode(true)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
            >
              ✏️ Editar Paciente
            </button>
          </div>
        </div>
      )}

      {/* Citas del paciente */}
      <div className='mt-8 bg-white p-6 rounded-xl shadow'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>
          📅 Citas del Paciente
        </h2>

        {loadingAppointments ? (
          <div className='text-center py-4'>
            <div className='inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 mr-2'></div>
            Cargando citas...
          </div>
        ) : appointments.length === 0 ? (
          <p className='text-gray-500 italic'>No tiene citas asignadas.</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Fecha
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Hora
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Doctor
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Especialidad
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {appointments.map((appt) => (
                  <tr key={appt.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-900'>
                      {appt.date}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-600'>
                      {appt.time}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-600'>
                      {appt.doctorName || 'Médico no asignado'}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-600'>
                      {appt.speciality || '—'}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulario para pre-reservar turno */}
      <div className='mt-8 bg-white p-6 rounded-xl shadow'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold text-gray-800'>
            📝 Pre-reservar Turno
          </h2>
          <button
            onClick={() => setShowPreReserveForm(!showPreReserveForm)}
            className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
          >
            {showPreReserveForm ? 'Cerrar Formulario' : 'Pre-reservar Turno'}
          </button>
        </div>

        {showPreReserveForm && (
          <form onSubmit={handlePreReserveSubmit} className='space-y-4'>
            {preReserveSuccess && (
              <div className='p-3 bg-green-50 text-green-700 rounded-lg'>
                ✅ Turno pre-reservado exitosamente
              </div>
            )}

            {preReserveError && (
              <div className='p-3 bg-red-50 text-red-700 rounded-lg'>
                ❌ {preReserveError}
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Selector de doctor */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Doctor *
                </label>
                <select
                  value={preReserveData.doctorId}
                  onChange={(e) => {
                    const selectedDoctorId = e.target.value;
                    const selectedDoctor = doctors.find(
                      (d) => d.id === selectedDoctorId
                    );

                    let specialtyId = '';
                    if (selectedDoctor) {
                      // ✅ Buscar el ID usando el nombre
                      const match = specialties.find(
                        (s) => s.name === selectedDoctor.speciality.name
                      );
                      specialtyId = match ? match.id : '';
                    }

                    setPreReserveData({
                      ...preReserveData,
                      doctorId: selectedDoctorId,
                      specialtyId,
                    });
                    console.log('specialtyId asignado:', specialtyId);
                  }}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  disabled={loadingDoctors || loadingSpecialties}
                >
                  <option value=''>Seleccionar doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.user.first_name} {doctor.user.last_name} -{' '}
                      {doctor.speciality.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Fecha *
                </label>
                <DatePicker
                  selected={preReserveData.date}
                  onChange={(date: Date | null) =>
                    setPreReserveData({ ...preReserveData, date })
                  }
                  filterDate={isDoctorAvailableDay}
                  minDate={new Date()}
                  locale='es'
                  dateFormat='dd/MM/yyyy'
                  placeholderText='Selecciona una fecha'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>

              {/* Hora */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Hora *
                </label>
                <select
                  value={preReserveData.time}
                  onChange={(e) =>
                    setPreReserveData({
                      ...preReserveData,
                      time: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  disabled={!preReserveData.date || loadingAvailability}
                  required
                >
                  <option value=''>Selecciona hora</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Motivo
                </label>
                <input
                  type='text'
                  value={preReserveData.reason}
                  onChange={(e) =>
                    setPreReserveData({
                      ...preReserveData,
                      reason: e.target.value,
                    })
                  }
                  placeholder='Motivo de la consulta'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            <div className='pt-4'>
              <button
                type='submit'
                disabled={loadingAvailability}
                className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50'
              >
                {loadingAvailability
                  ? 'Cargando horarios...'
                  : 'Pre-reservar Turno'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
