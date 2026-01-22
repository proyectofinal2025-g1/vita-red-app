'use client'

import Input from "../profile/components/Input"

interface Props {
  open: boolean
  onClose: () => void
  appointment: any
  onSubmit: (data: any) => void
}

export default function CreateMedicalRecordModal({
  open,
  onClose,
  appointment,
  onSubmit,
}: Props) {
  if (!open || !appointment) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)

    onSubmit({
      appointment_id: appointment.id,
      diagnosis: formData.get("diagnosis"),
      treatment: formData.get("treatment"),
      notes: formData.get("notes"),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4"
      >
        <h3 className="text-xl font-bold">
          Registro médico — {appointment.patient}
        </h3>

        <Input
        label="Motivo de la consulta"
        name="reason"
        required
        />

        <Input
          label="Diagnóstico"
          name="diagnosis"
          required
        />

        <Input
          label="Tratamiento"
          name="treatment"
          required
        />

        <Input
          label="Notas"
          name="notes"
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
