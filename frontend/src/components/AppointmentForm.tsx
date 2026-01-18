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
import { getDoctorAvailability } from "@/services/doctorAppointmentsService";

import {
  getDayOfWeekAsNumber,
  getMinDateForAppointment,
  isWithin24Hours,
} from "@/utils/dateUtils";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

/* ===================== AUTH ===================== */
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [availableTimes, setAvailableTimes] = useState<
    { time: string; occupied: boolean }[]
  >([]);
  const [doctorAvailableDays, setDoctorAvailableDays] = useState<number[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshAvailability, setRefreshAvailability] = useState(0);

  /* ===================== ESPECIALIDADES ===================== */
  useEffect(() => {
    getAllSpecialityService()
      .then((data) => setSpecialities(data.filter((s) => s.isActive)))
      .catch(console.error);
  }, []);

  /* ===================== DOCTORES ===================== */
  useEffect(() => {
    if (!selectedSpeciality) {
      setDoctors([]);
      setSelectedDoctor(null);
      return;
    }

    getAllDoctorsService().then((allDoctors) => {
      setDoctors(allDoctors.filter((d) => d.speciality === selectedSpeciality));
    });
  }, [selectedSpeciality]);

  /* ===================== DÍAS QUE ATIENDE EL MÉDICO ===================== */
  useEffect(() => {
    if (!selectedDoctor) {
      setDoctorAvailableDays([]);
      setSelectedDate(null);
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    getDoctorSchedules(selectedDoctor, token).then((schedules) => {
      setDoctorAvailableDays(schedules.map((s) => s.dayOfWeek));
      setSelectedDate(null);
    });
  }, [selectedDoctor]);

  /* ===================== HORARIOS DISPONIBLES ===================== */
  useEffect(() => {
    const loadTimes = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableTimes([]);
        return;
      }

      const token = getAuthToken();
      if (!token) return;

      const formattedDate = [
        selectedDate.getFullYear(),
        String(selectedDate.getMonth() + 1).padStart(2, "0"),
        String(selectedDate.getDate()).padStart(2, "0"),
      ].join("-");

      const dayOfWeek = getDayOfWeekAsNumber(selectedDate);

      /* 1️⃣ Horario laboral del médico */
      const schedules = await getDoctorSchedules(selectedDoctor, token);
      const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);

      if (!schedule) {
        setAvailableTimes([]);
        return;
      }

      /* 2️⃣ Slots teóricos */
      const allSlots = generateTimeSlots(
        schedule.startTime,
        schedule.endTime,
        schedule.slotDuration,
      );

      /* 3️⃣ Horarios ocupados (ENDPOINT NUEVO) */
      const { occupiedTimes } = await getDoctorAvailability(
        selectedDoctor,
        formattedDate,
        token,
      );

      /* 4️⃣ Filtrado final */
      const slotsWithStatus = allSlots.map((slot) => ({
        time: slot,
        occupied: occupiedTimes.includes(slot),
      }));

      setAvailableTimes(slotsWithStatus);
    };

    loadTimes();
  }, [selectedDoctor, selectedDate, refreshAvailability]);

  /* ===================== FILTRO CALENDARIO ===================== */
  const isDoctorAvailableDay = (date: Date) => {
    return doctorAvailableDays.includes(date.getDay());
  };

  /* ===================== SUBMIT ===================== */
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
        "warning",
      );
      return;
    }

    const token = getAuthToken();
    if (!token) {
      Swal.fire("Sesión expirada", "Inicia sesión nuevamente", "warning");
      return;
    }

    try {
      setIsSubmitting(true);

      const formattedDate = [
        selectedDate.getFullYear(),
        String(selectedDate.getMonth() + 1).padStart(2, "0"),
        String(selectedDate.getDate()).padStart(2, "0"),
      ].join("-");

      const preReserve = await preReserveAppointment(
        {
          doctorId: selectedDoctor,
          dateTime: `${formattedDate}T${time}:00`,
          specialtyId: specialities.find((s) => s.name === selectedSpeciality)
            ?.id,
        },
        token,
      );

      setAvailableTimes((prev) =>
        prev.map((slot) =>
          slot.time === time ? { ...slot, occupied: true } : slot,
        ),
      );
      setRefreshAvailability((prev) => prev + 1);

      const result = await Swal.fire({
        title: "Confirmar pago",
        html: `
          <p>El precio de la consulta es:</p>
          <h2>$${preReserve.price}</h2>
          <p>Serás redirigido a Mercado Pago</p>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Continuar con el pago",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      const { initPoint } = await createPaymentPreference(
        preReserve.appointmentId,
        token,
      );

      window.location.href = initPoint;
    } catch (error: any) {
      Swal.fire("Error", error.message || "Error al iniciar pago", "error");
      setIsSubmitting(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Agenda tu cita</h2>

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

      {selectedDoctor && (
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          minDate={new Date(getMinDateForAppointment())}
          filterDate={isDoctorAvailableDay}
          locale={es}
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecciona una fecha"
          className="w-full p-2 border rounded mb-3"
          required
        />
      )}

      {selectedDoctor && selectedDate && (
        <>
          <p className="text-sm text-gray-500 mb-2">
            <span className="text-red-500 line-through">Horario ocupado</span> -
            <span className="ml-2 text-green-500">Horario disponible</span>
          </p>

          <select
            name="time"
            className="w-full p-2 border rounded mb-4 "
            required
          >
            <option value="">Selecciona hora</option>

            {availableTimes.map(({ time, occupied }) => (
              <option
                key={time}
                value={time}
                disabled={occupied}
                className={occupied ? "text-red-500 line-through" : "text-green-500"}
              >
                {time} {occupied ? "— Ocupado" : ""}
              </option>
            ))}
          </select>
        </>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 bg-red-500 text-white py-2 rounded"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-1/2 bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Redirigiendo…" : "Confirmar turno"}
        </button>
      </div>
    </form>
  );
}
