'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Swal from "sweetalert2"

export default function MedicalRecordPage() {
  const { id } = useParams()
  const router = useRouter()

  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-record`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            appointment_id: id,
            notes,
          }),
        }
      )

      if (!res.ok) throw new Error()

      Swal.fire({
        icon: "success",
        title: "Consulta registrada",
        timer: 1500,
        showConfirmButton: false,
      })

      router.push("/dashboard/doctor/appointments")
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el registro",
      })
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
          Detalles de la atención médica 📝
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border p-6 shadow-sm space-y-4"
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas médicas..."
          className="w-full h-40 rounded-xl border bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
