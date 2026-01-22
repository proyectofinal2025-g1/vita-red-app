'use client'

import { useEffect, useState } from "react"
import Input from "./components/Input"
import Swal from "sweetalert2"

const EMPTY_DOCTOR = {
  first_name: "",
  last_name: "",
  email: "",
  dni: "",
  speciality_id: "",
  licence_number: "",
  photo: "",
}

export default function DoctorProfilePage() {
  const [form, setForm] = useState(EMPTY_DOCTOR)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    async function fetchDoctor() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/doctors/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) throw new Error()

        const data = await res.json()
        setForm(data)
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los datos del perfil",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [])

  async function handlePhotoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    const formData = new FormData()
    formData.append("file", file)
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!
    )

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()

      setForm(prev => ({
        ...prev,
        photo: data.secure_url,
      }))

      const token = localStorage.getItem("token")

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/me/avatar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avatar: data.secure_url,
          }),
        }
      )

      Swal.fire({
        icon: "success",
        title: "Foto actualizada",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo subir la imagen",
      })
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem("token")

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            specialty: form.speciality_id,
            licence_number: form.licence_number,
          }),
        }
      )

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Los cambios se guardaron correctamente",
      })
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar los cambios",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">
          Mi Perfil👤
        </h2>
        <p className="text-slate-500">
          Datos personales del médico
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-indigo-50 rounded-2xl p-6 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-6">
          {preview || form.photo ? (
            <img
              src={preview || form.photo}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
            />
          ) : (
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-semibold">
              {form.first_name[0]}
              {form.last_name[0]}
            </div>
          )}

          <label className="cursor-pointer rounded-lg border px-4 py-2 text-sm">
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre" name="first_name" value={form.first_name} onChange={handleChange} />
          <Input label="Apellido" name="last_name" value={form.last_name} onChange={handleChange} />
        </div>

        <Input label="Email" name="email" value={form.email} onChange={handleChange} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="DNI" name="dni" value={form.dni} disabled />
          <Input label="Especialidad" name="specialty" value={form.speciality_id} onChange={handleChange} />
        </div>

        <Input
          label="Matrícula"
          name="licence_number"
          value={form.licence_number}
          onChange={handleChange}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}
