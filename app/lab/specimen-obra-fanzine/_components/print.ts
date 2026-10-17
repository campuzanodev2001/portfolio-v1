/**
 * Prepress: pure geometry, no DOM, no React. Runs on the server for
 * everything that ships in the HTML, and on the client only for the hidden
 * third ink (so its dots never weigh on the first load).
 */

/** mulberry32: tiny deterministic PRNG, so server output is stable. */
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
  /** Screen angle in degrees. Each ink gets its own angle, like real drums. */
  angle: number;
  /** Light position, 0..1 in both axes. Tone falls off away from it. */
  light: [number, number];
  near?: number;
  far?: number;
  levels?: number;
};

export type HalftoneLayer = { w: number; d: string };

/**
 * A shaded disc as an amplitude-modulated halftone screen. Every dot is a
 * zero-length subpath ("M x y h0") stroked with a round cap, grouped into a
 * few stroke widths: a handful of DOM nodes instead of hundreds of circles.
 * (Copied from the Fanzine prototype.)
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
      w: r1(o.step * 1.42 * Math.sqrt((k + 1) / levels)),
      d: pts.join(""),
    }))
    .filter((l) => l.d.length > 0);
}

/**
 * Halftone ramp tile for section borders: one column of a 45° dot screen
 * whose dots grow from nothing to solid. Used as a CSS mask (alpha only),
 * repeated along x, so the same tile serves every ink.
 */
export function rampTile(pitch = 12, rows = 7) {
  const w = pitch;
  const h = pitch * rows;
  let d = "";
  for (let r = 0; r < rows; r++) {
    const t = (r + 1) / rows;
    // area ∝ tone: radius ∝ sqrt(tone); 0.72·pitch makes the last row merge
    const rad = r1(pitch * 0.72 * Math.sqrt(t));
    const y = r1(r * pitch + pitch / 2);
    const xs = r % 2 === 0 ? [w / 2] : [0, w];
    for (const x of xs) {
      d += `<circle cx='${r1(x)}' cy='${y}' r='${rad}'/>`;
    }
  }
  // the last half row is solid, so the next ink closes without gaps
  d += `<rect y='${h - pitch / 2}' width='${w}' height='${pitch / 2}'/>`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${d}</svg>`;
  return { w, h, url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")` };
}

/**
 * Stepped silhouettes for the pixel borders, in multiples of --u so the DOM
 * and the canvas share the same pixel.
 */
const u = (n: number) => `calc(var(--u) * ${n})`;

/** A mesa: stairs up on the left, a plateau, stairs down on the right. */
export function mesaPolygon(steps: number, sw: number, sh: number) {
  const pts: string[] = [`0 ${u(steps * sh)}`];
  for (let i = 0; i < steps; i++) {
    pts.push(`${u((i + 1) * sw)} ${u((steps - i) * sh)}`);
    pts.push(`${u((i + 1) * sw)} ${u((steps - i - 1) * sh)}`);
  }
  for (let i = steps - 1; i >= 0; i--) {
    pts.push(`calc(100% - ${u((i + 1) * sw)}) ${u((steps - i - 1) * sh)}`);
    pts.push(`calc(100% - ${u((i + 1) * sw)}) ${u((steps - i) * sh)}`);
  }
  pts.push(`100% ${u(steps * sh)}`, "100% 100%", "0 100%");
  return `polygon(${pts.join(", ")})`;
}

/** One long staircase going down from left to right, across the full width. */
export function stairPolygon(steps: number, sh: number) {
  const pts: string[] = ["0 0"];
  for (let i = 0; i < steps; i++) {
    const x = `${r1(((i + 1) * 100) / steps)}%`;
    pts.push(`${x} ${u(i * sh)}`);
    if (i < steps - 1) pts.push(`${x} ${u((i + 1) * sh)}`);
  }
  pts.push("100% 100%", "0 100%");
  return `polygon(${pts.join(", ")})`;
}

/** A rectangle whose four corners are cut as pixel stairs (n steps of s u). */
export function notchPolygon(n: number, s: number) {
  const W = (k: number) => `calc(100% - ${u(k * s)})`;
  const pts: string[] = [`0 ${u(n * s)}`];
  for (let i = 0; i < n; i++) {
    pts.push(`${u((i + 1) * s)} ${u((n - i) * s)}`, `${u((i + 1) * s)} ${u((n - i - 1) * s)}`);
  }
  pts.push(`${W(n)} 0`);
  for (let i = 0; i < n; i++) {
    pts.push(`${W(n - i)} ${u((i + 1) * s)}`, `${W(n - i - 1)} ${u((i + 1) * s)}`);
  }
  const H = (k: number) => `calc(100% - ${u(k * s)})`;
  pts.push(`100% ${H(n)}`);
  for (let i = 0; i < n; i++) {
    pts.push(`${W(i + 1)} ${H(n - i)}`, `${W(i + 1)} ${H(n - i - 1)}`);
  }
  pts.push(`${u(n * s)} 100%`);
  for (let i = 0; i < n; i++) {
    pts.push(`${u((n - i) * s)} ${H(i + 1)}`, `${u((n - i - 1) * s)} ${H(i + 1)}`);
  }
  return `polygon(${pts.map((p) => p.replace("calc(100% - calc(var(--u) * 0))", "100%")).join(", ")})`;
}

/** The ink drum's misregistration: re-rolled by the registration marks. */
export function rollRegistration() {
  const pick = (m: number, lo: number) => {
    const v = lo + Math.random() * (m - lo);
    return Math.round((Math.random() < 0.5 ? -v : v) * 10) / 10;
  };
  return { x: pick(6, 1.5), y: pick(4, 1), r: pick(0.4, 0.05) };
}
