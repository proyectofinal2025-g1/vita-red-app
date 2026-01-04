// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { decodeJWT } from '@/utils/decodeJWT';
import { getDashboardRoute } from '@/utils/getDashboardRoute';

export default function AuthCallback() {
  const { loginWithToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken(token);
      const payload = decodeJWT(token);
      if (payload?.role) {
        const route = getDashboardRoute(payload.role);
        router.push(route);
      } else {
        router.push('/auth/login');
      }
    } else {
      router.push('/auth/login');
    }
  }, [loginWithToken, router, searchParams]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4'></div>
        <p className='text-gray-700'>Autenticando...</p>
      </div>
    </div>
  );
}
