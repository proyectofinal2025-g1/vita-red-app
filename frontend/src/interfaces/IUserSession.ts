export interface IUserSession {
  login: boolean;
  token: string;
  user: {
    id: string; // era number antes de la actualización //
    first_name: string; //
    last_name: string; //
    email: string; //
    role: string; //
    dni?: string; // era number antes de la actualización
    appointments: []; //
  }; 
}
