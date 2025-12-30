import { IDoctor } from "@/interfaces/IDoctor";
const apiURL = process.env.NEXT_PUBLIC_API_URL;

export const getAllDoctorsService = async (): Promise<IDoctor[]> => {
  try {
    const res = await fetch(`${apiURL}/doctor`, {
      cache: "no-store",
      method: "GET"
    });

    if (!res.ok) {
      throw new Error("Failed to fetch doctors");
    }

    const doctors: IDoctor[] = await res.json();
    return doctors;
  } catch (error) {
    console.error("getAllDoctorsService error:", error);
    throw new Error("Error fetching doctors");
  }
};
