'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ padding: 40 }}>
      <h1>✅ Pago realizado con éxito</h1>
      <p>Estamos confirmando tu turno…</p>
    </div>
  );
}
