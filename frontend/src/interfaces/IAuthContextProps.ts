import { IUserSession } from "./IUserSession";

export interface IAuthContextProps {
  dataUser: IUserSession | null;
  setDataUser: (dataUser: IUserSession | null) => void;
  logout: () => void;

  loginWithToken: (token: string) => void;
  loading: boolean;
}
