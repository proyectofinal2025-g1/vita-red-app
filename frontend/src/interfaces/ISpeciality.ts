export interface ISpeciality {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  doctors: {
    id: string;
    licence_number: string;
    first_name: string;
    last_name: string;
  };
}
