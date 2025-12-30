import Link from "next/link";
import { ISpeciality } from "@/interfaces/ISpeciality";

interface Props {
  especialidad: ISpeciality;
}

export default function SpecialityCard({ especialidad }: Props) {
  return (
    <article className="hover:translate-y-1 p-3.25 shadow-2xl transition duration-500 bg-gray-200 rounded-2xl flex flex-col gap-3 border-b border-gray-200 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-xl font-semibold capitalize text-gray-800">
          {especialidad.name}
        </h3>

        <p className="mt-1 max-w-2xl text-gray-600">
          {especialidad.description}
        </p> 
      </div>

      {especialidad.isActive && (
        <Link
          href={`/especialidades/${especialidad.id}`}
          className="mt-4 inline-flex w-fit items-center rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600 sm:mt-0"
        >
          Ver detalle
        </Link>
      )}
    </article>
  );
}
