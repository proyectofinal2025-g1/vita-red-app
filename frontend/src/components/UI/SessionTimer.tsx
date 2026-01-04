// src/components/UI/SessionTimer.tsx
'use client';

import { useSessionTimer } from '@/hooks/useSessionTimer';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import Swal from 'sweetalert2';

const SessionTimer = () => {
  const { dataUser, logout } = useAuth();
  const token = dataUser?.token || null;

  // ✅ Memoizamos la función de expiración
  const handleSessionExpire = useCallback(() => {
    logout(); // Limpia el contexto y localStorage

    // Solo mostramos el modal si estamos en el navegador
    if (typeof window !== 'undefined') {
      Swal.fire({
        title: 'Sesión expirada',
        text: 'Inicia sesión nuevamente',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        window.location.href = '/auth/login';
      });
    }
  }, [logout]); // logout es estable (proviene del contexto)

  // ✅ Pasamos la función memoizada
  const { timeLeft } = useSessionTimer(token, handleSessionExpire);

  if (!token || timeLeft <= 0) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60_000);
  const seconds = Math.floor((timeLeft % 60_000) / 1000);

  let textColor = 'text-green-600';
  if (minutes < 10) {
    textColor = 'text-red-600';
  } else if (minutes < 20) {
    textColor = 'text-orange-600';
  }

  return (
    <span className={`text-sm font-bold ml-2 tabular-nums ${textColor}`}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};

export default SessionTimer;
