"use client";

import { useState, useEffect } from "react";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserData {
  sub: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userSession = localStorage.getItem("userSession");
      
      if (!userSession) {
        throw new Error("No se encontró la sesión de usuario");
      }
      
      const session = JSON.parse(userSession);
      const token = session.token;
      
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }
      const response = await fetch(`${API_URL}/user/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }
        throw new Error("Error al cargar los datos del usuario");
      }

      const data = await response.json();
      setUserData(data);
      console.log("Datos del usuario:", data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const userSession = localStorage.getItem("userSession");
      
      if (!userSession) {
        throw new Error("No se encontró la sesión de usuario");
      }
      
      const session = JSON.parse(userSession);
      const token = session.token;
      
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }
      console.log("Enviando al backend:", formData);
      const response = await fetch(`${API_URL}/user/${userData?.sub}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }
        throw new Error("Error al actualizar los datos");
      }

      setUserData({
      ...userData,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
    } as UserData);
    setIsEditing(false);

    await fetchUserData();
    alert("Para ver impactados los cambios, por favor vuelve a iniciar sesión");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button
            onClick={fetchUserData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Mi Perfil</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            {isEditing ? (
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg text-gray-900">{userData?.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            {isEditing ? (
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg text-gray-900">{userData?.last_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg text-gray-900">{userData?.email}</p>
            )}
          </div>
          </div>

        <div className="mt-8 flex gap-4 justify-center">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Modificar
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}