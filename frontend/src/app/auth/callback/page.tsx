import { Suspense } from 'react';
import AuthCallback from './AuthCallback';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando…</div>}>
      <AuthCallback />
    </Suspense>
  );
}
