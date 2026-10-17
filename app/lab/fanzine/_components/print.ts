/**
 * Pure "prepress" helpers. No DOM, no React: they run on the server for the
 * plates that ship in the HTML, and on the client only for the hidden third
 * ink (so its geometry never weighs on the first load).
 */

export const BOOT_KEY = "lab-fanzine-booted";
/** Total length of the printing sequence (loader → hero), ms. */
export const BOOT_MS = 1450;

/** mulberry32 — tiny deterministic PRNG so server output is stable. */
export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

export type HalftoneOpts = {
  /** Grid pitch in viewBox units (viewBox is 0 0 400 400). */
  step: number;
  /** Screen angle in degrees. Each ink gets its own angle, like real riso drums. */
  angle: number;
  /** Light position, 0..1 in both axes. Tone falls off away from it. */
  light: [number, number];
  /** Tone at the light point and at the farthest point. */
  near?: number;
  far?: number;
  levels?: number;
};

export type HalftoneLayer = { w: number; d: string };

/**
 * A shaded disc rendered as an amplitude-modulated halftone screen.
 * Every dot is a zero-length subpath ("M x y h0") stroked with a round cap,
 * grouped into a few stroke widths. ~9 bytes per dot instead of ~40 for <circle>,
 * and a handful of DOM nodes instead of hundreds.
 */
export function halftoneDisc(o: HalftoneOpts): HalftoneLayer[] {
  const size = 400;
  const c = size / 2;
  const R = c - o.step * 0.75;
  const a = (o.angle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const levels = o.levels ?? 8;
  const near = o.near ?? 1;
  const far = o.far ?? 0.03;
  const lx = o.light[0] * size;
  const ly = o.light[1] * size;
  const buckets: string[][] = Array.from({ length: levels }, () => []);
  const n = Math.ceil(size / o.step);

  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const gx = i * o.step;
      const gy = j * o.step;
      const x = c + gx * cos - gy * sin;
      const y = c + gx * sin + gy * cos;
      if ((x - c) ** 2 + (y - c) ** 2 > R * R) continue;
      const dist = Math.min(1, Math.hypot(x - lx, y - ly) / (size * 0.82));
      const tone = clamp(near - Math.pow(dist, 0.8) * (near - far), 0, 1);
      if (tone < 0.05) continue;
      const b = Math.min(levels - 1, Math.floor(tone * levels));
      buckets[b].push(`M${Math.round(x)} ${Math.round(y)}h0`);
    }
  }

  return buckets
    .map((pts, k) => ({
      // area ∝ tone → diameter ∝ sqrt(tone); 1.42·pitch makes dark dots merge
      w: r1(o.step * 1.42 * Math.sqrt((k + 1) / levels)),
      d: pts.join(""),
    }))
    .filter((l) => l.d.length > 0);
}

/**
 * Hand-torn paper edge. Returns two closed paths in a 1000×H box:
 * `fiber` (the white core that sticks out of a real tear) and `paper`
 * (the printed surface, which tears a little shorter).
 */
export function tornEdge(seed: number, h = 36) {
  const r = rng(seed);
  const w = 1000;
  let x = 0;
  let y = h * 0.55;
  const paper: string[] = [];
  const fiber: string[] = [];
  while (x < w) {
    x = Math.min(w, x + 3 + r() * 11);
    y = clamp(y + (r() - 0.5) * 8, 9, h - 7);
    const spike = r() < 0.18 ? (r() - 0.6) * 9 : 0;
    paper.push(`${r1(x)} ${r1(y + spike + 2.5)}`);
    fiber.push(`${r1(x)} ${r1(y + spike - 1 - r() * 4)}`);
  }
  const close = (pts: string[], start: number) =>
    `M0 ${h}L0 ${r1(start)}L${pts.join("L")}L${w} ${h}Z`;
  return { w, h, paper: close(paper, h * 0.6), fiber: close(fiber, h * 0.5) };
}
