/**
 * Clawd — motor del loop.
 *
 * Todo es una función pura del tiempo: `draw(ctx, t)` con t ∈ [0, T).
 * No hay estado acumulado, así que el frame en t = T es idéntico al de t = 0
 * y el loop no tiene salto. El lienzo lógico es de W×H píxeles; el CSS lo
 * escala por un múltiplo entero (pixel art nítido).
 */

export const W = 128;
export const H = 84;
/** Duración del ciclo, en segundos. Todos los períodos internos lo dividen. */
export const T = 16;
/** Frame quieto para prefers-reduced-motion: hero completo, recién arreglado. */
export const STILL_T = 11.8;

const FLOOR = 76; // fila donde apoyan los pies (exclusiva)
const PAGE = { x: 16, y: 4, w: 96, h: 50 };
const SHIP = 136; // desplazamiento de la cinta (múltiplo de 8 = patrón del piso)

type Kind = "title" | "sub" | "btn";
type Rect = { x: number; y: number; w: number; h: number };

const SLOT: Record<Kind, Rect> = {
  title: { x: 22, y: 14, w: 84, h: 11 },
  sub: { x: 40, y: 29, w: 48, h: 3 },
  btn: { x: 50, y: 37, w: 28, h: 10 },
};

const C = {
  bg: "#1d1b18",
  floor: "#24211d",
  floorLine: "#3a352e",
  floorTick: "#57503f",
  shadow: "#12100e",
  page: "#efeae0",
  pageEdge: "#d6cdbd",
  bar: "#e2dacb",
  wire: "#b9ad98",
  ink: "#2a2622",
  cream: "#f3efe6",
  sub: "#a39b8e",
  coral: "#d97757",
  coralDark: "#ad5a3f",
  coralLight: "#f2ad8e",
  coralMuted: "#dcb6a4",
  eye: "#1b1a18",
  sel: "#5fa8e8",
  sweat: "#9fd3f2",
  spark: "#ffe2cf",
  heart: "#ff8a7a",
  dots: ["#d97757", "#e2b14d", "#8db872"],
};

/* ------------------------------------------------------------------ util */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const within = (t: number, a: number, b: number) => t >= a && t < b;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const inOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const outCubic = (p: number) => 1 - Math.pow(1 - p, 3);
function outBounce(p: number) {
  const n = 7.5625;
  const d = 2.75;
  if (p < 1 / d) return n * p * p;
  if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
  if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
  return n * (p -= 2.625 / d) * p + 0.984375;
}
/** Ruido determinista 0..1 por píxel: el "dither" de generación es siempre igual. */
function hash(x: number, y: number, s: number) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1274126177);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
const hop = (t: number, a: number, b: number, h: number) =>
  within(t, a, b) ? Math.sin(Math.PI * prog(t, a, b)) * h : 0;

/* -------------------------------------------------------------- bitmaps */

type Px = (string | null)[][];
type Bitmap = { w: number; h: number; px: Px; canvas: HTMLCanvasElement };

// Fuente 4×5 (I y M con otro ancho), solo las letras del nombre.
const FONT: Record<string, string[]> = {
  D: ["1110", "1001", "1001", "1001", "1110"],
  A: ["0110", "1001", "1111", "1001", "1001"],
  N: ["1001", "1101", "1011", "1001", "1001"],
  I: ["111", "010", "010", "010", "111"],
  E: ["1111", "1000", "1110", "1000", "1111"],
  L: ["1000", "1000", "1000", "1000", "1111"],
  C: ["0111", "1000", "1000", "1000", "0111"],
  M: ["10001", "11011", "10101", "10001", "10001"],
  P: ["1110", "1001", "1110", "1000", "1000"],
  U: ["1001", "1001", "1001", "1001", "0110"],
  Z: ["1111", "0001", "0110", "1000", "1111"],
  O: ["0110", "1001", "1001", "1001", "0110"],
  " ": ["00", "00", "00", "00", "00"],
};
const ENVELOPE = ["111111111", "110000011", "101000101", "100111001", "111111111"];
const HEART = ["11011", "11111", "01110", "00100"];

function grid(w: number, h: number, fill: string | null): Px {
  return Array.from({ length: h }, () => Array<string | null>(w).fill(fill));
}
function stamp(px: Px, rows: string[], x: number, y: number, color: string) {
  rows.forEach((r, j) =>
    [...r].forEach((c, i) => {
      if (c === "1" && px[y + j] && x + i < px[0].length) px[y + j][x + i] = color;
    }),
  );
}
function roundCorners(px: Px) {
  const h = px.length;
  const w = px[0].length;
  px[0][0] = px[0][w - 1] = px[h - 1][0] = px[h - 1][w - 1] = null;
}
function toBitmap(px: Px): Bitmap {
  const h = px.length;
  const w = px[0].length;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;
  px.forEach((row, y) =>
    row.forEach((c, x) => {
      if (c) {
        g.fillStyle = c;
        g.fillRect(x, y, 1, 1);
      }
    }),
  );
  return { w, h, px, canvas };
}

function textWidth(s: string) {
  return [...s].reduce((a, ch) => a + FONT[ch][0].length + 1, -1);
}

function buildBitmaps() {
  const name = "DANIEL CAMPUZANO";
  const t = grid(SLOT.title.w, SLOT.title.h, C.ink);
  let cx = Math.floor((SLOT.title.w - textWidth(name)) / 2);
  for (const ch of name) {
    stamp(t, FONT[ch], cx, 3, C.cream);
    cx += FONT[ch][0].length + 1;
  }
  roundCorners(t);

  // Subtítulo: "Fullstack Developer" en gris + el tramo coral de la IA.
  const s = grid(SLOT.sub.w, SLOT.sub.h, null);
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 48; x++) s[y][x] = x < 32 ? C.sub : x < 34 ? null : C.coral;
  s[0][0] = s[2][0] = s[0][47] = s[2][47] = null;

  const btn = (lit: boolean) => {
    const b = grid(SLOT.btn.w, SLOT.btn.h, lit ? C.coral : C.coralMuted);
    for (let x = 0; x < SLOT.btn.w; x++) b[SLOT.btn.h - 1][x] = lit ? C.coralDark : C.wire;
    if (lit) stamp(b, ENVELOPE, 9, 2, C.cream);
    roundCorners(b);
    return toBitmap(b);
  };

  return {
    title: toBitmap(t),
    sub: toBitmap(s),
    btnOff: btn(false),
    btnOn: btn(true),
  };
}

/* ------------------------------------------------------------ timeline */

// Posición x de Clawd: [tiempo, x]. Empieza y termina en 64 → loop sin salto.
const XS: [number, number][] = [
  [0, 64], [1.55, 64], [2.05, 44], [2.65, 44], [3.25, 64],
  [4.05, 64], [4.45, 92], [4.85, 92], [5.35, 64], [T, 64],
];
function xAt(t: number) {
  for (let i = 0; i < XS.length - 1; i++) {
    const [a, xa] = XS[i];
    const [b, xb] = XS[i + 1];
    if (t >= a && t < b) return lerp(xa, xb, inOut(prog(t, a, b)));
  }
  return 64;
}

const WALKS: [number, number][] = [
  [1.55, 2.05], [2.65, 3.25], [4.05, 4.45], [4.85, 5.35], [12.9, 14.6],
];
const SHIP_AT: [number, number] = [12.9, 14.6];

type Eyes = "open" | "closed" | "happy" | "wide" | "wink";
type Arms = "down" | "up" | "tap";
type Pose = {
  x: number;
  lift: number;
  sx: number;
  sy: number;
  face: 1 | -1;
  walking: boolean;
  eyes: Eyes;
  lookX: number;
  lookY: number;
  arms: Arms;
  bang: boolean;
  sweat: boolean;
};

function poseAt(t: number): Pose {
  const x = xAt(t);
  const face: 1 | -1 = within(t, 1.55, 2.65) || within(t, 4.45, 5.35) ? -1 : 1;
  const walking = WALKS.some(([a, b]) => within(t, a, b));

  const lift =
    hop(t, 3.45, 3.75, 3) + hop(t, 5.5, 5.75, 2) + hop(t, 6.45, 6.65, 2) +
    hop(t, 7.35, 7.6, 3) + hop(t, 7.6, 7.85, 3) + hop(t, 8.05, 8.4, 12);

  // Squash & stretch: [desde, hasta, sx, sy]. El primero que matchea gana.
  const SQ: [number, number, number, number][] = [
    [3.25, 3.45, 1, -2], [5.35, 5.5, 1, -1], [6.3, 6.45, 1, -1], [7.9, 8.05, 1, -2], // anticipación
    [3.45, 3.6, -1, 1], [5.5, 5.6, -1, 1], [6.45, 6.55, -1, 1], [8.05, 8.25, -1, 2], // estiramiento
    [8.4, 8.55, 2, -2], [8.55, 8.65, 1, -1], // aterrizaje fuerte
    [2.3, 3.25, 1, -1], // carga el título: pesa
  ];
  let sx = 0;
  let sy = 0;
  const sq = SQ.find(([a, b]) => within(t, a, b));
  if (sq) {
    sx = sq[2];
    sy = sq[3];
  } else if ((within(t, 1.3, 1.55) && within(prog(t, 1.3, 1.55), 0.25, 0.75)) ||
    (within(t, 10.0, 10.3) && within(prog(t, 10.0, 10.3), 0.25, 0.75))) {
    sy = -1; // asiente
  } else if (!walking && lift === 0) {
    sy = Math.floor(t / 0.8) % 2 === 1 ? -1 : 0; // respira (período 1.6 s, divide T)
  }

  let eyes: Eyes = "open";
  if (within(t, 0.2, 0.32) || within(t, 12.5, 12.62) || within(t, 15.3, 15.42) || within(t, 5.9, 6.0)) eyes = "closed";
  if (within(t, 7.35, 7.9) || within(t, 11.6, 12.4)) eyes = "happy";
  if (within(t, 8.55, 9.6)) eyes = "wide";

  let lookY = 0;
  if (within(t, 0.4, 1.3) || within(t, 9.1, 10.0) || within(t, 12.0, 12.8)) lookY = 1; // lee el prompt
  if (within(t, 2.05, 2.65) || within(t, 6.95, 7.35) || within(t, 8.75, 9.1) || within(t, 10.3, 11.3)) lookY = -1;

  let arms: Arms = "down";
  if (within(t, 2.05, 3.45) || within(t, 4.45, 5.5) || within(t, 6.0, 6.45) || within(t, 10.3, 11.3)) arms = "up";
  if (within(t, 6.95, 7.35)) arms = "tap";

  return {
    x, lift, sx, sy, face, walking, eyes, lookX: face, lookY, arms,
    bang: within(t, 8.6, 9.3),
    sweat: within(t, 9.0, 9.6) || within(t, 11.6, 12.0),
  };
}

/* ---------------------------------------------------------------- despertar */

/**
 * Loader: Clawd se despierta (el reverso del final de la página, donde se
 * duerme sobre el punto del CRT). Es un prefijo del loop: w ∈ [0, WAKE) y el
 * último estado es exactamente poseAt(0) — mismo x, ojos abiertos, sin squash.
 */
export const WAKE = 2.4;

function wakePoseAt(w: number): Pose {
  const p = poseAt(0);
  p.lookY = 0;
  if (w < 1.6) {
    // Dormido: aplastado y ancho, respira lento.
    p.sx = 1;
    p.sy = Math.floor(w / 0.8) % 2 ? -3 : -2;
    p.eyes = w < 1.0 ? "closed" : w < 1.2 ? "wink" : w < 1.35 ? "closed" : "open";
    p.bang = within(w, 1.4, 1.75);
  } else if (w < 1.85) {
    // Se estira: brazos arriba, más alto y finito, ojos cerrados (bosteza).
    p.arms = "up";
    p.sx = -1;
    p.sy = 2;
    p.eyes = "closed";
  } else if (w < 2.0) {
    // Se sacude.
    p.x += Math.floor(w / 0.04) % 2 ? 1 : -1;
    p.sy = -1;
  } else {
    p.lift = hop(w, 2.0, 2.3, 4);
    if (within(w, 2.3, 2.38)) p.sy = -1; // aterriza
  }
  return p;
}

const WAKE_PROMPT: [number, number, number, number, string] = [0.45, 1.0, 2.0, WAKE, "despertá"];
export function wakePromptAt(w: number) {
  const [a, b, ok, end, s] = WAKE_PROMPT;
  if (w < a || w >= end) return "";
  return s.slice(0, Math.round(prog(w, a, b) * s.length)) + (w >= ok ? "  ✓" : "");
}

const ZED = ["1111", "0010", "0100", "1111"];

/** Geometría del cuerpo para una pose (la usan el dibujo y los bloques en mano). */
function body(p: Pose) {
  const bw = 12 + 2 * p.sx;
  const bh = 7 + p.sy;
  const legH = p.sy <= -2 ? 1 : 2;
  const foot = FLOOR - Math.round(p.lift);
  const bottom = foot - legH;
  const top = bottom - bh;
  const cx = Math.round(p.x);
  return { bw, bh, legH, foot, bottom, top, cx, left: cx - bw / 2 };
}

type BlockState =
  | { mode: "none" }
  | { mode: "gen" | "held" | "fly"; x: number; y: number; p: number }
  | { mode: "placed"; y: number; tilt: number };

const BT: Record<Kind, { gen: [number, number]; toss: number; fly: number; settle: number }> = {
  title: { gen: [2.05, 2.65], toss: 3.45, fly: 3.85, settle: 4.05 },
  sub: { gen: [4.45, 4.85], toss: 5.5, fly: 5.85, settle: 6.0 },
  btn: { gen: [6.0, 6.3], toss: 6.45, fly: 6.8, settle: 6.95 },
};

function heldPos(k: Kind, t: number) {
  const b = body(poseAt(t));
  return { x: Math.round(b.cx - SLOT[k].w / 2), y: b.top - 2 - SLOT[k].h };
}

function titleTilt(t: number) {
  if (t < 8.4 || t >= 11.3) return 0;
  if (t < 8.75) return 5 * outBounce(prog(t, 8.4, 8.75)); // se cae la punta derecha
  if (t < 10.7) return 5;
  if (t < 11.2) return lerp(5, -1, outCubic(prog(t, 10.7, 11.2))); // lo endereza (con overshoot)
  return lerp(-1, 0, prog(t, 11.2, 11.3));
}

function blockAt(k: Kind, t: number): BlockState {
  const s = BT[k];
  const slot = SLOT[k];
  if (t < s.gen[0]) return { mode: "none" };
  if (t < s.gen[1]) return { mode: "gen", ...heldPos(k, t), p: prog(t, s.gen[0], s.gen[1]) };
  if (t < s.toss) return { mode: "held", ...heldPos(k, t), p: 1 };
  if (t < s.fly) {
    const o = heldPos(k, s.toss);
    const p = outCubic(prog(t, s.toss, s.fly));
    return { mode: "fly", x: lerp(o.x, slot.x, p), y: lerp(o.y, slot.y - 3, p), p };
  }
  if (t < s.settle)
    return { mode: "placed", y: slot.y - 3 * (1 - outBounce(prog(t, s.fly, s.settle))), tilt: 0 };
  return { mode: "placed", y: slot.y, tilt: k === "title" ? titleTilt(t) : 0 };
}

/* ---------------------------------------------------------------- texto */

const PROMPTS: [number, number, number, number, string][] = [
  // [empieza a tipear, termina, ✓ desde, se borra, texto]
  [0.3, 1.3, 7.2, 8.6, "armá el hero"],
  [9.1, 10.0, 11.3, 12.0, "alineá el título"],
  [12.0, 12.8, 14.6, 15.0, "deploy"],
];
export function promptAt(t: number) {
  for (const [a, b, ok, end, s] of PROMPTS) {
    if (t >= a && t < end) {
      const n = Math.round(prog(t, a, b) * s.length);
      return s.slice(0, n) + (t >= ok ? "  ✓" : "");
    }
  }
  return "";
}

/** Señal para el h1 real: brillo cuando el título encaja, inclinación cuando se golpea. */
export function beatAt(t: number) {
  if (within(t, 3.85, 5.25)) return "title";
  if (within(t, 7.2, 8.4)) return "cta";
  if (within(t, 8.4, 11.2)) return "knock";
  return "";
}

/* ---------------------------------------------------------------- dibujo */

type Ctx = CanvasRenderingContext2D;
export type DrawOpts = {
  /** Hacia dónde está el CTA si el usuario lo está apuntando. */
  point: { dx: number; dy: number } | null;
  /** Segundos desde el último click en Clawd (grande = sin reacción). */
  react: number;
};

function px(g: Ctx, color: string, x: number, y: number, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

function dotted(g: Ctx, r: Rect, color: string, phase = 0, period = 2, on = 1) {
  g.fillStyle = color;
  const pts: [number, number][] = [];
  for (let x = 0; x < r.w; x++) pts.push([r.x + x, r.y]);
  for (let y = 1; y < r.h; y++) pts.push([r.x + r.w - 1, r.y + y]);
  for (let x = r.w - 2; x >= 0; x--) pts.push([r.x + x, r.y + r.h - 1]);
  for (let y = r.h - 2; y > 0; y--) pts.push([r.x, r.y + y]);
  pts.forEach(([x, y], i) => {
    if ((i + phase) % period < on) g.fillRect(x, y, 1, 1);
  });
}

function drawBitmap(g: Ctx, b: Bitmap, x: number, y: number, tilt = 0, mask = -1, seed = 1) {
  x = Math.round(x);
  y = Math.round(y);
  if (mask >= 0) {
    // Generación: los píxeles aparecen en orden de ruido; el borde brilla.
    for (let j = 0; j < b.h; j++)
      for (let i = 0; i < b.w; i++) {
        const c = b.px[j][i];
        if (!c) continue;
        const h = hash(i, j, seed);
        if (h < mask) px(g, c, x + i, y + j);
        else if (h < mask + 0.07) px(g, C.spark, x + i, y + j);
      }
    return;
  }
  if (tilt === 0) {
    g.drawImage(b.canvas, x, y);
    return;
  }
  // "Rotación" pixel-art: cizalla por columnas, pivote en la izquierda.
  for (let i = 0; i < b.w; i++) {
    const dy = Math.round((tilt * i) / (b.w - 1));
    g.drawImage(b.canvas, i, 0, 1, b.h, x + i, y + dy, 1, b.h);
  }
}

function dust(g: Ctx, t: number, t0: number, x: number, y: number, spread: number) {
  if (!within(t, t0, t0 + 0.3)) return;
  const p = prog(t, t0, t0 + 0.3);
  const dx = Math.round(p * spread);
  const dy = Math.round(Math.sin(Math.PI * p) * 2);
  const col = p < 0.6 ? C.wire : C.floorTick;
  px(g, col, x - 1 - dx, y - dy);
  px(g, col, x + 1 + dx, y - dy);
  px(g, col, x - 2 - dx, y - dy + 1);
  px(g, col, x + 2 + dx, y - dy + 1);
}

type Bitmaps = ReturnType<typeof buildBitmaps>;

function drawPage(g: Ctx, bm: Bitmaps, t: number, ox: number, content: boolean) {
  const x = PAGE.x + ox;
  const { y, w, h } = PAGE;
  if (x > W || x + w < 0) return;
  px(g, C.pageEdge, x, y, w, h);
  px(g, C.page, x + 1, y + 1, w - 2, h - 2);
  px(g, C.bar, x + 1, y + 1, w - 2, 5);
  C.dots.forEach((c, i) => px(g, c, x + 4 + i * 4, y + 3, 2, 1));
  px(g, C.page, x + 34, y + 3, 28, 1);
  // esquinas redondeadas
  [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]].forEach(([cx, cy]) => px(g, C.bg, cx, cy));

  (Object.keys(SLOT) as Kind[]).forEach((k) => {
    const slot = SLOT[k];
    const s = content ? blockAt(k, t) : ({ mode: "none" } as BlockState);
    if (s.mode === "placed") {
      const b = k === "title" ? bm.title : k === "sub" ? bm.sub : t >= 7.2 ? bm.btnOn : bm.btnOff;
      drawBitmap(g, b, slot.x + ox, s.y, s.tilt);
    } else {
      dotted(g, { ...slot, x: slot.x + ox }, C.wire);
    }
  });

  if (!content) return;

  // El CTA se "conecta": destello y halo.
  if (within(t, 7.2, 7.9) && Math.floor(t / 0.1) % 2 === 0) {
    const r = SLOT.btn;
    dotted(g, { x: r.x - 1 + ox, y: r.y - 1, w: r.w + 2, h: r.h + 2 }, C.coralLight, 0, 1, 1);
  }

  // Selección (lo que Daniel pide alinear): marching ants + handles.
  if (within(t, 10.3, 11.6) && !(t > 11.3 && Math.floor(t / 0.08) % 2 === 0)) {
    const r = SLOT.title;
    const d = Math.max(0, Math.round(titleTilt(t)));
    const box = { x: r.x - 2 + ox, y: r.y - 2, w: r.w + 4, h: r.h + 4 + d };
    dotted(g, box, C.sel, Math.floor(t / 0.1) % 4, 4, 2);
    const hd = [[box.x, box.y], [box.x + box.w - 1, box.y], [box.x, box.y + box.h - 1], [box.x + box.w - 1, box.y + box.h - 1]];
    hd.forEach(([hx, hy]) => {
      px(g, C.sel, hx - 1, hy - 1, 3, 3);
      px(g, C.page, hx, hy);
    });
  }

  // Polvo cuando cada bloque encaja.
  (Object.keys(SLOT) as Kind[]).forEach((k) => {
    const r = SLOT[k];
    dust(g, t, BT[k].settle - 0.12, r.x + ox, r.y + r.h, 2);
    dust(g, t, BT[k].settle - 0.12, r.x + r.w + ox, r.y + r.h, 2);
  });
}

function drawClawd(g: Ctx, t: number, p: Pose, o: DrawOpts) {
  const b = body(p);
  const { bw, bh, legH, foot, bottom, top, cx, left } = b;
  const right = left + bw;

  // sombra
  const sw = Math.max(4, 12 - Math.round(p.lift / 2));
  px(g, C.shadow, cx - sw / 2, FLOOR, sw, 1);

  // patas: al caminar, alternan (una se levanta)
  const phase = Math.floor(t * 8) % 2;
  [-5, -3, 2, 4].forEach((lx, i) => {
    const lh = p.walking && i % 2 === phase ? legH - 1 : legH;
    if (lh > 0) px(g, C.coralDark, cx + lx, foot - lh, 1, lh);
  });

  // cuerpo
  px(g, C.coral, left, top, bw, bh);
  px(g, C.coralDark, left, bottom - 1, bw, 1);
  px(g, C.coralLight, left + 1, top, bw - 2, 1);

  // brazos
  const row = top + Math.min(3, bh - 3);
  const point = o.point;
  if (p.arms === "up") {
    px(g, C.coral, left - 1, top - 2, 1, 4);
    px(g, C.coral, right, top - 2, 1, 4);
  } else if (p.arms === "tap") {
    px(g, C.coral, left - 1, row, 1, 2);
    px(g, C.coral, right, top - 3, 1, 5);
  } else if (point) {
    if (point.dx > 0) {
      px(g, C.coral, left - 1, row, 1, 2);
      px(g, C.coral, right, row, 3, 1);
    } else if (point.dx < 0) {
      px(g, C.coral, left - 3, row, 3, 1);
      px(g, C.coral, right, row, 1, 2);
    } else {
      px(g, C.coral, left - 1, row, 1, 2);
      px(g, C.coral, right, row, 1, 1);
      px(g, C.coral, right + 1, row + 1, 1, 1);
      px(g, C.coral, right + 2, row + 2, 1, 1);
    }
  } else {
    px(g, C.coral, left - 1, row, 1, 2);
    px(g, C.coral, right, row, 1, 2);
  }

  // ojos
  let eyes = p.eyes;
  let lookX = p.lookX;
  let lookY = p.lookY;
  if (point) {
    lookX = point.dx;
    lookY = point.dy;
  }
  if (o.react < 0.9) eyes = "happy";
  const ey = top + 2 + Math.max(-1, Math.min(1, lookY));
  const sh = Math.max(-1, Math.min(1, lookX));
  [cx - 3 + sh, cx + 2 + sh].forEach((ex, i) => {
    if (eyes === "open") px(g, C.eye, ex, ey, 1, 2);
    else if (eyes === "closed") px(g, C.eye, i ? ex : ex - 1, ey + 1, 2, 1);
    else if (eyes === "wide") px(g, C.eye, i ? ex : ex - 1, ey, 2, 2);
    else if (eyes === "wink") {
      if (i) px(g, C.eye, ex, ey + 1, 2, 1);
      else px(g, C.eye, ex, ey, 1, 2);
    }
    else {
      px(g, C.eye, ex - 1, ey + 1);
      px(g, C.eye, ex, ey);
      px(g, C.eye, ex + 1, ey + 1);
    }
  });

  if (p.bang) {
    px(g, C.cream, cx, top - 10, 1, 4);
    px(g, C.cream, cx, top - 5, 1, 1);
  }
  if (p.sweat) {
    px(g, C.sweat, right + 1, top - 1);
    px(g, C.sweat, right + 1, top);
    px(g, C.cream, right + 1, top - 1);
  }

  // click: corazón que sube
  if (o.react < 0.9) {
    const hy = top - 7 - Math.round(o.react * 8);
    HEART.forEach((r, j) =>
      [...r].forEach((c, i) => {
        if (c === "1") px(g, C.heart, cx - 2 + i, hy + j);
      }),
    );
  }

  return b;
}

export function createScene() {
  const bm = buildBitmaps();

  /** `wake` (0 → WAKE): dibuja el despertar sobre el frame 0 del loop. */
  function draw(g: Ctx, t: number, o: DrawOpts, wake?: number) {
    t = wake === undefined ? ((t % T) + T) % T : 0;
    g.imageSmoothingEnabled = false;
    px(g, C.bg, 0, 0, W, H);

    // cinta: la página terminada se va, entra una en blanco (idéntica al frame 0)
    const shift = -SHIP * inOut(prog(t, SHIP_AT[0], SHIP_AT[1]));
    const shake = within(t, 8.4, 8.7) ? (Math.floor(t / 0.05) % 2 ? 1 : -1) : 0;
    const ox = Math.round(shift) + shake;
    drawPage(g, bm, t, ox, true);
    drawPage(g, bm, t, ox + SHIP, false);

    // piso con marcas que se desplazan con la cinta (patrón de 8 px)
    px(g, C.floor, 0, FLOOR, W, H - FLOOR);
    px(g, C.floorLine, 0, FLOOR, W, 1);
    for (let x = 0; x < W; x++) {
      if ((((x - Math.round(shift)) % 8) + 8) % 8 < 2) px(g, C.floorTick, x, FLOOR + 3);
    }

    const pose = wake === undefined ? poseAt(t) : wakePoseAt(wake);
    if (o.react < 0.6) pose.lift += Math.sin((Math.PI * o.react) / 0.6) * 6;
    const b = drawClawd(g, t, pose, o);

    // chispa del "tap" que conecta el CTA
    if (within(t, 6.95, 7.2)) {
      const p = prog(t, 6.95, 7.2);
      const y0 = b.top - 4;
      const y1 = SLOT.btn.y + SLOT.btn.h;
      const sy = Math.round(lerp(y0, y1, p));
      px(g, C.spark, b.left + b.bw, sy, 1, 2);
    }

    // zzz: dos "z" que suben mientras duerme
    if (wake !== undefined && wake < 1.0) {
      [0, 0.4].forEach((off) => {
        const q = ((wake + off) % 0.8) / 0.8;
        const zx = b.cx + 6 + Math.round(q * 3);
        const zy = b.top - 5 - Math.round(q * 7);
        ZED.forEach((r, j) =>
          [...r].forEach((c, i) => {
            if (c === "1") px(g, C.cream, zx + i, zy + j);
          }),
        );
      });
    }

    dust(g, t, 8.4, b.cx - 5, FLOOR - 1, 4);
    dust(g, t, 8.4, b.cx + 5, FLOOR - 1, 4);

    // bloques en mano / en vuelo (delante de todo)
    (Object.keys(SLOT) as Kind[]).forEach((k, i) => {
      const s = blockAt(k, t);
      if (s.mode === "none" || s.mode === "placed") return;
      const bmp = k === "title" ? bm.title : k === "sub" ? bm.sub : bm.btnOff;
      drawBitmap(g, bmp, s.x, s.y, 0, s.mode === "gen" ? s.p : -1, i + 3);
    });
  }

  return { draw };
}
