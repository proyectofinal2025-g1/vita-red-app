import { ISpeciality } from "@/interfaces/ISpeciality";
const apiURL = process.env.NEXT_PUBLIC_API_URL;

export const getAllSpecialityService = async () => {
  try {    console.log("API URL:", apiURL);

    const res = await fetch(`${apiURL}/speciality`, {
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
