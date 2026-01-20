export const getDashboardRoute = (role: string): string => {
  const normalizedRole = role.toUpperCase();
  console.log("role.toUpperCase():", normalizedRole);

  switch (normalizedRole) {
    case "PATIENT":
      return "/dashboard/patient";
    case "MEDICO":
      return "/dashboard/doctor";
    case "SUPERADMIN":
      return "/dashboard/super-admin";
    default:
      return "/auth/login";
  }
};
