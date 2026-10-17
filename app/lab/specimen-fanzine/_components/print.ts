/**
 * Prepress helpers (adapted from the Fanzine prototype). Pure, no DOM:
 * runs on the server once; the result ships as ONE <symbol> that every
 * halftone disc on the page reuses with <use>.
 */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

export type HalftoneLayer = { w: number; d: string };

/**
 * A shaded disc as an amplitude-modulated halftone screen. Each dot is a
 * zero-length subpath ("M x y h0") stroked with a round cap, grouped by
 * stroke width: a handful of DOM nodes instead of hundreds of <circle>.
 */
export function halftoneDisc({
  step,
  angle,
  light,
  near = 1,
  far = 0.04,
  levels = 7,
}: {
  step: number;
  angle: number;
  light: [number, number];
  near?: number;
  far?: number;
  levels?: number;
}): HalftoneLayer[] {
  const size = 400;
  const c = size / 2;
  const R = c - step * 0.75;
  const a = (angle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const lx = light[0] * size;
  const ly = light[1] * size;
  const buckets: string[][] = Array.from({ length: levels }, () => []);
  const n = Math.ceil(size / step);

  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const gx = i * step;
      const gy = j * step;
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
      w: r1(step * 1.42 * Math.sqrt((k + 1) / levels)),
      d: pts.join(""),
    }))
    .filter((l) => l.d.length > 0);
}
