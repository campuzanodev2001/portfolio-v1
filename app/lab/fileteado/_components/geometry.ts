/*
 * Fileteado generativo — geometría.
 *
 * Primitiva única: la "pincelada" (pincel de pelo largo). Una curva cuya
 * curvatura crece con la longitud (k(s) = k0 + c·(s/L)^p, tipo clotoide) y
 * que se rellena con un ancho variable a cada lado. Con mucha curvatura
 * final es una voluta; con poca y lóbulos a un costado, una hoja de acanto.
 * Todo se espeja después (simetría diagonal en las esquinas).
 *
 * Sin dependencias, sin DOM: corre igual en el server y en el cliente.
 */

export type P = [number, number];

/* ---------- azar con semilla ---------- */

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Rand = () => number;
const between = (r: Rand, a: number, b: number) => a + (b - a) * r();

/* ---------- paleta ---------- */

/** [sombra, base, luz] — tres tonos planos, como el esmalte sintético. */
export type Tone = readonly [string, string, string];

export const TONES = {
  rojo: ["#7a1610", "#c9322a", "#f2735a"],
  oro: ["#94540f", "#e0a02e", "#ffd97e"],
  celeste: ["#1f5a8c", "#57a4dc", "#bfe3fb"],
  verde: ["#15492b", "#2c8650", "#8bd193"],
} as const satisfies Record<string, Tone>;

export type ToneName = keyof typeof TONES;
export const CREMA = "#fff1d2";

/* ---------- números compactos ---------- */

const f = (n: number) => {
  const v = Math.round(n * 10) / 10;
  return Object.is(v, -0) ? "0" : String(v);
};
const pt = (p: P) => `${f(p[0])},${f(p[1])}`;

/* ---------- espina (clotoide generalizada) ---------- */

export interface Spine {
  x: Float64Array;
  y: Float64Array;
  a: Float64Array;
  steps: number;
  len: number;
}

/**
 * Integra una curva desde (x0,y0) con ángulo a0. La curvatura arranca en k0
 * y crece como (s/L)^p hasta acumular `turn` radianes de giro total.
 */
export function spine(
  x0: number,
  y0: number,
  a0: number,
  len: number,
  k0: number,
  turn: number,
  p: number,
  steps = 220,
): Spine {
  const c = ((turn - k0 * len) * (p + 1)) / len;
  const ds = len / steps;
  const x = new Float64Array(steps + 1);
  const y = new Float64Array(steps + 1);
  const a = new Float64Array(steps + 1);
  let cx = x0;
  let cy = y0;
  let ca = a0;
  for (let i = 0; i <= steps; i++) {
    x[i] = cx;
    y[i] = cy;
    a[i] = ca;
    const s = (i + 0.5) * ds;
    const k = k0 + c * Math.pow(s / len, p);
    const mid = ca + (k * ds) / 2;
    cx += Math.cos(mid) * ds;
    cy += Math.sin(mid) * ds;
    ca += k * ds;
  }
  return { x, y, a, steps, len };
}

/** Punto, ángulo y normal en la fracción u ∈ [0,1] de la espina. */
export function at(sp: Spine, u: number) {
  const i = Math.max(0, Math.min(sp.steps, Math.round(u * sp.steps)));
  const a = sp.a[i];
  return { p: [sp.x[i], sp.y[i]] as P, a, n: [-Math.sin(a), Math.cos(a)] as P };
}

/* ---------- Catmull-Rom → Bézier ---------- */

function smooth(pts: P[]) {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}

/** Fracciones de muestreo, más densas hacia el final (donde enrosca). */
function samples(n: number, warp: number, u0 = 0, u1 = 1) {
  const out: number[] = [];
  for (let j = 0; j <= n; j++) {
    const t = j / n;
    out.push(u0 + (u1 - u0) * (1 - Math.pow(1 - t, warp)));
  }
  return out;
}

/**
 * Banda entre dos desplazamientos laterales (a ≤ b, en unidades absolutas,
 * negativo = lado izquierdo de la marcha). Devuelve un path cerrado.
 */
function band(
  sp: Spine,
  us: number[],
  edges: (u: number) => [number, number],
  roundStart = false,
) {
  const L: P[] = [];
  const R: P[] = [];
  for (const u of us) {
    const { p, n } = at(sp, u);
    const [ea, eb] = edges(u);
    L.push([p[0] + n[0] * ea, p[1] + n[1] * ea]);
    R.push([p[0] + n[0] * eb, p[1] + n[1] * eb]);
  }
  R.reverse();
  const r0 = Math.hypot(L[0][0] - R[R.length - 1][0], L[0][1] - R[R.length - 1][1]) / 2;
  const cap = roundStart && r0 > 0.4 ? `A${f(r0)},${f(r0)} 0 0 1 ${pt(L[0])}` : "Z";
  return `M${pt(L[0])}${smooth(L)}L${pt(R[0])}${smooth(R)}${cap === "Z" ? "Z" : cap + "Z"}`;
}

/** Línea central (para la máscara que "pinta" la pincelada). */
function centerline(sp: Spine, n = 18, u1 = 1) {
  const pts = samples(n, 1.5, 0, u1).map((u) => at(sp, u).p);
  return `M${pt(pts[0])}${smooth(pts)}`;
}

/* ---------- piezas ---------- */

export interface Layer {
  d: string;
  fill: string;
}

/** Una pieza se revela pintando su máscara (trazo blanco grueso por la espina). */
export interface Piece {
  id: string;
  mask: { d: string; w: number };
  layers: Layer[];
  /** retardo y duración (ms) de la pincelada durante la intro */
  delay: number;
  dur: number;
}

/** Voluta: pincelada con cabeza y cola afinada. Tres tonos + filete de luz. */
export function volute(
  id: string,
  sp: Spine,
  W: number,
  tone: Tone,
  delay: number,
  dur: number,
  opts: { filete?: { offset: number; color: string; u1: number } } = {},
): Piece {
  const hw = (u: number) =>
    (W / 2) * (0.5 + 0.5 * Math.sin((Math.min(u / 0.16, 1) * Math.PI) / 2)) * Math.pow(1 - u, 0.8);
  const us = samples(26, 1.7);
  const layers: Layer[] = [
    { d: band(sp, us, (u) => [-hw(u), hw(u)], true), fill: tone[0] },
    { d: band(sp, us, (u) => [-hw(u) * 0.96, hw(u) * 0.3]), fill: tone[1] },
    { d: band(sp, us, (u) => [-hw(u) * 0.86, -hw(u) * 0.3]), fill: tone[2] },
    {
      d: band(sp, samples(20, 1.6, 0.03, 0.93), (u) => {
        const c = -hw(u) * 0.62;
        const t = Math.max(0.55, hw(u) * 0.11);
        return [c - t, c + t];
      }),
      fill: CREMA,
    },
  ];
  let maskW = W * 1.08 + 1;
  if (opts.filete) {
    const { offset, color, u1 } = opts.filete;
    layers.unshift({
      d: band(sp, samples(20, 1.4, 0.02, u1), (u) => {
        const o = hw(u) + offset;
        const t = 0.75 * (1 - u / u1) + 0.25;
        return [o - t, o + t];
      }),
      fill: color,
    });
    maskW = 2 * (W / 2 + offset + 2);
  }
  return { id, mask: { d: centerline(sp), w: maskW }, layers, delay, dur };
}

/** Hoja de acanto: espina que enrosca en la punta, lóbulos del lado convexo. */
export function leaf(
  id: string,
  sp: Spine,
  W: number,
  side: 1 | -1,
  lobes: number,
  tone: Tone,
  delay: number,
  dur: number,
): Piece {
  const env = (u: number) => Math.pow(Math.sin(Math.PI * Math.pow(Math.min(u, 0.999), 0.72)), 0.85);
  const bump = (u: number) => {
    const v = (u - 0.06) / 0.8;
    if (v <= 0 || v >= 1) return 0.35;
    const fr = (v * lobes) % 1;
    return Math.pow(Math.sin(Math.PI * fr), 0.5) * (0.5 + 0.5 * fr);
  };
  const outer = (u: number) => (W / 2) * env(u) * (0.32 + 0.68 * bump(u));
  const inner = (u: number) => (W / 2) * env(u) * 0.36;
  // uniforme para que cada lóbulo tenga sus muestras
  const us = samples(lobes * 9 + 6, 1.15);
  const e = (o: number, i: number) => (u: number): [number, number] => {
    const a = -inner(u) * i;
    const b = outer(u) * o;
    return side === 1 ? [a, b] : [-b, -a];
  };
  const vein = (u: number): [number, number] => {
    const c = -inner(u) * 0.12 * side;
    const t = Math.max(0.5, inner(u) * 0.14);
    return [c - t, c + t];
  };
  const layers: Layer[] = [
    { d: band(sp, us, e(1, 1)), fill: tone[0] },
    { d: band(sp, us, e(0.7, 0.62)), fill: tone[1] },
    { d: band(sp, us, e(0.38, 0.3)), fill: tone[2] },
    { d: band(sp, samples(18, 1.3, 0.04, 0.9), vein), fill: CREMA },
  ];
  return { id, mask: { d: centerline(sp, 20), w: W * 1.15 + 2 }, layers, delay, dur };
}

/** Rombo facetado ("piedra"): cuatro facetas en tonos + mesa + brillo. */
export function gem(cx: number, cy: number, a: number, b: number, tone: Tone, rot = 0) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const T = (x: number, y: number): P => [cx + x * c - y * s, cy + x * s + y * c];
  const k = 0.46;
  const O = [T(0, -b), T(a, 0), T(0, b), T(-a, 0)];
  const I = [T(0, -b * k), T(a * k, 0), T(0, b * k), T(-a * k, 0)];
  const poly = (ps: P[]) => `M${ps.map(pt).join("L")}Z`;
  const glint = T(-a * 0.16, -b * 0.18);
  return {
    outline: poly(O),
    facets: [
      { d: poly([O[3], O[0], I[0], I[3]]), fill: tone[2] },
      { d: poly([O[0], O[1], I[1], I[0]]), fill: tone[1] },
      { d: poly([O[1], O[2], I[2], I[1]]), fill: tone[0] },
      { d: poly([O[2], O[3], I[3], I[2]]), fill: tone[1] },
      { d: poly(I), fill: tone[1] },
    ] as Layer[],
    glint: { cx: glint[0], cy: glint[1], r: Math.max(0.8, Math.min(a, b) * 0.12) },
  };
}

/* ---------- composiciones ---------- */

export interface Pearl {
  cx: number;
  cy: number;
  r: number;
  fill: string;
}

export interface Half {
  pieces: Piece[];
  pearls: Pearl[];
  pearlDelay: number;
}

export type HostSpine = [number, number, number, number, number, number, number];

export interface Ornament {
  host: HostSpine;
  half: Half;
  corner: ReturnType<typeof gem>;
  unit: { pieces: Piece[]; gem: ReturnType<typeof gem> };
  side: ReturnType<typeof gem>;
  palette: { main: ToneName; leaf: ToneName; spiral: ToneName; gem: ToneName };
}

/**
 * Media esquina en un cuadrado de 200×200 con la esquina en (0,0).
 * Vive del lado "de arriba" de la diagonal; la otra mitad es su reflejo.
 */
export function generate(seed: number): Ornament {
  const r = rng(seed);
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

  const main = pick(["oro", "rojo", "celeste"] as const);
  const leafT = pick((["verde", "rojo"] as const).filter((t) => t !== main));
  const spiralT = pick(
    (["celeste", "oro", "rojo"] as const).filter((t) => t !== main && t !== leafT),
  );
  const gemT = pick((["rojo", "celeste", "verde"] as const).filter((t) => t !== leafT && t !== main));

  const pieces: Piece[] = [];

  // 1 · voluta madre: corre pegada al borde y enrosca al final, tipo "C"
  const host: HostSpine = [36, 22, between(r, -0.08, -0.03), between(r, 198, 208), 0.001, between(r, 9.3, 9.9), between(r, 5, 5.6)];
  const mainSp = spine(...host);
  pieces.push(
    volute("v0", mainSp, between(r, 15, 17), TONES[main], 60, 640, {
      filete: { offset: 3.4, color: CREMA, u1: 0.7 },
    }),
  );

  // 2 · hoja de acanto: nace al pie de la voluta, se abre hacia el centro
  //     y enrosca la punta de vuelta (la "S" de la hoja)
  const base = at(mainSp, between(r, 0.07, 0.1));
  const leafSp = spine(
    base.p[0] + base.n[0] * 9,
    base.p[1] + base.n[1] * 9,
    base.a + between(r, 0.72, 0.86),
    between(r, 98, 112),
    between(r, 0.002, 0.006),
    -between(r, 4.6, 5.4),
    3.6,
  );
  pieces.push(leaf("l0", leafSp, between(r, 34, 40), -1, 3 + Math.floor(r() * 2), TONES[leafT], 260, 580));

  // 3 · contra-voluta: brota de abajo del rulo y enrosca al revés
  const sp2 = at(mainSp, between(r, 0.5, 0.56));
  const spiralSp = spine(
    sp2.p[0] + sp2.n[0] * 4,
    sp2.p[1] + sp2.n[1] * 4,
    sp2.a + between(r, 1.85, 2.05),
    between(r, 62, 72),
    0.004,
    -between(r, 7.4, 8.2),
    3,
  );
  pieces.push(volute("v1", spiralSp, between(r, 9, 10.5), TONES[spiralT], 520, 460));

  // perlas sobre el eje de simetría, decrecientes hacia adentro
  const pearls: Pearl[] = [0, 1, 2].map((i) => {
    const d = 84 + i * 10.5 - i * i;
    return { cx: d, cy: d, r: 3.6 - i * 1.05, fill: i === 0 ? TONES[spiralT][1] : CREMA };
  });

  // remate de guarda (unidad 120×48, centro en 60,24): rombo + dos volutas espejadas
  const unitSp = spine(67, 25, between(r, 0.08, 0.18), 56, 0.0, -between(r, 6.8, 7.4), 2.4);
  const unitPiece = volute("u0", unitSp, 8, TONES[main], 560, 460);

  return {
    half: { pieces, pearls, pearlDelay: 820 },
    host,
    corner: gem(31, 31, 23, 11.5, TONES[gemT], Math.PI / 4),
    unit: { pieces: [unitPiece], gem: gem(60, 24, 7.5, 13, TONES[gemT]) },
    side: gem(0, 0, 8, 14, TONES[gemT]),
    palette: { main, leaf: leafT, spiral: spiralT, gem: gemT },
  };
}

/** Lugares (fracción de la voluta madre) donde puede brotar algo al hacer click. */
export const SPROUT_SLOTS = [0.2, 0.29, 0.38, 0.47, 0.56] as const;

/**
 * Brote (florecimiento al hacer click): un zarcillo —rulito fino— o una
 * hojita, del lado de afuera de la voluta madre, en un lugar fijo (`slot`)
 * para que nunca se enreden. La forma exacta es azar libre.
 */
export function sprout(hostSpine: HostSpine, slot: number, seed: number, n: number): Piece[] {
  const r = rng(seed);
  const host = spine(...hostSpine);
  const b = at(host, SPROUT_SLOTS[slot] + between(r, -0.015, 0.015));
  const ox = b.p[0] - b.n[0] * 7;
  const oy = b.p[1] - b.n[1] * 7;
  const tones: ToneName[] = ["rojo", "oro", "celeste", "verde"];
  const tone = TONES[tones[Math.floor(r() * tones.length)]];
  if (r() < 0.6) {
    const sp = spine(ox, oy, b.a - between(r, 0.9, 1.25), between(r, 26, 34), 0.01, between(r, 6.4, 7.4), 2.4);
    return [volute(`s${n}`, sp, between(r, 4.8, 5.6), tone, 0, 520)];
  }
  const sp = spine(ox, oy, b.a - between(r, 0.7, 1), between(r, 24, 30), -0.01, between(r, 2.6, 3.4), 3);
  return [leaf(`s${n}`, sp, between(r, 9, 11), 1, 2, tone === TONES.verde ? TONES.rojo : TONES.verde, 0, 520)];
}
