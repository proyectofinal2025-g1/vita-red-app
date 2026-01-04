// src/hooks/useSessionTimer.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { decodeJWT } from '@/utils/decodeJWT';

export const useSessionTimer = (
  token: string | null,
  onExpire?: () => void
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const hasExpired = useRef(false);

  useEffect(() => {
    hasExpired.current = false; // Reset al cambiar el token

    if (!token) {
      if (!hasExpired.current) {
        hasExpired.current = true;
        onExpire?.();
      }
      return;
    }

    const payload = decodeJWT(token);
    if (!payload || typeof payload.exp !== 'number') {
      if (!hasExpired.current) {
        hasExpired.current = true;
        onExpire?.();
      }
      return;
    }


    const expiryTime = payload.exp * 1000;
    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setTimeLeft(0);
        if (!hasExpired.current) {
          hasExpired.current = true;
          onExpire?.();
        }
        return false;
      } else {
        setTimeLeft(remaining);
        return true;
      }
    };

    const continueTimer = updateTimer();
    if (!continueTimer) return;

    const interval = setInterval(() => {
      const shouldContinue = updateTimer();
      if (!shouldContinue) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token]); // 👈 ¡Solo depende de token!

  return { timeLeft };
};
