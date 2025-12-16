export interface IUserSession {
    login: boolean;
    token: string;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        dni: number;
        email: string;
        appointments: [];
        role: string;
    };
}