import * as Yup from 'yup';

export interface RegisterFormValuesType {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  // address y phone no son obligatorios para esta entrega simple
}

export const registerFormInitialValues: RegisterFormValuesType = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const registerformValidatorSchema = Yup.object({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es obligatorio'),
  email: Yup.string()
    .email('El correo electrónico no es válido')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});
