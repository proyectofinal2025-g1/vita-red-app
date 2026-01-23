'use client'

import { useEffect, useState } from "react"
import Input from "./components/Input"
import Swal from "sweetalert2"
import { useAuth } from "@/contexts/AuthContext"

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
  const { dataUser, refreshUser } = useAuth()
  const [specialityName, setSpecialityName] = useState("")

  useEffect(() => {
    if (!dataUser?.token) {
      setLoading(false)
      return
    }

    async function fetchDoctor() {
      try {
        const doctorRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/doctors/me`,
          {
            headers: {
              Authorization: `Bearer ${dataUser?.token}`,
            },
          }
        )

        if (!doctorRes.ok) throw new Error()
        const doctorData = await doctorRes.json()

        const specRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/speciality`
        )
        const specJson = await specRes.json()
        const specArray = specJson.data ?? specJson

        const specName =
          specArray.find(
            (s: any) => s.id === doctorData.speciality_id
          )?.name ?? ""

        setSpecialityName(specName)

        setForm({
          first_name: dataUser?.user.first_name ?? "",
          last_name: dataUser?.user.last_name ?? "",
          email: dataUser?.user.email ?? "",
          dni: dataUser?.user.dni ?? "",
          speciality_id: doctorData.speciality_id ?? "",
          licence_number: doctorData.licence_number ?? "",
          photo: dataUser?.user.profileImageUrl ?? "",
        })
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
  }, [dataUser])

async function handlePhotoUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0]
  if (!file || !dataUser?.token) return

  const localPreview = URL.createObjectURL(file)
  setPreview(localPreview)

  const formData = new FormData()
  formData.append('file', file)

  console.log('Enviando archivo:', file.name, file.size, file.type)

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/me/avatar`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${dataUser.token}`,
        },
        body: formData,
      }
    )

    const responseText = await res.text()
    console.log('Respuesta del servidor:', responseText)

    if (!res.ok) {
      throw new Error(`Backend rechazó la imagen: ${responseText}`)
    }

    await refreshUser()

    Swal.fire({
      icon: "success",
      title: "Foto actualizada",
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error) {
    console.error(error)

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
      if (!dataUser?.token) throw new Error()

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${dataUser.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
          }),
        }
      )

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Los cambios se guardaron correctamente, para visualizarlos vuelve a iniciar sesión.",
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

  if (loading) {
    return (
      <p className="text-center text-slate-500 mt-10">
        Cargando perfil...
      </p>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">
          🧑🏻‍⚕️ Mi Perfil
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
          <Input label="Especialidad" name="specialty" value={specialityName} disabled />
        </div>

        <Input
          label="Matrícula"
          name="licence_number"
          value={form.licence_number}
          disabled
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
