"use client";

import { useSyncExternalStore } from "react";
import { BOOT_KEY } from "./content";

/* ---------- Hora real en Buenos Aires ---------- */

const fmt =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

function subscribeClock(cb: () => void) {
  const id = window.setInterval(cb, 10_000);
  return () => window.clearInterval(id);
}

const clockSnapshot = () => (fmt ? fmt.format(new Date()) : null);
const clockServer = () => null;

/** "16:42" en America/Argentina/Buenos_Aires, o null en el server. */
export function useBuenosAiresTime() {
  return useSyncExternalStore(subscribeClock, clockSnapshot, clockServer);
}

/* ---------- Boot: ¿corre el loader o no? ----------
   El script inline de page.tsx decide antes del primer paint y lo deja en
   <html data-pr-boot>. Si no corrió (navegación client-side), se decide acá. */

export type BootMode = "run" | "skip";
type BootState = { mode: BootMode; t0: number };

type PrWindow = Window & { __prT0?: number; __prBoot?: BootMode };

let boot: BootState | null = null;

function readBoot(): BootState {
  if (boot) return boot;
  const html = document.documentElement;
  const w = window as PrWindow;
  // __prBoot lo deja el script inline; el atributo es sólo para el CSS.
  const attr = w.__prBoot ?? html.getAttribute("data-pr-boot");
  if (attr === "run" || attr === "skip") {
    boot = { mode: attr, t0: w.__prT0 ?? performance.now() };
    return boot;
  }
  let mode: BootMode = "run";
  try {
    mode = sessionStorage.getItem(BOOT_KEY) ? "skip" : "run";
    sessionStorage.setItem(BOOT_KEY, "1");
  } catch {
    /* storage bloqueado: corre el loader, que dura poco */
  }
  html.setAttribute("data-pr-boot", mode);
  boot = { mode, t0: performance.now() };
  return boot;
}

/** Se llama cuando el loader terminó: si se vuelve a montar la ruta en la
    misma sesión, va directo al hero. */
export function markBooted() {
  boot = { mode: "skip", t0: 0 };
  (window as PrWindow).__prBoot = "skip";
  document.documentElement.setAttribute("data-pr-boot", "skip");
}

const noopSubscribe = () => () => {};
const bootModeSnapshot = (): BootMode | "pending" => readBoot().mode;
const bootModeServer = (): BootMode | "pending" => "pending";

export function useBootMode() {
  return useSyncExternalStore(noopSubscribe, bootModeSnapshot, bootModeServer);
}

export function bootStart() {
  return readBoot().t0;
}

/* ---------- Media ---------- */

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
