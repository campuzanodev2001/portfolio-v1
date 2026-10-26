import { N, VIEW_W } from "./shapes";

/** ms que cada dibujo queda quieto. */
export const HOLD = 2800;
/** ms que tarda la línea en rehacerse en el dibujo siguiente. */
export const MORPH = 2000;
export const CYCLE = HOLD + MORPH;

/**
 * Cada punto hace su viaje en una ventana de WIDTH (fracción del morph) y las
 * ventanas arrancan escalonadas según su posición en la línea (SPREAD): el
 * cambio recorre la línea de izquierda a derecha, como una birome que redibuja.
 */
const SPREAD = 0.58;
const WIDTH = 1 - SPREAD;
/** Cuánto se curva la trayectoria de cada punto (proporcional a su recorrido). */
const SWIRL = 0.32;
const TAU = Math.PI * 2;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * Interpola A → B en `out` con progreso p ∈ [0, 1].
 * Devuelve la posición del frente de onda en la línea (0..1), donde va la birome.
 */
export function morph(out: Float32Array, a: Float32Array, b: Float32Array, p: number, seed: number): number {
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const e = ease(clamp01((p - SPREAD * u) / WIDTH));
    const ax = a[i * 2];
    const ay = a[i * 2 + 1];
    const dx = b[i * 2] - ax;
    const dy = b[i * 2 + 1] - ay;
    // desvío perpendicular: el punto viaja en arco, no en línea recta;
    // el signo varía suave a lo largo de la línea → la hebra "flamea".
    const sw = Math.sin(Math.PI * e) * SWIRL * Math.sin(u * TAU * 2 + seed);
    out[i * 2] = ax + dx * e - dy * sw;
    out[i * 2 + 1] = ay + dy * e + dx * sw;
  }
  return clamp01((p - WIDTH / 2) / SPREAD);
}

/** Respiración mínima (siempre encendida, continua en el tiempo → no hay salto de loop). */
export function breathe(out: Float32Array, timeMs: number, amp: number) {
  const t = timeMs * 0.001;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    out[i * 2] += Math.cos(t * 0.9 + u * 17) * amp * 0.6;
    out[i * 2 + 1] += Math.sin(t * 1.1 + u * 23) * amp;
  }
}

/** La línea se aparta del puntero (desktop). */
export function repel(out: Float32Array, px: number, py: number, strength: number) {
  const R = 64;
  for (let i = 0; i < N; i++) {
    const dx = out[i * 2] - px;
    const dy = out[i * 2 + 1] - py;
    const d2 = dx * dx + dy * dy;
    if (d2 > R * R || d2 < 1e-4) continue;
    const d = Math.sqrt(d2);
    const f = (1 - d / R) * (1 - d / R) * strength;
    out[i * 2] += (dx / d) * f;
    out[i * 2 + 1] += (dy / d) * f;
  }
}

/** Opacidad por x: la línea nace y muere en los bordes del horizonte. */
export function edgeFade(x: number) {
  const a = clamp01(x / 90);
  const b = clamp01((VIEW_W - x) / 90);
  return Math.min(a, b);
}
