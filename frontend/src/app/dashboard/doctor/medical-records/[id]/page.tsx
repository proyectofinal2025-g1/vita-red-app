'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Swal from "sweetalert2"

export default function MedicalRecordDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/auth/login")
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-record/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => setRecord(data))
      .catch(() =>
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar el registro médico",
        })
      )
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (!record) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">
          Registro médico
        </h2>
        <p className="text-slate-500">
          Paciente: {record.patient.first_name} {record.patient.last_name}
        </p>
      </header>

      <p className="text-slate-400 text-sm">
        Fecha: {new Date(record.created_at).toLocaleDateString()}
      </p>

      <section className="bg-white rounded-2xl p-6 border space-y-4">
        <div>
          <h4 className="font-semibold">Motivo de consulta</h4>
          <p className="text-slate-600">{record.reason}</p>
        </div>

        <div>
          <h4 className="font-semibold">Diagnóstico</h4>
          <p className="text-slate-600">{record.diagnosis}</p>
        </div>

        <div>
          <h4 className="font-semibold">Tratamiento</h4>
          <p className="text-slate-600">{record.treatment}</p>
        </div>

        {record.notes && (
          <div>
            <h4 className="font-semibold">Notas</h4>
            <p className="text-slate-600">{record.notes}</p>
          </div>
        )}
      </section>

      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline"
      >
        ← Volver
      </button>
    </div>
  )
}
