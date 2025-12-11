export interface IUserSession {
    login: boolean;
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        address: string;
        phone: string;
        appointments: [];
        role: string;
    };
}