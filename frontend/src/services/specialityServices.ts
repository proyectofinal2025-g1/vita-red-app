import { ISpeciality } from "@/interfaces/ISpeciality";
import { ISpecialityWithDoctors } from "@/interfaces/ISpecialityWithDoctors";
const apiURL = process.env.NEXT_PUBLIC_API_URL;

export const getAllSpecialityService = async () => {
  try {
    console.log("API URL:", apiURL);

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

export const getSpecialityByIdService = async (
  id: string
): Promise<ISpecialityWithDoctors | null> => {
  try {
    const res = await fetch(`${apiURL}/speciality/${id}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
