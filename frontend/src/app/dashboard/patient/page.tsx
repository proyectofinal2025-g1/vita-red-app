"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PatientDashboardHome() {
  const [firstName, setFirstName] = useState("Paciente");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = localStorage.getItem("userSession");
        if (!session) return;

        const token = JSON.parse(session).token;

        const res = await fetch(`${API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error cargando usuario");

        const data = await res.json();

        if (data.first_name) {
          setFirstName(data.first_name.split(" ")[0]);
        }

        if (data.profileImageUrl) {
          setAvatar(data.profileImageUrl);
        }
      } catch (error) {
        console.error("Error cargando usuario:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div
              onClick={() => avatar && setShowModal(true)}
              className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-5 overflow-hidden cursor-pointer hover:opacity-90 transition"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              ¡Hola {firstName}! <span className="inline-block">👋🏻</span>
            </h1>

            <p className="text-sm text-gray-500 text-center">
              Bienvenid@ a tu panel de paciente
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/dashboard/patient/appointments"
              className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-md"
            >
              Mis turnos
            </Link>

            <Link
              href="/dashboard/patient/profile"
              className="flex-1 text-center px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-md"
            >
              Mis datos
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl p-4 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={avatar!}
              alt="Avatar grande"
              className="w-full h-auto rounded-lg"
            />

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
