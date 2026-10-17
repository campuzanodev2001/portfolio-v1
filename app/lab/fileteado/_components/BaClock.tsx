"use client";

import { useSyncExternalStore } from "react";

const fmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
};
const now = () => fmt.format(new Date());
const server = () => null;

/** La hora real en Buenos Aires (no una inventada). */
export default function BaClock() {
  const t = useSyncExternalStore(subscribe, now, server);
  const verb = t?.startsWith("01") ? "es la" : "son las";
  return (
    <>
      En Buenos Aires {verb} <time className="tabular">{t ?? "··:··"}</time>
    </>
  );
}
