import Link from "next/link"

export const Footer = () => {
  return (
    <footer className="w-full bg-transparent text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Link href="/">
            <img src="/logo2.png" alt="Logo clinica" className="h-12 md:h-14 w-auto" />
            <p className="text-sm md:text-base font-medium text-center sm:text-left">Atención profesional y de calidad</p>
            </Link>
          </div>


          <ul className="flex flex-wrap justify-center sm:justify-end items-center gap-4 md:gap-10 text-sm font-medium mb-2 sm:mb-0">
            <li>
              <Link href="/" className="text-white hover:underline">Inicio</Link>
            </li>
            <li>
              <Link href="#" className="text-white hover:underline">Nuestra clínica</Link>
            </li>
            <li>
              <Link href="#" className="text-white hover:underline">Especialidades</Link>
            </li>
            <li>
              <Link href="#" className="text-white hover:underline">Contacto</Link>
            </li>
          </ul>

        </div>

        <hr className="my-6 border-default" />

        <div className="text-center">
          <span className="text-sm block">
            © 2025 <a>VITA RED™</a>. Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  )
}
