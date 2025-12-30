"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { ISpeciality } from "@/interfaces/ISpeciality";
import { IDoctor } from "@/interfaces/IDoctor";

import { getAllSpecialityService } from "@/services/specialityServices";
import { getAllDoctorsService } from "@/services/doctorService";
import {
  getDoctorSchedules,
  preReserveAppointment,
  generateTimeSlots,
} from "@/services/appointmentService";
import { createPaymentPreference } from "@/services/paymentService";

import {
  isWeekend,
  getDayOfWeekAsNumber,
  getMinDateForAppointment,
  isWithin24Hours,
} from "@/utils/dateUtils";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("userSession");
  if (!session) return null;
  try {
    return JSON.parse(session).token ?? null;
  } catch {
    return null;
  }
};

export default function AppointmentForm({ onClose }: { onClose: () => void }) {
  const [specialities, setSpecialities] = useState<ISpeciality[]>([]);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);

  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Especialidades
  useEffect(() => {
    getAllSpecialityService()
      .then((data) => setSpecialities(data.filter((s) => s.isActive)))
      .catch(console.error);
  }, []);

  // 🔹 Doctores por especialidad
  useEffect(() => {
    if (!selectedSpeciality) {
      setDoctors([]);
      setSelectedDoctor(null);
      return;
    }

    setLoadingDoctors(true);

    getAllDoctorsService()
      .then((allDoctors) => {
        setDoctors(
          allDoctors.filter((d) => d.speciality === selectedSpeciality)
        );
      })
      .finally(() => setLoadingDoctors(false));
  }, [selectedSpeciality]);

  // 🔹 Horarios disponibles
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setAvailableTimes([]);
      return;
    }

    if (isWeekend(selectedDate)) {
      setAvailableTimes([]);
      setErrorMessage("No se atiende los fines de semana");
      return;
    }

    setLoadingTimes(true);
    setErrorMessage(null);

    getDoctorSchedules(selectedDoctor)
      .then((schedules) => {
        const date = new Date(`${selectedDate}T00:00:00`);
        const dayOfWeek = getDayOfWeekAsNumber(date);
        const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);

        if (!schedule) {
          setAvailableTimes([]);
          setErrorMessage("No hay horarios disponibles");
          return;
        }

        setAvailableTimes(
          generateTimeSlots(
            schedule.startTime,
            schedule.endTime,
            schedule.slotDuration
          )
        );
      })
      .catch(() => {
        setAvailableTimes([]);
        setErrorMessage("Error al cargar horarios");
      })
      .finally(() => setLoadingTimes(false));
  }, [selectedDoctor, selectedDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const time = formData.get("time") as string;

    if (!selectedDoctor || !selectedDate || !time) {
      Swal.fire("Campos incompletos", "Completa todos los campos", "warning");
      return;
    }

    if (isWithin24Hours(selectedDate, time)) {
      Swal.fire(
        "Anticipación insuficiente",
        "Debes agendar con al menos 24hs",
        "warning"
      );
      return;
    }

    const token = getAuthToken();
    if (!token) {
      Swal.fire("Sesión expirada", "Inicia sesión nuevamente", "warning").then(
        () => (window.location.href = "/auth/login")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      //  Pre-reservar turno
      const preReserve = await preReserveAppointment(
        {
          doctorId: selectedDoctor,
          dateTime: `${selectedDate}T${time}:00`,
          specialtyId: specialities.find((s) => s.name === selectedSpeciality)
            ?.id,
        },
        token
      );

      // Crear preference de pago
      const { initPoint } = await createPaymentPreference(
        preReserve.appointmentId,
        token
      );

      //  Redirigir a Mercado Pago
      window.location.href = initPoint;
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.message || "No se pudo iniciar el pago",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Agenda tu cita</h2>

      {/* Especialidad */}
      <select
        value={selectedSpeciality}
        onChange={(e) => setSelectedSpeciality(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
      >
        <option value="">Selecciona especialidad</option>
        {specialities.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Médico */}
      {selectedSpeciality && (
        <select
          value={selectedDoctor ?? ""}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        >
          <option value="">Selecciona médico</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName}
            </option>
          ))}
        </select>
      )}

      {/* Fecha */}
      {selectedDoctor && (
        <input
          type="date"
          min={getMinDateForAppointment()}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />
      )}

      {/* Hora */}
      {selectedDoctor && selectedDate && (
        <select name="time" className="w-full p-2 border rounded mb-4" required>
          <option value="">Selecciona hora</option>
          {availableTimes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {isSubmitting ? "Redirigiendo…" : "Confirmar turno"}
      </button>
    </form>
  );
}
