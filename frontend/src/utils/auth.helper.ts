import { ILoginFormValues } from "../interfaces/ILoginFormValues";
import { IRegisterFormValues } from "../interfaces/IRegisterFormValues";

const apiURL = process.env.NEXT_PUBLIC_API_URL; 
export const registerUserService = async (userData: IRegisterFormValues) => {
  const response = await fetch(`${apiURL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: userData.first_name,
      last_name: userData.last_name,
      dni: userData.dni,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
    }),
  }); 

  const data = await response.json();
  console.log('Respuesta del backend:', data);

  if (!response.ok) {
    // Lanza un error con el mensaje del backend
    const errorMsg = data.message || data.error || 'Error en el registro';
    throw new Error(errorMsg);
  }
  return data; // Éxito: devuelve los datos del usuario o lo que el backend envíe
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