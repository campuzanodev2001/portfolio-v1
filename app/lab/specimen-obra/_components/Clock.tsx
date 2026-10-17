"use client";

import { useSyncExternalStore } from "react";

// Hora real de Buenos Aires. En el server no hay hora: guiones, nunca una hora vieja.
const fmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 5000);
  return () => window.clearInterval(id);
};
const now = () => fmt.format(Date.now());
const placeholder = () => "--:--";

export default function Clock() {
  const t = useSyncExternalStore(subscribe, now, placeholder);
  return <time className="tabular-nums">{t}</time>;
}
