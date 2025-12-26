import * as Yup from 'yup';
import { ILoginFormValues } from '../interfaces/ILoginFormValues';

export const initialValuesLogin: ILoginFormValues = {
  email: '',
  password: '',
};

export const loginValidationSchema = Yup.object({
  email: Yup.string() 
    .email('El correo electrónico no es válido')
    .required('El correo es obligatorio'),
    password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
});
