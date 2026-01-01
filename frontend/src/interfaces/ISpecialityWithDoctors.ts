import { IDoctorApi } from "./IDoctorApi";

export interface ISpecialityWithDoctors {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  doctors: IDoctorApi[];
}
