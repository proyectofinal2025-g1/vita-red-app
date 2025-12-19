"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-sky-100 to-blue-200 text-blue-900 px-6 text-center">
      {/* Emoji principal */}
      <div className="text-7xl mb-6 animate-bounce">🩺</div>

      <h1 className="text-6xl font-extrabold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">
        Ups… esta página no pasó por admisión
      </h2>

      <p className="max-w-md text-blue-800 mb-8">
        Revisamos la historia clínica, buscamos en todos los consultorios… pero
        esta página no se encuentra en nuestro sistema. No te preocupes, el
        resto del sitio está en perfecto estado 😊
      </p>

      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:bg-blue-700 transition"
      >
        Volver a la recepción
      </Link>

      <span className="mt-6 text-sm text-blue-700 opacity-80">
        Clínica Vita Red · Cuidando tu salud digital 💙
      </span>
    </div>
  );
}
