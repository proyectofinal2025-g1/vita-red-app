// validators/registerSchema.ts
import * as Yup from 'yup';

// 👇 Actualizamos la interfaz con los campos reales
export interface RegisterFormValuesType {
  first_name: string;
  last_name: string;
  dni: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const registerFormInitialValues: RegisterFormValuesType = {
  first_name: '', 
  last_name: '',
  dni: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const registerformValidatorSchema = Yup.object({
  first_name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(20, 'El nombre no puede tener más de 20 caracteres')
    .matches(
      /^[a-zA-Z\s]+$/,
      'El nombre solo puede contener letras (sin sacentos ni tildes) y espacios'
    )
    .trim() // Elimina espacios al inicio y al final
    .required('El primer nombre es obligatorio'),
  last_name: Yup.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(20, 'El apellido no puede tener más de 20 caracteres')
    .matches(
      /^[a-zA-Z\s]+$/,
      'El apellido solo puede contener letras (sin sacentos ni tildes) y espacios'
    )
    .trim() // Elimina espacios al inicio y al final
    .required('El apellido es obligatorio'),
  dni: Yup.string()
    .matches(/^\d+$/, 'El DNI solo debe contener números')
    .min(6, 'El DNI debe tener al menos 6 dígitos')
    .max(10, 'El DNI no puede tener más de 10 dígitos')
    .required('El DNI es obligatorio'),
  email: Yup.string()
    .email('El correo electrónico no es válido')
    .max(50, 'El correo electrónico no puede tener más de 50 caracteres')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /[a-z]/,
      'La contraseña debe contener al menos una letra minúscula (A-Z)'
    )
    .matches(
      /[A-Z]/,
      'La contraseña debe contener al menos una letra mayúscula (A-Z)'
    )
    .matches(/\d/, 'La contraseña debe contener al menos un número (0-9)')
    .matches(
      /[@$!%*?&#_+-]/,
      'La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &, #, _, +, -)'
    )
    .max(20, 'La contraseña no puede tener más de 20 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});
