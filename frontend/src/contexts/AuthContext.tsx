'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { IAuthContextProps } from '@/interfaces/IAuthContextProps';
import { IAuthProviderProps } from '@/interfaces/IAuthProviderProps';
import { IUserSession } from '@/interfaces/IUserSession';

export const AuthContext = createContext<IAuthContextProps>({
  dataUser: null,
  setDataUser: () => {},
  logout: () => {},
});

// Función auxiliar para leer desde localStorage de forma segura
const getUserFromLocalStorage = (): IUserSession | null => {
  if (typeof window === 'undefined') return null;
  const userInfo = localStorage.getItem('userSession');
  if (!userInfo) return null;
  try {
    return JSON.parse(userInfo);
  } catch {
    console.warn('Error parsing userSession from localStorage');
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
      localStorage.setItem('userSession', JSON.stringify(dataUser));
    } else {
      localStorage.removeItem('userSession');
    }
  }, [dataUser]);

  const logout = () => {
    setDataUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    }
  };

  return (
    <AuthContext.Provider value={{ dataUser, setDataUser, logout }}>
      {children}
    </AuthContext.Provider>
  ); 
};

export const useAuth = () => useContext(AuthContext);
