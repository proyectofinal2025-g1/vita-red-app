import { getAllSpecialityServiceById } from "@/services/specialityServices";
import { getAllDoctorsService } from "@/services/doctorService";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const SpecialityDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const specialityData = await getAllSpecialityServiceById(id);

  if (!specialityData) {
    notFound();
  }

  const doctors = await getAllDoctorsService();

  const doctorsBySpeciality = doctors.filter(
    (doctor) =>
      doctor.speciality.toLowerCase() ===
      specialityData.name.toLowerCase()
  );

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
      <section className="grid gap-6 md:grid-cols-2">
        {doctorsBySpeciality.length === 0 ? (
          <p className="text-gray-500">
            No hay médicos registrados para esta especialidad.
          </p>
        ) : (
          doctorsBySpeciality.map((doctor) => (
            <article
              key={doctor.id}
              className="rounded-xl border p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {doctor.fullName}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Matrícula: {doctor.licence_number}
              </p>
            </article>
          ))
        )}
      </section>
    </section>
  );
};

export default SpecialityDetailPage;
