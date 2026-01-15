import { normalizeText } from "./text.helper";

export const SPECIALITY_CANONICAL_MAP: Record<string, string> = {
  cardiologia: 'Cardiología',
  psiquiatria: 'Psiquiatría',
  psicologia: 'Psicología',
  clinica: 'Clínica Medica',
  clinicamedica: 'Clínica Medica',
  clinico: 'Clínica Medica',
  clinicomedico: 'Clínica Medica',
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
