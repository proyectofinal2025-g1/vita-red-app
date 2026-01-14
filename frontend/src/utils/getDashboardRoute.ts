// src/utils/getDashboardRoute.ts

export const getDashboardRoute = (role: string): string => {
  // Convierte a mayúsculas para evitar problemas de case
  const normalizedRole = role.toUpperCase();
  console.log(`role.toUpperCase():` + normalizedRole);
  switch (normalizedRole) {
    case 'PATIENT':
      return '/dashboard/patient';
    case 'MEDICO':
      return '/dashboard/doctor';
    case 'SECRETARY':
      return '/dashboard/secretary';
    case 'SUPERADMIN':
      return '/dashboard/super-admin';
    default:
      return '/auth/login';
  }
};
