import React from 'react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen '>
      <main className='flex-1 p-6'>{children}</main>
    </div>
  );
}
