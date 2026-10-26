/**
 * Coreografía del loop. Todo el despiece sale de una sola fase p ∈ [0, 1):
 * la misma función alimenta a todos los niveles del Droste (heredan las
 * mismas custom properties), así que siempre van sincronizados.
 *
 * El truco del loop infinito: entre p = 0.80 y 1 la lámina hace zoom ×2.5
 * hasta que la pantalla del teléfono llena la lámina. Lo que muestra esa
 * pantalla ES la lámina (un nivel más adentro, en el mismo estado), así que
 * en p = 1 la imagen es idéntica a p = 0 y el salto 1 → 0 no se ve.
 */

/** Duración de una vuelta completa, ms. */
export const PERIOD_MS = 16000;
/** Fase del cuadro quieto (SSR, reduced-motion, arranque): despiece completo. */
export const START_PHASE = 0.39;
/** Pantalla 40cqw dentro de una lámina de 100cqw → escala del Droste. */
export const ZOOM = 2.5;
/** Capas: 0 bits … 6 interfaz. */
export const PLATES = 7;
/** Hasta qué profundidad se dibuja la lámina dentro de la pantalla. */
export const MAX_LEVEL = 4;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** smootherstep: velocidad y aceleración cero en los extremos. */
function ss(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export interface Frame {
  /** 0 = de frente, 1 = isométrico. */
  rot: number;
  /** 0 = armado, 1 = despiezado. */
  e: number;
  /** Escala del zoom de la lámina exterior (1 … 2.5). */
  zs: number;
  /** Brillo del pulso que recorre las capas, una por capa. */
  h: number[];
}

export function frameAt(p: number): Frame {
  const rot = ss(0.1, 0.22, p) - ss(0.68, 0.8, p);
  const e = ss(0.18, 0.38, p) - ss(0.56, 0.72, p);
  const zs = Math.pow(ZOOM, ss(0.8, 1, p));

  // Pulso: una "request" baja de la interfaz a los bits y la respuesta sube.
  const h = new Array<number>(PLATES).fill(0);
  if (p > 0.4 && p < 0.54) {
    const s = p < 0.47 ? 6 - 6 * ((p - 0.4) / 0.07) : 6 * ((p - 0.47) / 0.07);
    for (let i = 0; i < PLATES; i++) h[i] = clamp01(1 - Math.abs(s - i) * 0.9);
  }
  return { rot, e, zs, h };
}
