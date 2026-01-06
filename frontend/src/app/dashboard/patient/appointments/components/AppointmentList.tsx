"use client";

import { useEffect, useState } from "react";
import { Appointment } from "../types";
import { useAuth } from "@/contexts/AuthContext";

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
      <p className="mt-10 text-center text-gray-500">No tienes ningún turno</p>
    );
  }

  return (
    <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-6">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="relative rounded-2xl bg-white px-6 py-5 shadow-md transition hover:shadow-lg"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-gray-600">
              {appointment.speciality?.name ?? "Consulta médica"}
            </h3>

            <span
              className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                appointment.status === "CONFIRMED"
                  ? "text-green-600"
                  : appointment.status === "CANCELLED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {appointment.status}
            </span>
          </div>

          <p className="text-lg font-semibold text-gray-800">
            Médico: {appointment.doctor.fullName}
          </p>

          <p className="text-sm font-medium text-gray-500">
            Fecha: {new Date(appointment.date).toLocaleDateString()}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Precio: ${appointment.price}
          </p>

          {appointment.reason && (
            <p className="text-sm text-gray-400">
              Motivo: {appointment.reason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
