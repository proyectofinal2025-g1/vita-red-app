import * as Yup from 'yup';

export const appointmentValidationSchema = Yup.object().shape({
    specialty: Yup.string()
    .required("La especialidad es obligatoria"),
    date: Yup.string()
    .required("La fecha es obligatoria"),
    time: Yup.string()
    .required("La hora es obligatoria"),
});