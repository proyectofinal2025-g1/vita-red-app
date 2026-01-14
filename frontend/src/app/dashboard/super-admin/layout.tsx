// frontend/src/app/dashboard/super-admin/layout.tsx

import React from 'react';
import { redirect } from 'next/navigation';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      <main className='flex-1 p-6'>{children}</main>
    </div>
  );
}
