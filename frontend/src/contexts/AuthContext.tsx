'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { IAuthContextProps } from '@/interfaces/IAuthContextProps';
import { IAuthProviderProps } from '@/interfaces/IAuthProviderProps';
import { IUserSession } from '@/interfaces/IUserSession';
import { decodeJWT } from '@/utils/decodeJWT';

export const AuthContext = createContext<IAuthContextProps>({
  dataUser: null,
  setDataUser: () => {},
  logout: () => {},
  loginWithToken: () => {},
  loading: true,
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

    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [dataUser, setDataUser] = useState<IUserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getUserFromLocalStorage();
    if (session) {
      setDataUser(session);
    }
    setLoading(false);
  }, []);

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
    localStorage.removeItem("vita_chat_messages");
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
      value={{ dataUser, setDataUser, logout, loginWithToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
