import { ILoginFormValues } from "../interfaces/ILoginFormValues";
import { IRegisterFormValues } from "../interfaces/IRegisterFormValues";

export const registerUserService = async (userData: IRegisterFormValues) => {
    try {
        const response = await fetch (`http://localhost:3000/auth/register`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });
        if (response.ok) {
            alert("Registrado exitosamente")
            return response.json();
        } else {
            alert("Ups no pudimos registrarte")
            throw new Error("Registro fallido");
        }
    } catch (error: any) { 
        throw new Error(error);
    }
};

export const loginUserService = async (userData: ILoginFormValues) => {
    try {
        const response = await fetch (`http://localhost:3000/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });
        if (response.ok) {
            alert("¡Inicio de sesión exitoso!")
            return response.json();
        } else {
            alert("Ups no pudimos loguearte")
            throw new Error("Logueo fallido");
        }
    } catch (error: any) {
        throw new Error(error);
}
};