import { IDoctor } from "@/interfaces/IDoctor";

export const getAllDoctorsService = async (): Promise<IDoctor[]> => {
  try {
    const res = await fetch("http://localhost:3000/doctor", {
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
