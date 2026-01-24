const ARG_TIMEZONE = "America/Argentina/Buenos_Aires";

export function formatArgentinaDate(dateUTC: string): string {
  const date = new Date(dateUTC);

  return date.toLocaleDateString("es-AR", {
    timeZone: ARG_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatArgentinaTime(dateUTC: string): string {
  const date = new Date(dateUTC);

  return date.toLocaleTimeString("es-AR", {
    timeZone: ARG_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
