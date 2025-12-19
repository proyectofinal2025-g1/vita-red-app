import { ISpeciality } from "@/interfaces/ISpeciality";

export const getAllSpecialityService = async () => {
  try {
    const res = await fetch("http://localhost:3000/speciality", {
      method: "GET",
      cache: "no-store",
    });
    const specialitys: ISpeciality[] = await res.json();
    return specialitys;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching specialitys");
  }
};

export const getAllSpecialityServiceById = async (
  idSpeciality: string
): Promise<ISpeciality | null> => {
  const allSpeciality = await getAllSpecialityService();

  const speciality = allSpeciality.find(
    (speciality) => speciality.id === idSpeciality
  );

  return speciality ?? null;
};
