"use client";

import Swal from "sweetalert2";
import { cancelAppointmentService } from "@/services/appointmentService";

interface AppointmentCardProps {
  appointment: {
    id: string;
    date: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    price: number;
    reason?: string;
    speciality?: {
      name: string;
    };
    doctor: {
      fullName: string;
    };
  };
  token: string;
  onCancelSuccess: (appointmentId: string) => void;
}

export default function AppointmentCard({
  appointment,
  token,
  onCancelSuccess,
}: AppointmentCardProps) {
  const normalizedStatus = appointment.status.toUpperCase();

  const canCancel =
    normalizedStatus === "PENDING" || normalizedStatus === "CONFIRMED";

  const handleCancelAppointment = async () => {
    const result = await Swal.fire({
      title: "Cancelar turno",
      text: "Estás por cancelar este turno. ¿Deseas continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancelar turno",
      cancelButtonText: "Volver atrás",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      await cancelAppointmentService(appointment.id, token);

      if (normalizedStatus === "CONFIRMED") {
        Swal.fire({
          title: "Turno cancelado",
          text: "En breve nos comunicaremos con usted para hacer el reintegro.",
          icon: "info",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire(
          "Turno cancelado",
          "El turno fue cancelado correctamente.",
          "success"
        );
      }

      onCancelSuccess(appointment.id);
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.message || "No se pudo cancelar el turno",
        "error"
      );
    }
  };

  return (
    <div className="relative rounded-2xl bg-white px-6 py-5 shadow-md transition hover:shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-sm text-gray-600">
          {appointment.speciality?.name ?? "Consulta médica"}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            normalizedStatus === "CONFIRMED"
              ? "text-green-600"
              : normalizedStatus === "CANCELLED"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {normalizedStatus}
        </span>
      </div>

      <p className="text-lg font-semibold text-gray-800 mt-1">
        Médico: {appointment.doctor.fullName}
      </p>

      <p className="text-sm font-medium text-gray-500">
        Fecha: {new Date(appointment.date).toLocaleDateString()}{" "}
      </p>
      
      <p className="text-sm font-medium text-gray-500">
        Hora: {new Date(appointment.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <p className="mt-2 text-sm text-gray-400">Precio: ${appointment.price}</p>

      {appointment.reason && (
        <p className="text-sm text-gray-400">Motivo: {appointment.reason}</p>
      )}

      {canCancel && (
        <button
          onClick={handleCancelAppointment}
          className="mt-4 rounded bg-red-500 px-4 py-1 text-sm text-white hover:bg-red-600"
        >
          Cancelar turno
        </button>
      )}
    </div>
  );
}
