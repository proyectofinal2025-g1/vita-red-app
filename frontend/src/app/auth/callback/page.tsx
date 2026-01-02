"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { loginWithToken } = useAuth();

  useEffect(() => {
    if (token) {
      loginWithToken(token);
      router.replace("/dashboard/patient");
    }
  }, [token]);

  return <p>Iniciando sesión...</p>;
}
