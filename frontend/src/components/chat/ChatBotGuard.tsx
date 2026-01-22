"use client";

import { useAuth } from "@/contexts/AuthContext";
import ChatBot from "./ChatBot";

export default function ChatBotGuard() {
  const { dataUser, loading } = useAuth();

  // mientras carga auth, no renderizamos nada
  if (loading) return null;

  // no logueado → opcional (si querés ocultarlo)
  if (!dataUser) 
    return <ChatBot />;

  // SOLO pacientes
  if (dataUser.user.role !== "patient") return null;

  return <ChatBot />;
}
