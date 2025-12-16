"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const images = [
  "/Cardiologia.jpg",
  "/cirugia-general.webp",
  "/diagnostico_por_imagenes.jpg",
  "/medico-bebe.jpg",
  "/medico-clinico.jpg",
  "/nutricion.jpg",
  "/oftalmologia.jpg",
  "/rehabilitacion.jpg",
];

export default function CarrouselHome() {
  const [current, setCurrent] = useState(0);

  const visibleSlides = 2;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[50vh] overflow-hidden">
      <div
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${(current * 100) / visibleSlides}%)`,
        }}
      >
        {images.map((src, index) => (
          <div key={index} className="relative w-1/2 h-full shrink-0">
            <Image
              src={src}
              alt="Hero image"
              fill
              className="object-cover"
              priority={index < 2}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-black/40" />

<div className="absolute inset-0 z-10 flex items-center justify-center text-white text-center px-4 pointer-events-none">
  <div>
    <h1 className="text-4xl font-bold mb-2">Cuidamos tu salud</h1>
    <p className="text-lg mb-6">Atención profesional, rápida y humana</p>

    <Link
      href="/especialidades"
      className="pointer-events-auto text-2xl cursor-pointer rounded-xl bg-blue-500 px-6 py-3 hover:bg-blue-600 transition"
    >
      Conocé más
    </Link>
  </div>
</div>

    </section>
  );
}
