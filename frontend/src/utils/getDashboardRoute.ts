// src/utils/getDashboardRoute.ts

export const getDashboardRoute = (role: string): string => {
  // Convierte a mayúsculas para evitar problemas de case
  const normalizedRole = role.toUpperCase();

  switch (normalizedRole) {
    case 'PATIENT':
      return '/dashboard/patient';
    // case 'DOCTOR':
      // return '/dashboard/doctor';
    // case 'SECRETARY':
      // return '/dashboard/secretary';
    // case 'SUPER_ADMIN':
      // return '/dashboard/super-admin';
    default:
      return '/auth/login';
  }
};
