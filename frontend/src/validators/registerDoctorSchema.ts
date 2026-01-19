import * as Yup from 'yup';
import { IRegisterDoctorValues } from '@/interfaces/IRegisterDoctorValues';

export const initialValuesRegisterDoctor: IRegisterDoctorValues = {
    first_name: '',
    last_name: '',
    dni: '',
    email: '',
    password: '',
    confirmPassword: '',
    licence_number: '',
    speciality_id: ''
}

export const registerDoctorSchema = Yup.object({
    first_name: Yup.string()
    .matches(/^[a-zA-Z\s]+$/,'El nombre solo puede contener letras, sin tildes ni espacios')
    .trim()
    .required("El nombre es obligatorio"),
    last_name: Yup.string()
    .matches(/^[a-zA-Z\s]+$/,'El apellido solo puede contener letras, sin tildes niespacios')
    .trim()
    .required("El apellido es obligatorio"),
    dni: Yup.string()
    .matches(/^\d+$/, 'El DNI solo debe contener números')
    .required("El DNI es obligatorio")
    .max(8,"El DNI no puede tener más de 8 caracteres"),
    licence_number: Yup.string()
    .matches(/^\d+$/, 'La matrícula solo debe contener números')
    .required("El número de matrícula es obligatorio")
    .max(4, "La matrícula no puede tener más de 4 caracteres"),
    speciality_id: Yup.string()
    .required("La especialidad es obligatoria"),
    email: Yup.string()
    .email('El correo electrónico no es válido')
    .required("El email es obligatorio"),
    password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/,'La contraseña debe contener al menos una letra minúscula (A-Z)')
    .matches(/[A-Z]/,'La contraseña debe contener al menos una letra mayúscula (A-Z)')
    .matches(/\d/, 'La contraseña debe contener al menos un número (0-9)')
    .matches(/[@$!%*?&#_+-]/,'La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &, #, _, +, -)')
    .required('La contraseña es obligatoria'),
    confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
})