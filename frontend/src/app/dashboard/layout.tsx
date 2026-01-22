"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dataUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !dataUser) {
      router.push("/auth/login");
    }
  }, [loading, dataUser, router]);

  if (loading) return null;

  if (!dataUser) return null;

  return <>{children}</>;
}
