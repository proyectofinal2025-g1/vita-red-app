// src/components/UI/SessionTimer.tsx
'use client';

import { useSessionTimer } from '@/hooks/useSessionTimer';
import { useAuth } from '@/contexts/AuthContext';

const SessionTimer = () => {
  const { dataUser } = useAuth();
  const token = dataUser?.token || null;
  const { percentage, timeLeft } = useSessionTimer(token);

  if (!token) return null;

  // Determinar color del texto según porcentaje
  let textColor = 'text-green-600';
  if (percentage < 33) textColor = 'text-red-600';
  else if (percentage < 66) textColor = 'text-orange-600';

  const minutes = Math.floor(timeLeft / 60_000);
  const seconds = Math.floor((timeLeft % 60_000) / 1000);

  return (
    <span className={`text-sm font-bold ml-2 tabular-nums ${textColor}`}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};

export default SessionTimer;
