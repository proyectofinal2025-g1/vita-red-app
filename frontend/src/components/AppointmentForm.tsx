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

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Sesión expirada");
      return;
    }

    getDoctorSchedules(selectedDoctor, token)
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

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctor);

  // 🔹 Flujo real de pago (solo se ejecuta si el usuario confirma)
  const proceedToPayment = async (
    date: string,
    time: string,
    token: string
  ) => {
    try {
      setIsSubmitting(true);

      const preReserve = await preReserveAppointment(
        {
          doctorId: selectedDoctor!,
          dateTime: `${date}T${time}:00`,
          specialtyId: specialities.find(
            (s) => s.name === selectedSpeciality
          )?.id,
        },
        token
      );

      const { initPoint } = await createPaymentPreference(
        preReserve.appointmentId,
        token
      );

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

  // 🔹 Submit con SweetAlert previo
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

    const price = selectedDoctorObj?.consultationPrice ?? 20000;
    console.log("Doctor seleccionado:", selectedDoctorObj);

    if (!price) {
      Swal.fire("Error", "No se pudo obtener el precio", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Confirmar pago",
      html: `
        <p>El precio de la consulta es:</p>
        <h2 style="margin-top:10px;">$${price}</h2>
        <p style="margin-top:10px;font-size:14px;">
          Serás redirigido a Mercado Pago
        </p>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Continuar con el pago",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      await proceedToPayment(selectedDate, time, token);
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

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 border border-gray-300 text-white py-2 rounded hover:bg-red-600 bg-red-500"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-1/2 bg-blue-500 text-white py-2 rounded disabled:opacity-50 hover:bg-blue-600"
        >
          {isSubmitting ? "Redirigiendo…" : "Confirmar turno"}
        </button>
      </div>
    </form>
  );
}
