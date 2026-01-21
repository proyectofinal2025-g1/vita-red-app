import { normalizeText } from "./text.helper";

export const SPECIALITY_CANONICAL_MAP: Record<string, string> = {
  cardiologia: 'Cardiología',
  psiquiatria: 'Psiquiatría',
  psicologia: 'Psicología',
  clinica: 'Clínica Medica',
  clinico: 'Clínica Medica',
  clinicomedico: 'Clínica Medica',
  clinicamedica: 'Clínica Medica',
  medicinageneral: 'Clínica Medica',
  medicinageneralista: 'Clínica Medica',
  general: 'Clínica Medica',
  pediatria: 'Pediatría',
  oftalmologia: 'Oftalmología',
  nutricion: 'Nutrición',
  urologia: 'Urología',
  nefrologia: 'Nefrología',
  endocrinologia: 'Endocrinología',
  traumatologia: 'Traumatología',
  kinesiologia: 'Kinesiología',
  odontologia: 'Odontología',
  otorrinolaringologia: 'Otorrinolaringología',
  reumatologia: 'Reumatología',
  diagnostico: 'Diagnóstico por Imágenes',
  diagnosticoporimagenes: 'Diagnóstico por Imágenes',
  ginecologia: 'Ginecología',
  gastroenterologia: 'Gastroenterología',
};


export function resolveSpecialityName(input: string): string {
  const normalized = normalizeText(input);
  return SPECIALITY_CANONICAL_MAP[normalized] ?? input;
}


export function isGeneral(symptoms: string[]): boolean {
  const normalized = normalizeText(symptoms.join(' '));

  const keywords = [
    'solo control',
    'control',
    'chequeo',
    'chequeo general',
    'revision',
    'revisión',
    'rutina',
    'consulta general',
    'sin sintomas',
    'sin síntomas',
    'nada'
  ];

  return keywords.some(k => normalized.includes(normalizeText(k)));
}


export function isStrongPassword(password: string): boolean {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  return strongPasswordRegex.test(password);
}



