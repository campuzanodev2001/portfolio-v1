/** Hora real en Buenos Aires, HH:MM. */
export function baTime(d = new Date()) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}
