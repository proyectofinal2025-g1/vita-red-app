'use client'

import { useState, useEffect, createContext, useContext } from "react";
import { IAuthContextProps } from "@/interfaces/IAuthContextProps";
import { IAuthProviderProps } from "@/interfaces/IAuthProviderProps";
import { IUserSession } from "@/interfaces/IUserSession";

export const AuthContext = createContext<IAuthContextProps>({
    dataUser: null,
    setDataUser: () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
    const [dataUser, setDataUser] = useState<IUserSession | null>(null);

    useEffect(() => {
        if (dataUser) {
            localStorage.setItem("userSession", JSON.stringify(dataUser));
        }
    }, [dataUser]);

    useEffect(() => {
        if (typeof window !== "undefined" && window.localStorage) {
            const userInfo = localStorage.getItem("userSession");
            if (userInfo) {
                setDataUser(JSON.parse(userInfo));
            }
        }
    }, []);

    const logout = () => {
        setDataUser(null);
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem("userSession");
        }
    };

    return (
        <AuthContext.Provider value={{ dataUser, setDataUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
