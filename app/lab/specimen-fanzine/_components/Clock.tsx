"use client";

import { useSyncExternalStore } from "react";

// Real local time in Buenos Aires. The server snapshot is a placeholder so a
// statically prerendered page never shows a stale (= fake) time.
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
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{t}</span>;
}
