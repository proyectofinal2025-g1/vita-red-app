"use client";

import { useEffect, useState } from "react";
import { Appointment } from "../types";
import { useAuth } from "@/contexts/AuthContext";
import AppointmentCard from "./AppointmentCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { dataUser } = useAuth();
  const token = dataUser?.token;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!token) {
          setError("Usuario no autenticado");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/appointments/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los turnos");
        }

        const data: Appointment[] = await response.json();
        setAppointments(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  const handleCancelSuccess = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...a, status: "CANCELLED" } : a
      )
    );
  };

  if (loading) {
    return (
      <p className="mt-10 text-center text-gray-500">Cargando turnos...</p>
    );
  }

  if (error) {
    return <p className="mt-10 text-center text-red-500">{error}</p>;
  }

  if (appointments.length === 0) {
    return (
      <p className="mt-10 text-center text-gray-500">
        No tienes ningún turno
      </p>
    );
  }

  return (
    <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-6">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          token={token!}
          onCancelSuccess={handleCancelSuccess}
        />
      ))}
    </div>
  );
}
