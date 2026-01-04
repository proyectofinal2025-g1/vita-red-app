// src/contexts/AuthContext.tsx
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { IAuthContextProps } from '@/interfaces/IAuthContextProps';
import { IAuthProviderProps } from '@/interfaces/IAuthProviderProps';
import { IUserSession } from '@/interfaces/IUserSession';
import { decodeJWT } from '@/utils/decodeJWT';

export const AuthContext = createContext<IAuthContextProps>({
  dataUser: null,
  setDataUser: () => {},
  logout: () => {}
});

const getUserFromLocalStorage = (): IUserSession | null => {
  if (typeof window === 'undefined') return null;

  const userInfo = localStorage.getItem('userSession');
  if (!userInfo) return null;

  try {
    const parsed = JSON.parse(userInfo) as IUserSession;

    if (!parsed.token) return null;

    const payload = decodeJWT(parsed.token);
    if (!payload || typeof payload.exp !== 'number') return null;

    const now = Date.now();
    if (payload.exp * 1000 < now) {
      return null;
    }

    return parsed;
  } catch (e) {
    return null;
  }
};

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [dataUser, setDataUser] = useState<IUserSession | null>(
    getUserFromLocalStorage()
  );

  useEffect(() => {
    if (dataUser) {
      localStorage.setItem('userSession', JSON.stringify(dataUser));
    } else {
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    }
  }, [dataUser]);

  const logout = () => {
    setDataUser(null);
  };

  const loginWithToken = (token: string) => {
    if (typeof window === 'undefined') return;

    const payload = decodeJWT(token);
    if (
      !payload ||
      typeof payload.exp !== 'number' ||
      payload.exp * 1000 < Date.now()
    ) {
      return;
    }

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
