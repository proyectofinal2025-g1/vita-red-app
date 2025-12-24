"use client";

import { useMemo, useState } from "react";
import { ISpeciality } from "@/interfaces/ISpeciality";
import SpecialityCard from "./SpecialityCard";

interface Props {
  specialitys: ISpeciality[];
}

export default function SpecialityList({ specialitys }: Props) {
  const [search, setSearch] = useState("");

  const filteredSpecialitys = useMemo(() => {
    return specialitys.filter((esp) =>
      esp.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, specialitys]);

  return (
    <>
      <div className="mb-10">
        <input
          type="text"
          placeholder="Buscar especialidad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" 
        />
      </div>

      {filteredSpecialitys.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {filteredSpecialitys.map((esp) => (
            <SpecialityCard key={esp.id} especialidad={esp} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No se encontraron especialidades.</p>
      )}
    </>
  );
}
