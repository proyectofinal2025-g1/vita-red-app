// src/utils/getDashboardRoute.ts

import router from 'next/router';

export const getDashboardRoute = async (role: string): Promise<string> => {
  // Convierte a mayúsculas para evitar problemas de case
  const normalizedRole = role.toUpperCase();
  console.log(`role.toUpperCase():` + normalizedRole);
  switch (normalizedRole) {
    case 'PATIENT':
      return '/dashboard/patient';
    case 'MEDICO':
      return '/dashboard/doctor';
    case 'SUPERADMIN':
      return '/dashboard/super-admin';
    default:
      await router.push('/auth/login');
      return '';
  }
};
