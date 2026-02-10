"use client";

import AppointmentsTable from "./components/AppointmentsTable";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { dataUser } = useAuth();

  function handleAttend(appointment: any) {
  router.push(
    `/dashboard/doctor/appointments/${appointment.id}/medical-record` +
    `?patientId=${appointment.patient.id}`
  )
}


  useEffect(() => {
    if (dataUser === undefined) return;

    if (!dataUser?.token) {
      router.push("/auth/login");
      return;
    }

    async function fetchAppointments() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/doctors/appointments/list`,
          {
            headers: {
              Authorization: `Bearer ${dataUser?.token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }

        const data = await res.json();

        const normalizedAppointments = (
          Array.isArray(data) ? data : (data.data ?? [])
        ).map((a: any) => ({
          ...a,
          status: a.status.toLowerCase(),
        }));

        setAppointments(normalizedAppointments);
      } catch (error) {
        console.error("Error cargando turnos", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [dataUser, router]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Mi Agenda🗓️</h2>
        <p className="text-slate-500">Turnos programados</p>
      </header>

      {loading ? (
        <p className="text-slate-500">Cargando turnos...</p>
      ) : (
        <AppointmentsTable
          appointments={appointments}
          onAttend={handleAttend}
        />
      )}
    </div>
  );
}
