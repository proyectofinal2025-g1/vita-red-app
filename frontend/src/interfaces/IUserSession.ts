export interface IUserSession {
  login: boolean;
  token: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    dni?: string;
    appointments: [];
    profileImageUrl?: string;
  };
}
