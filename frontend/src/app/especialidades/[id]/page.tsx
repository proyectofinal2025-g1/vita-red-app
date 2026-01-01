import { IDoctor } from "@/interfaces/IDoctor";
import { getSpecialityByIdService } from "@/services/specialityServices";
import { notFound } from "next/navigation";

const SpecialityDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const specialityData = await getSpecialityByIdService(id);

  if (!specialityData) {
    notFound();
  }

  const doctors: IDoctor[] = specialityData.doctors.map((doctor) => ({
    id: doctor.id,
    fullName: `${doctor.first_name} ${doctor.last_name}`,
    speciality: specialityData.name,
    licence_number: doctor.licence_number,
    profileImageUrl: doctor.profileImageUrl,
  }));

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          {specialityData.name}
        </h1>

        <p className="mt-4 max-w-3xl text-gray-600">
          {specialityData.description}
        </p>
      </header>

      {/* MÉDICOS */}
      <section className="grid gap-6 md:grid-cols-2 ">
        {doctors.length === 0 ? (
          <p className="text-gray-500">
            No hay médicos registrados para esta especialidad.
          </p>
        ) : (
          doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="flex flex-col items-center gap-4 rounded-xl border p-6 shadow-sm
            md:flex-row md:items-center md:justify-between shadow-xl"
            >
              {/* TEXTO */}
              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-1000">
                  {doctor.fullName}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Matrícula: {doctor.licence_number}
                </p>
              </div>

              {/* IMAGEN */}
              <div className="flex-shrink-0">
                <img
                  src={doctor.profileImageUrl ?? "/doctor-placeholder.png"}
                  alt={doctor.fullName}
                  className="
        h-24 w-24 rounded-full object-cover
        md:h-50 md:w-50 shadow-xl

      "
                />
              </div>
            </article>
          ))
        )}
      </section>
    </section>
  );
};

export default SpecialityDetailPage;
