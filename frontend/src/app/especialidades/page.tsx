import React from "react";
import { getAllSpecialityService } from "@/services/specialityServices";
import SpecialityCard from "@/components/SpecialityCard";

const page = async () => {
  const allSpecialitys = await getAllSpecialityService();
  return (
    <>
      <section className="mx-auto max-w-5xl px-4">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">
          Nuestras especialidades
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          {allSpecialitys.map((esp) => {
            return <SpecialityCard key={esp.id} especialidad={esp} />;
          })}
        </div>
      </section>
    </>
  );
};

{
}

export default page;
