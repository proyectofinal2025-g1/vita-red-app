'use client'

import AppointmentForm from "@/components/AppointmentForm";
import { useRouter } from "next/navigation";

export default function NewAppointmentPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <AppointmentForm onClose={() => router.push("/dashboard/patient/appointments")} />
    </div>
  );
}
