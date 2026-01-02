// src/hooks/useSessionTimer.ts
'use client';

import { useState, useEffect } from 'react';
import { decodeJWT } from '@/utils/decodeJWT';

const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hora = 3600000 ms

export const useSessionTimer = (token: string | null) => {
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_DURATION_MS);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setTimeLeft(0);
      setIsExpired(true);
      return;
    }

    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      setTimeLeft(0);
      setIsExpired(true);
      return;
    }

    const expiryTime = payload.exp * 1000; // exp en milisegundos
    const now = Date.now();
    let remaining = Math.max(0, expiryTime - now);

    // Si el token ya expiró
    if (remaining <= 0) {
      setIsExpired(true);
      setTimeLeft(0);
      return;
    }

    setTimeLeft(remaining);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  const percentage = Math.max(
    0,
    Math.min(100, (timeLeft / SESSION_DURATION_MS) * 100)
  );

  return { timeLeft, percentage, isExpired };
};
