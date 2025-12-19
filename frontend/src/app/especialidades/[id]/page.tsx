import { getAllSpecialityServiceById } from "@/services/specialityServices";
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

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          {specialityData.name}
        </h1>

        <p className="mt-4 max-w-3xl text-gray-600">
          {specialityData.description}
        </p>
      </header>
    </section>
  );
};

export default SpecialityDetailPage;
