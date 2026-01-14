"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profileImageUrl?: string;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarFileRef = useRef<File | null>(null);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const getToken = () => {
    const session = localStorage.getItem("userSession");
    if (!session) throw new Error("Sin sesión");
    const parsed = JSON.parse(session);
    return parsed.token;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
  try {
    const session = localStorage.getItem("userSession");

    if (!session) {
      setLoading(false);
      return;
    }

    const parsedSession = JSON.parse(session);
    const token = parsedSession?.token;

    if (!token) {
      setLoading(false);
      return;
    }

    const res = await fetch(`${API_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error("SESSION_EXPIRED");
    }

    if (!res.ok) {
      throw new Error("API_ERROR");
    }

    const data = await res.json();

    setUserData(data);
    setAvatarPreview(data.profileImageUrl || null);
    setFormData({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
    });
  } catch (err: any) {
    console.error("fetchUser error:", err);

    if (err.message === "SESSION_EXPIRED") {
      Swal.fire({
        title: "Sesión expirada",
        text: "Por favor iniciá sesión nuevamente",
        icon: "warning",
        confirmButtonText: "Ir a login",
      }).then(() => {
        localStorage.removeItem("userSession");
        window.location.href = "/auth/login";
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar el perfil. Intente nuevamente.",
        icon: "error",
      });
    }
  } finally {
    setLoading(false);
  }
};

  const handleAvatarClick = async () => {
    const result = await Swal.fire({
      title: "¿Cambiar foto de perfil?",
      text: "Se reemplazará tu imagen actual",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    avatarFileRef.current = file;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!avatarFileRef.current) return;

    const token = getToken();
    const form = new FormData();
    form.append("file", avatarFileRef.current);

    await fetch(`${API_URL}/user/me/avatar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    avatarFileRef.current = null;
    await fetchUser();
  };

  const handleSaveAll = async () => {
    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Se actualizarán tus datos de perfil",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      const token = getToken();

      setFieldErrors({});

      if (showPasswordFields) {
        let hasError = false;
        const errors: {
          currentPassword?: string;
          password?: string;
          confirmPassword?: string;
        } = {};

        if (!passwordData.currentPassword) {
          errors.currentPassword = "Ingresá tu contraseña actual";
          hasError = true;
        }

        if (!passwordData.password) {
          errors.password = "Ingresá una nueva contraseña";
          hasError = true;
        }

        if (passwordData.password !== passwordData.confirmPassword) {
          errors.confirmPassword = "Las contraseñas no coinciden";
          hasError = true;
        }

        if (hasError) {
          setFieldErrors(errors);
          setSaving(false);
          return;
        }
      }

      const res = await fetch(`${API_URL}/user/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar perfil");
      }

      if (showPasswordFields) {
        if (!userData?.id) {
          throw new Error("No se pudo identificar el usuario");
        }

        if (showPasswordFields) {
          if (!passwordData.currentPassword) {
            setFieldErrors({ currentPassword: "Ingresá tu contraseña actual" });
            throw new Error("Validación");
          }

          if (passwordData.password !== passwordData.confirmPassword) {
            setFieldErrors({ confirmPassword: "Las contraseñas no coinciden" });
            throw new Error("Validación");
          }
        }

        const resPassword = await fetch(
          `${API_URL}/user/${userData.id}/password`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              currentPassword: passwordData.currentPassword,
              newPassword: passwordData.password,
            }),
          }
        );

        if (!resPassword.ok) {
          let message = "Error al actualizar la contraseña";

          try {
            const errorBody = await resPassword.json();

            if (typeof errorBody?.message === "string") {
              message = errorBody.message;

              if (message.toLowerCase().includes("contraseña")) {
                setFieldErrors({
                  currentPassword: message,
                });
              }
            }
          } catch {}

          throw new Error(message);
        }
      }

      setIsEditing(false);
      setShowPasswordFields(false);
      setPasswordData({
        password: "",
        confirmPassword: "",
        currentPassword: "",
      });
      setShowPassword(false);
      setShowConfirmPassword(false);

      Swal.fire({
        title: "Perfil actualizado",
        text: "Por favor iniciá sesión nuevamente para ver los cambios",
        icon: "success",
        confirmButtonText: "Ir a login",
      }).then(() => {
        localStorage.removeItem("userSession");
        window.location.href = "/auth/login";
      });
    } catch (e: any) {
      Swal.fire("Error", e.message || "Error al guardar cambios", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  const hasProfileChanges =
    userData &&
    (formData.first_name !== userData.first_name ||
      formData.last_name !== userData.last_name ||
      formData.email !== userData.email);

  const hasPasswordChanges =
    showPasswordFields &&
    passwordData.currentPassword &&
    passwordData.password &&
    passwordData.confirmPassword;

  const canSave = hasProfileChanges || hasPasswordChanges;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Mi Perfil</h1>

        {/* AVATAR */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-3xl">
                  👤
                </div>
              )}
            </div>

            {isEditing && (
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-white border border-gray-300 p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-4 h-4 text-black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 3.487a2.121 2.121 0 0 1 3 3L7.5 18.848l-4.5 1 1-4.5L16.862 3.487Z"
                  />
                </svg>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {avatarFileRef.current && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSaveAvatar}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Guardar foto
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block mb-1">Nombre:</label>
            {isEditing ? (
              <input
                name="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-xl"
              />
            ) : (
              <p>{userData?.first_name}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Apellido:</label>
            {isEditing ? (
              <input
                name="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-xl"
              />
            ) : (
              <p>{userData?.last_name}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Email:</label>
            {isEditing ? (
              <input
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-xl"
              />
            ) : (
              <p>{userData?.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Contraseña:</label>
            <div className="flex justify-between items-center">
              <span>********</span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="text-blue-600 text-sm"
                >
                  Cambiar
                </button>
              )}
            </div>
          </div>

          {showPasswordFields && (
            <>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña actual
                </label>

                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      });
                      setFieldErrors((prev) => ({
                        ...prev,
                        currentPassword: undefined,
                      }));
                    }}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none ${
                      fieldErrors.currentPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                  />

                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5-1.292 4.338-5.31 7.5-10.066 7.5-1.225 0-2.41-.177-3.537-.506M6.228 6.228 3.5 3.5m2.728 2.728 14.002 14.002M18.364 18.364l-2.728-2.728"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322C3.423 7.51 7.36 4.5 12 4.5s8.573 3.01 9.964 7.178C20.577 16.49 16.64 19.5 12 19.5S3.423 16.49 2.036 12.322Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {fieldErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* Nueva contraseña */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwordData.password}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        password: e.target.value,
                      });
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none ${
                      fieldErrors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                  />

                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5-1.292 4.338-5.31 7.5-10.066 7.5-1.225 0-2.41-.177-3.537-.506M6.228 6.228 3.5 3.5m2.728 2.728 14.002 14.002M18.364 18.364l-2.728-2.728"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322C3.423 7.51 7.36 4.5 12 4.5s8.573 3.01 9.964 7.178C20.577 16.49 16.64 19.5 12 19.5S3.423 16.49 2.036 12.322Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      });
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none ${
                      fieldErrors.confirmPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                  />

                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5-1.292 4.338-5.31 7.5-10.066 7.5-1.225 0-2.41-.177-3.537-.506M6.228 6.228 3.5 3.5m2.728 2.728 14.002 14.002M18.364 18.364l-2.728-2.728"
                        />
                      </svg>
                    ) : (
                      /* OJO */
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322C3.423 7.51 7.36 4.5 12 4.5s8.573 3.01 9.964 7.178C20.577 16.49 16.64 19.5 12 19.5S3.423 16.49 2.036 12.322Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          {!isEditing ? (
            <button
              onClick={() => {
                setIsEditing(true);
                setShowPasswordFields(false);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Modificar
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className={`px-6 py-2 text-white rounded ${
                  !canSave || saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600"
                }`}
              >
                Guardar
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowPasswordFields(false);
                  setPasswordData({
                    password: "",
                    confirmPassword: "",
                    currentPassword: "",
                  });
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded"
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
