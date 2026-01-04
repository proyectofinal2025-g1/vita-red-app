import { getAllSpecialityService } from "@/services/specialityServices";
import SpecialityList from "@/components/SpecialityList";

export const dynamic = "force-dynamic";
const page = async () => {
  const allSpecialitys = await getAllSpecialityService();
  return (
    <section className="mx-auto max-w-5xl px-4">
      <h2 className=" text-center pt-5 mb-8 text-3xl font-bold text-gray-800">
        Nuestras especialidades
      </h2>

      <SpecialityList specialitys={allSpecialitys} />
    </section>
  );
};

export default page;
