"use client"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Swal from "sweetalert2"
import { useAuth } from "@/contexts/AuthContext"

export default function MedicalRecordPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { dataUser } = useAuth()

  const appointmentId = Array.isArray(id) ? id[0] : id
  const patientId = searchParams.get("patientId")

  const [saving, setSaving] = useState(false)

  const [reason, setReason] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [treatment, setTreatment] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!dataUser?.token || !dataUser.user?.id) {
      router.push("/auth/login")
      return
    }

    if (!patientId) {
      Swal.fire("Error", "Paciente no encontrado", "error")
      return
    }

    setSaving(true)

    try {
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-record`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dataUser.token}`,
          },
          body: JSON.stringify({
            appointment_id: appointmentId,
            patient_id: patientId,
            doctor_id: dataUser.user.id,
            reason,
            diagnosis,
            treatment,
            notes,
          }),
        }
      )

      if (!res.ok) throw new Error("Error al guardar")

      await Swal.fire({
        icon: "success",
        title: "Consulta registrada",
        timer: 1500,
        showConfirmButton: false,
      })

      router.push("/dashboard/doctor/appointments")
    } catch (error) {
      console.error(error)
      Swal.fire("Error", "No se pudo guardar el registro", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-800">
          Registrar consulta
        </h2>
        <p className="text-sm text-slate-500">
          Completar información clínica 📝
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border p-6 shadow-sm space-y-4"
      >
        <input
          placeholder="Motivo de consulta"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="w-full rounded-xl border bg-slate-50 p-3 text-sm"
        />

        <textarea
          placeholder="Diagnóstico"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          required
          className="w-full h-24 rounded-xl border bg-slate-50 p-3 text-sm"
        />

        <textarea
          placeholder="Tratamiento"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          required
          className="w-full h-24 rounded-xl border bg-slate-50 p-3 text-sm"
        />

        <textarea
          placeholder="Notas adicionales (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-24 rounded-xl border bg-slate-50 p-3 text-sm"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  )
}
