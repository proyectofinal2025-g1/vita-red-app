import Image from "next/image";

export default function Home() {
  return (
    <>
      <section className="w-screen h-screen relative flex items-center justify-center text-white">
        <Image
          src="/clinica3.png"
          alt="imagenFondo"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Agenda tu turno acá!</h1>

          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Atención profesional, rápida y confiable. Tu salud es nuestra
            prioridad.
          </p>

          <button className="text-2xl cursor-pointer rounded-xl bg-blue-500 px-6 py-3 hover:bg-blue-600 transition">
            Sacar turno
          </button>
        </div>
      </section>

      <section className="mt-20 px-6">
        <h2 className="text-center text-3xl font-semibold mb-10">
          Nuestras especialidades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center">
          <div className="text-center hover:scale-110 transition duration-400">
            <Image
              src="/Cardiologia.jpg"
              width={250}
              height={260}
              alt="Cardiologia"
              className="rounded-xl shadow-md"
            />
            <p className="mt-2 font-medium">Cardiología</p>
          </div>

          <div className="text-center hover:scale-110 transition duration-400">
            <Image
              src="/cirugia-general.webp"
              width={250}
              height={260}
              alt="Cirugia General"
              className="rounded-xl shadow-md"
            />
            <p className="mt-2 font-medium">Cirugía General</p>
          </div>

          <div className="text-center hover:scale-110 transition duration-400">
            <Image
              src="/diagnostico_por_imagenes.jpg"
              width={250}
              height={260}
              alt="Diagnostico por Imagenes"
              className="rounded-xl shadow-md"
            />
            <p className="mt-2 font-medium">Diagnóstico por Imágenes</p>
          </div>

          <div className="text-center hover:scale-110 transition duration-400">
            <Image
              src="/medico-bebe.jpg"
              width={250}
              height={260}
              alt="Pediatria"
              className="rounded-xl shadow-md"
            />
            <p className="mt-2 font-medium">Pediatría</p>
          </div>

          <div className="text-center hover:scale-110 transition duration-400">
            <Image
              src="/medico-clinico.jpg"
              width={250}
              height={260}
              alt="Medico Clinico"
              className="rounded-xl shadow-md"
            />
            <p className="mt-2 font-medium">Médico Clínico</p>
          </div>

          <div className="text-center hover:scale-110 transition duration-400">
            <Image
              src="/nutricion.jpg"
              width={250}
              height={260}
              alt="Nutricion"
              className="rounded-xl shadow-md"
            />
            <p className="mt-2 font-medium">Nutrición</p>
          </div>

          <div className="text-center hover:scale-110 transition duration-400">
            <Image
              src="/oftalmología.jpg"
              width={250}
              height={260}
              alt="Oftalmologia"
              className="rounded-xl shadow-md"
            />
            <p className="mt-2 font-medium">Oftalmología</p>
          </div>

          <div className="text-center hover:scale-110 transition duration-400">
            <Image
              src="/rehabilitacion.jpg"
              width={250}
              height={260}
              alt="Rehabilitacion"
              className="rounded-xl shadow-md"
            />
            <p className="mt-2 font-medium">Rehabilitación</p>
          </div>
        </div>
      </section>
    </>
  );
}
