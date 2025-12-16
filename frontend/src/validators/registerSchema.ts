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
    .required('El correo es obligatorio'),
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres') // Ajustado a lo que usa el backend
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/\d/, 'Debe contener al menos un número')
    .matches(/[@$!%*?&#_+-]/, 'Debe contener al menos un carácter especial')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});
