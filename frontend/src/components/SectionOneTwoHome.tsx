import Image from "next/image";
const SectionOneTwoHome = () => {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 mt- mb-5">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative h-[300px] w-full overflow-hidden rounded-2xl shadow-md sm:h-[400px]">
            <Image
              src="/consultorio2.png"
              alt="Nuestra clínica"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-800 flex justify-center">
              Quiénes somos
            </h2>

            <p className="mb-4 text-lg text-gray-600">
              En <span className="font-semibold text-gray-800">Vita Red</span>{" "}
              somos una clínica con más de{" "}
              <span className="font-semibold">20 años de trayectoria</span>,
              dedicada a brindar atención médica integral, y de calidad. A lo
              largo de los años hemos acompañado a miles de pacientes,
              construyendo una relación basada en la confianza, el compromiso y
              el respeto por cada persona.
            </p>

            <p className="mb-4 text-lg  text-gray-600">
              Contamos con un equipo de profesionales altamente capacitados en
              distintas especialidades médicas. Nuestro enfoque combina
              experiencia clínica, actualización constante y una mirada integral
              de la salud.
            </p>

            <p className="text-lg  text-gray-600">
              Nuestro objetivo es ofrecer un servicio cercano, confiable y
              eficiente, incorporando tecnología médica de última generación y
              procesos pensados para mejorar la experiencia del paciente.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-blue-300 py-20 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-16 md:grid-cols-2">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-sky-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h18M3 12h18M3 17h18"
                  />
                </svg>
              </div>

              <h3 className="mb-4 text-2xl font-semibold">
                Institución N° 1 en:
              </h3>

              <ul className="space-y-3 text-lg">
                <li>• Derivación de alta complejidad a nivel regional</li>
                <li>
                  • Atención oncológica, siendo el centro de mayor envergadura
                  nacional
                </li>
                <li>• Trasplante de médula ósea en el país</li>
              </ul>
            </div>

            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-sky-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 010-6.364z"
                  />
                </svg>
              </div>

              <h3 className="mb-4 text-2xl font-semibold">Pioneros en:</h3>

              <ul className="space-y-3 text-lg">
                <li>• Trasplante de órganos</li>
                <li>• Cirugía e intervencionismo cardíaco</li>
                <li>• Banco de huesos y tejidos del interior del país</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SectionOneTwoHome;
