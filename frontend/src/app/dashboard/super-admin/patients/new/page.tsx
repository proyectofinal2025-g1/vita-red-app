// frontend/src/app/dashboard/super-admin/doctors/new/page.tsx
'use client';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface Speciality {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function CreateDoctorPage() {
  useRoleGuard('superadmin');

  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    email: '',
    password: '',
    licence_number: '',
    speciality_id: '',
  });

  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar especialidades al montar
  useEffect(() => {
    const loadSpecialities = async () => {
      try {
        const res = await fetch(`${apiURL}/speciality`);
        if (!res.ok) throw new Error('Error al cargar especialidades');
        const data = await res.json();
        setSpecialities(data);
      } catch (err) {
        console.error('Error al cargar especialidades:', err);
      }
    };
    loadSpecialities();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!formData.speciality_id) {
      setError('Debes seleccionar una especialidad');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const userSession = localStorage.getItem('userSession');
      if (!userSession) throw new Error('Sesión no encontrada');
      const token = JSON.parse(userSession).token;

      // Paso 1: Crear usuario como paciente
      const patientRes = await fetch(`${apiURL}/superadmin/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          dni: formData.dni,
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log(`✅ Respuesta creando Paciente:`, patientRes);

      if (!patientRes.ok) {
        const errorData = await patientRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el usuario');
      }

      // Paso 2: Buscar el usuario por DNI para obtener su ID
      const findUserRes = await fetch(
        `${apiURL}/superadmin/patients/dni/${formData.dni}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`🔍 Busca el Paciente creado:`, findUserRes);

      if (!findUserRes.ok) {
        const errorData = await findUserRes.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'No se pudo encontrar el usuario recién creado'
        );
      }

      const foundUser = await findUserRes.json();

      console.log(`📄 Nuevo Paciente parseado:`, foundUser);

      // ✅ Validación explícita del ID
      if (!foundUser || typeof foundUser !== 'object') {
        throw new Error('Respuesta inválida: no se recibió un objeto');
      }

      if (!foundUser.id || typeof foundUser.id !== 'string') {
        throw new Error('Respuesta inválida: no se recibió un ID válido');
      }

      const userId = foundUser.id;

      console.log(`✅ ID del Nuevo Paciente:`, userId);

      // Paso 3: Cambiar rol a médico
      const roleRes = await fetch(`${apiURL}/superadmin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'medico' }),
      });

      console.log(`🔄 Cambiamos de rol:`, roleRes);

      if (!roleRes.ok) {
        const errorData = await roleRes.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Error al cambiar el rol a médico'
        );
      }

      // Paso 4: Crear perfil médico
      const doctorRes = await fetch(`${apiURL}/superadmin/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          licence_number: formData.licence_number,
          user_id: userId,
          speciality_id: formData.speciality_id,
        }),
      });

      console.log(`🏥 Doctor Creado:`, doctorRes);

      if (!doctorRes.ok) {
        const errorData = await doctorRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el perfil médico');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/super-admin/doctors'), 2000);
    } catch (err) {
      console.error('❌ Error en la creación del médico:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          ➕ Crear Nuevo Médico
        </h1>
        <Link
          href='/dashboard/super-admin/doctors'
          className='text-blue-600 hover:underline flex items-center gap-1'
        >
          ← Volver a la lista
        </Link>
      </div>

      {success && (
        <div className='mb-6 p-4 bg-green-50 border border-green-500 text-green-700 rounded-lg'>
          ✅ Médico creado exitosamente. Redirigiendo...
        </div>
      )}

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-500 text-red-700 rounded-lg'>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='bg-white p-6 rounded-xl shadow'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Nombres *
            </label>
            <input
              type='text'
              name='first_name'
              value={formData.first_name}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Apellidos *
            </label>
            <input
              type='text'
              name='last_name'
              value={formData.last_name}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              DNI * (único)
            </label>
            <input
              type='text'
              name='dni'
              value={formData.dni}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email *
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Contraseña *
            </label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              placeholder='Mínimo 6 caracteres'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Número de Licencia *
            </label>
            <input
              type='text'
              name='licence_number'
              value={formData.licence_number}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Especialidad *
            </label>
            <select
              name='speciality_id'
              value={formData.speciality_id}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Seleccione una especialidad</option>
              {specialities.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='flex gap-3 pt-4'>
          <button
            type='submit'
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Creando...' : 'Crear Médico'}
          </button>
          <Link
            href='/dashboard/super-admin/doctors'
            className='px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
