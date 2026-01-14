// frontend/src/hooks/useRoleGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook para proteger páginas según el rol del usuario.
 *
 * @param allowedRole - El rol permitido (ej. 'superadmin')
 * @param token - Token JWT opcional (si no se pasa, se usa localStorage)
 */
export const useRoleGuard = (allowedRole: string, token?: string | null) => {
  const router = useRouter();

  useEffect(() => {
    let finalToken = token;

    // Si no se proporciona token, intentar obtenerlo de localStorage
    if (!finalToken) {
      const userSession = localStorage.getItem('userSession');
      if (!userSession) {
        router.push('auth/login');
        return;
      }
      try {
        const session = JSON.parse(userSession);
        finalToken = session.token;
      } catch {
        router.push('/login');
        return;
      }
    }

    if (!finalToken) {
      router.push('/login');
      return;
    }

    try {
      const parts = finalToken.split('.');
      if (parts.length !== 3) {
        router.push('/login');
        return;
      }

      const decoded = JSON.parse(atob(parts[1]));
      const userRole = decoded.role;

      if (userRole !== allowedRole) {
        router.push('/unauthorized');
        return;
      }
    } catch (error) {
      console.error('Error validando token:', error);
      router.push('/login');
    }
  }, [allowedRole, token, router]);
};
