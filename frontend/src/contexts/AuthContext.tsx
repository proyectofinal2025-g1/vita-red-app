"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { IAuthContextProps } from "@/interfaces/IAuthContextProps";
import { IAuthProviderProps } from "@/interfaces/IAuthProviderProps";
import { IUserSession } from "@/interfaces/IUserSession";

export const AuthContext = createContext<IAuthContextProps>({
  dataUser: null,
  setDataUser: () => {},
  logout: () => {},
  loginWithToken: () => {},
});

const getUserFromLocalStorage = (): IUserSession | null => {
  if (typeof window === "undefined") return null;
  const userInfo = localStorage.getItem("userSession");
  if (!userInfo) return null;
  try {
    return JSON.parse(userInfo);
  } catch {
    console.warn("Error parsing userSession from localStorage");
    return null;
  }
};

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  // Inicializa el estado directamente desde localStorage
  const [dataUser, setDataUser] = useState<IUserSession | null>(
    getUserFromLocalStorage
  );

  // useEffect solo para guardar (no para leer)
  useEffect(() => {
    if (dataUser) {
      localStorage.setItem("userSession", JSON.stringify(dataUser));
    } else {
      localStorage.removeItem("userSession");
    }
  }, [dataUser]);

  const logout = () => {
    setDataUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("userSession");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
    }
  };

  const loginWithToken = (token: string) => {
    if (typeof window === "undefined") return;

    // guardar token
    localStorage.setItem("authToken", token);

    // decodificar payload del JWT
    const payload = JSON.parse(atob(token.split(".")[1]));

    const userSession: IUserSession = {
      login: true,
      token,
      user: {
        id: payload.sub,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        role: payload.role,
        dni: payload.dni ?? undefined,
        appointments: [],
      },
    };
    setDataUser(userSession);
  };

  return (
    <AuthContext.Provider
      value={{ dataUser, setDataUser, logout, loginWithToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
