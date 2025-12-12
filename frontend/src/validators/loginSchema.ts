import * as Yup from 'yup';

export interface LoginFormValuesType {
  email: string;
  password: string;
}

export const loginFormInitialValues: LoginFormValuesType = {
  email: '',
  password: '',
};

export const loginformValidatorSchema = Yup.object({
  email: Yup.string()
    .email('El correo electrónico no es válido')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
});
