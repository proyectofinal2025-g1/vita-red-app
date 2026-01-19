import { IRegisterDoctorValues } from '@/interfaces/IRegisterDoctorValues';
import { ILoginFormValues } from '../interfaces/ILoginFormValues';
import { IRegisterFormValues } from '../interfaces/IRegisterFormValues';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export const registerUserService = async (userData: IRegisterFormValues) => {
  const response = await fetch(`${apiURL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: userData.first_name,
      last_name: userData.last_name,
      dni: userData.dni,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
    }),
  });

  const data = await response.json();
  console.log('Respuesta del backend:', data);

  if (!response.ok) {
    const errorMsg = data.message || data.error || 'Error en el registro';
    throw new Error(errorMsg);
  }
  return data;
};

export const loginUserService = async (userData: ILoginFormValues) => {
  const response = await fetch(`${apiURL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  console.log('Respuesta del backend (Login):', data);

  if (!response.ok) {
    const errorMsg = data.message || data.error || 'Credenciales incorrectas';
    throw new Error(errorMsg);
  }

  return data;
};

export const registerDoctorService = async (userData: IRegisterDoctorValues) => {
  const response = await fetch(`${apiURL}/doctors/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: userData.first_name,
      last_name: userData.last_name,
      dni: userData.dni,
      email: userData.email,
      licence_number: `MP-${userData.licence_number}`,
      speciality_id: userData.speciality_id,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
    }),
  });

  const data = await response.json();
  console.log('Respuesta del backend:', data);

  if (!response.ok) {
    const errorMsg = data.message || data.error || 'Error en el registro del médico';
    throw new Error(errorMsg);
  }
  return data;
};