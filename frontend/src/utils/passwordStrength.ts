// frontend/utils/passwordStrength.ts
// utils/passwordStrength.ts
export const getPasswordStrength = (password: string) => {
  let strength = 0;

  // 1. Longitud mínima (8+)
  if (password.length >= 8) strength += 1;

  // 2. Al menos una mayúscula
  if (/[A-Z]/.test(password)) strength += 1;

  // 3. Al menos un número
  if (/[0-9]/.test(password)) strength += 1;

  // 4. Al menos un carácter especial (¡mismo conjunto que en Yup!)
  if (/[@$!%*?&#_+-]/.test(password)) strength += 1;

  // Evaluación
  if (strength <= 1) return 'weak'; // Rojo (solo cumple 0 o 1 regla)
  if (strength <= 2) return 'medium'; // Amarillo (cumple 2 reglas)
  return 'strong'; // Verde (cumple 3 o 4 reglas)
};
export const getPasswordStrengthLabel = (strength: string) => {
  switch (strength) {
    case 'weak':
      return 'Débil';
    case 'medium':
      return 'Media';
    case 'strong':
      return 'Fuerte';
    default:
      return '';
  }
};
