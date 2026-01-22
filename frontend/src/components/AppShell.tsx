'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import ChatBotGuard from '@/components/chat/ChatBotGuard';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  return (
    <>
      <Navbar />

      {children}

      {!loading && <Footer />}
      {!loading && <ChatBotGuard />}
    </>
  );
}
