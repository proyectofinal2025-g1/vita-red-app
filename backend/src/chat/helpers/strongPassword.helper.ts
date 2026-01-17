export function isStrongPassword(password: string): boolean {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  return strongPasswordRegex.test(password);
}
