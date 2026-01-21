// frontend/src/hooks/useRoleGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_DELAY = 100; // Milisegundos para asegurar que localStorage esté listo

/**
 * Hook para proteger páginas según el rol del usuario.
 * - Obtiene el token desde localStorage.getItem('userSession')
 * - Valida que el rol coincida con el permitido
 * - Redirige a /auth/login si no hay sesión válida
 * - Redirige a /unauthorized si el rol no coincide
 *
 *    El pequeño retraso (100ms) está incluido internamente para garantizar
 *    que localStorage se haya poblado correctamente tras la autenticación.
 */
export const useRoleGuard = (allowedRole: string) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      const userSessionRaw = localStorage.getItem('userSession');
      if (!userSessionRaw) {
        router.push('/auth/login');
        return;
      }

      let token: string;
      try {
        const session = JSON.parse(userSessionRaw);
        token = session.token;
        if (!token) throw new Error('Token ausente en la sesión');
      } catch {
        router.push('/auth/login');
        return;
      }

      try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('JWT inválido');

        const payloadBase64 = parts[1];
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(
          base64.length + ((4 - (base64.length % 4)) % 4),
          '='
        );
        const decoded = JSON.parse(atob(padded));
        const userRole = decoded.role;

        if (userRole !== allowedRole) {
          router.push('/unauthorized');
        }
      } catch {
        router.push('/auth/login');
      }
    }, STORAGE_DELAY);

    return () => clearTimeout(timer);
  }, [allowedRole, router]);
};
