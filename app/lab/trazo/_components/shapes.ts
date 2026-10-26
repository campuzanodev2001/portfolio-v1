/**
 * Trazo — geometría.
 *
 * Cada dibujo es UN solo trazo abierto: entra por el horizonte a la izquierda
 * (x=0), dibuja el objeto sin levantar la birome y sale por la derecha
 * (x=600). Como todos empiezan y terminan en el mismo lugar, el morph entre
 * dos dibujos nunca "salta": la línea solo se reacomoda.
 *
 * Las ramas internas (pantalla, antena, nodos...) se hacen con `mark()` +
 * `back()`: la birome vuelve exactamente sobre sus pasos. Quieto no se ve
 * (es la misma línea dos veces); en el morph las dos pasadas se separan y la
 * línea parece desenredarse.
 *
 * Todo es puro y determinista: corre igual en el server (frame estático del
 * SSR / reduced-motion) y en el cliente.
 */

export const VIEW_W = 600;
/** Horizonte. */
export const BASE = 310;
/** Puntos por dibujo después del remuestreo (todos iguales → interpolables). */
export const N = 900;

type Pt = [number, number];
const RAD = Math.PI / 180;

class Pen {
  readonly p: Pt[] = [];
  private marks: number[] = [];

  constructor(x: number, y: number) {
    this.p.push([x, y]);
  }

  private get cur(): Pt {
    return this.p[this.p.length - 1];
  }

  L(x: number, y: number) {
    this.p.push([x, y]);
    return this;
  }

  Q(cx: number, cy: number, x: number, y: number, n = 28) {
    const [x0, y0] = this.cur;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const a = (1 - t) * (1 - t);
      const b = 2 * (1 - t) * t;
      const c = t * t;
      this.p.push([a * x0 + b * cx + c * x, a * y0 + b * cy + c * y]);
    }
    return this;
  }

  C(x1: number, y1: number, x2: number, y2: number, x: number, y: number, n = 28) {
    const [x0, y0] = this.cur;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const m = 1 - t;
      const a = m * m * m;
      const b = 3 * m * m * t;
      const c = 3 * m * t * t;
      const d = t * t * t;
      this.p.push([a * x0 + b * x1 + c * x2 + d * x, a * y0 + b * y1 + c * y2 + d * y]);
    }
    return this;
  }

  /** Arco de circunferencia en grados (SVG: y hacia abajo, ángulo creciente = horario). */
  arc(cx: number, cy: number, r: number, a0: number, a1: number) {
    return this.ell(cx, cy, r, r, 0, a0, a1);
  }

  /** Arco de elipse rotada. Hace un L al punto inicial si hace falta. */
  ell(cx: number, cy: number, rx: number, ry: number, rot: number, a0: number, a1: number) {
    const cr = Math.cos(rot * RAD);
    const sr = Math.sin(rot * RAD);
    const at = (a: number): Pt => {
      const x = rx * Math.cos(a * RAD);
      const y = ry * Math.sin(a * RAD);
      return [cx + x * cr - y * sr, cy + x * sr + y * cr];
    };
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) / 3));
    this.p.push(at(a0));
    for (let i = 1; i <= n; i++) this.p.push(at(a0 + ((a1 - a0) * i) / n));
    return this;
  }

  /** Arco circular estilo SVG (large-arc = 0) hasta (x, y). sweep 1 = horario. */
  A(r: number, sweep: 0 | 1, x: number, y: number) {
    const [x0, y0] = this.cur;
    const dx = x - x0;
    const dy = y - y0;
    const d = Math.hypot(dx, dy) / 2 || 1;
    const h = Math.sqrt(Math.max(0, r * r - d * d));
    for (const s of [1, -1]) {
      const cx = (x0 + x) / 2 - (dy / (2 * d)) * h * s;
      const cy = (y0 + y) / 2 + (dx / (2 * d)) * h * s;
      const a0 = Math.atan2(y0 - cy, x0 - cx);
      let da = Math.atan2(y - cy, x - cx) - a0;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da <= -Math.PI) da += 2 * Math.PI;
      if (da > 0 === (sweep === 1)) return this.arc(cx, cy, r, a0 / RAD, (a0 + da) / RAD);
    }
    return this.L(x, y);
  }

  /** Bucle tangente a la dirección actual (un "nudo" en la línea). */
  loop(r: number, side: 1 | -1 = 1) {
    const [x, y] = this.cur;
    const [px, py] = this.p[this.p.length - 2];
    const len = Math.hypot(x - px, y - py) || 1;
    const dx = (x - px) / len;
    const dy = (y - py) / len;
    const cx = x - dy * r * side;
    const cy = y + dx * r * side;
    const a0 = Math.atan2(y - cy, x - cx) / RAD;
    // sentido de giro que continúa hacia adelante
    const tx = -Math.sin(a0 * RAD);
    const ty = Math.cos(a0 * RAD);
    const dir = tx * dx + ty * dy > 0 ? 1 : -1;
    return this.arc(cx, cy, r, a0, a0 + 360 * dir);
  }

  /** Espiral desde (r0, a0) hacia r1, `turns` vueltas en sentido horario. */
  spiral(cx: number, cy: number, r0: number, r1: number, a0: number, turns: number) {
    const n = Math.ceil(turns * 90);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const r = r0 + (r1 - r0) * t;
      const a = (a0 + 360 * turns * t) * RAD;
      this.p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return this;
  }

  /** Curva paramétrica cerrada r(θ) alrededor de (cx, cy). */
  polar(cx: number, cy: number, r: (a: number) => number, a0: number, a1: number, n = 240) {
    for (let i = 0; i <= n; i++) {
      const a = (a0 + ((a1 - a0) * i) / n) * RAD;
      const rr = r(a);
      this.p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    return this;
  }

  mark() {
    this.marks.push(this.p.length - 1);
    return this;
  }

  /** Vuelve sobre sus propios pasos hasta el último `mark()`. */
  back() {
    const m = this.marks.pop() ?? 0;
    for (let i = this.p.length - 2; i >= m; i--) {
      const [x, y] = this.p[i];
      this.p.push([x, y]);
    }
    return this;
  }
}

/** Remuestreo uniforme por longitud de arco a exactamente `n` puntos. */
function resample(src: Pt[], n: number): Float32Array {
  const pts = src.filter(
    (q, i) => i === 0 || q[0] !== src[i - 1][0] || q[1] !== src[i - 1][1],
  );
  const acc = new Float64Array(pts.length);
  for (let i = 1; i < pts.length; i++) {
    acc[i] = acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  const total = acc[pts.length - 1];
  const out = new Float32Array(n * 2);
  let seg = 1;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1);
    while (seg < pts.length - 1 && acc[seg] < target) seg++;
    const l0 = acc[seg - 1];
    const l1 = acc[seg];
    const t = l1 > l0 ? (target - l0) / (l1 - l0) : 0;
    out[k * 2] = pts[seg - 1][0] + (pts[seg][0] - pts[seg - 1][0]) * t;
    out[k * 2 + 1] = pts[seg - 1][1] + (pts[seg][1] - pts[seg - 1][1]) * t;
  }
  return out;
}

const B = BASE;

/* ── 1 · el teléfono de mamá (con el engranaje de configuración en pantalla) */
function phone(): Pt[] {
  const gear = (a: number) => 21 + 5 * (Math.tanh(3 * Math.sin(8 * a)) / Math.tanh(3));
  return new Pen(0, B)
    .L(348, B)
    .L(252, B)
    .arc(252, 298, 12, 90, 180)
    .L(240, 196)
    // pantalla + engranaje
    .L(258, 196)
    .L(258, 108)
    .L(342, 108)
    .L(342, 196)
    .L(300, 196)
    .L(300, 173)
    .polar(300, 152, gear, 90, 450)
    .L(300, 196)
    .L(258, 196)
    .L(240, 196)
    .L(240, 102)
    .arc(252, 102, 12, 180, 270)
    // parlante
    .L(284, 90)
    .L(284, 98)
    .L(316, 98)
    .L(316, 90)
    .L(348, 90)
    .arc(348, 102, 12, 270, 360)
    .L(360, 258)
    // botón
    .L(313, 258)
    .arc(300, 258, 13, 0, 360)
    .L(360, 258)
    .L(360, 298)
    .arc(348, 298, 12, 0, 90)
    .L(VIEW_W, B).p;
}

/* ── 2 · primera computadora: monitor con líneas de código */
function monitor(): Pt[] {
  return new Pen(0, B)
    .L(255, B)
    .L(272, 292)
    .L(292, 292)
    .L(292, 236)
    .L(224, 236)
    .arc(224, 222, 14, 90, 180)
    .L(210, 206)
    .L(230, 206)
    .L(230, 176).L(318, 176).L(230, 176)
    .L(230, 158).L(276, 158).L(230, 158)
    .L(230, 140).L(338, 140).L(230, 140)
    .L(230, 122).L(296, 122).L(230, 122)
    .L(230, 96)
    .L(370, 96)
    .L(370, 206)
    .L(230, 206)
    .L(210, 206)
    .L(210, 90)
    .arc(224, 90, 14, 180, 270)
    .L(376, 76)
    .arc(376, 90, 14, 270, 360)
    .L(390, 222)
    .arc(376, 222, 14, 0, 90)
    .L(308, 236)
    .L(308, 292)
    .L(328, 292)
    .L(345, B)
    .L(VIEW_W, B).p;
}

/* ── 3 · el wifi del vecino: router + señal en serpentina */
function wifi(): Pt[] {
  const ox = 300;
  const oy = 236;
  const a0 = 215;
  const a1 = 325;
  const rs = [34, 66, 98];
  const at = (r: number, a: number): Pt => [ox + r * Math.cos(a * RAD), oy + r * Math.sin(a * RAD)];
  const pen = new Pen(0, B).L(370, B).L(230, B).L(230, 292);
  // luces del router
  pen.mark().L(250, 292);
  for (const x of [254, 272, 290]) pen.L(x, 292).arc(x, 288, 4, 90, 450);
  pen.L(296, 292).back();
  pen.L(230, 278).arc(238, 278, 8, 180, 270).L(300, 270);
  // antena → punto → arcos unidos por "tapitas"
  pen.mark().L(300, 242).arc(ox, oy, 6, 90, 360 + a0);
  // abanico en zigzag: rayo → arco → rayo → arco… (las dos aristas del abanico)
  for (let k = 0; k < rs.length; k++) {
    const forward = k % 2 === 0;
    pen.L(...at(rs[k], forward ? a0 : a1));
    pen.arc(ox, oy, rs[k], forward ? a0 : a1, forward ? a1 : a0);
  }
  pen.back();
  return pen.L(362, 270).arc(362, 278, 8, 270, 360).L(370, B).L(VIEW_W, B).p;
}

/* ── 4 · { } */
function brace(pen: Pen, c: number, s: 1 | -1) {
  const T = 72;
  const Bt = 306;
  const M = 188;
  const w = 36;
  const X = (dx: number) => c + dx * s;
  pen
    .L(X(w), Bt)
    .C(X(8), Bt, X(0), Bt - 8, X(0), Bt - 36)
    .L(X(0), M + 30)
    .C(X(0), M + 8, X(-8), M, X(-24), M)
    .C(X(-8), M, X(0), M - 8, X(0), M - 30)
    .L(X(0), T + 36)
    .C(X(0), T + 8, X(8), T, X(w), T);
}
function braces(): Pt[] {
  const pen = new Pen(0, B).L(268, B).mark();
  brace(pen, 232, 1);
  pen.back().L(332, B).mark();
  brace(pen, 368, -1);
  return pen.back().L(VIEW_W, B).p;
}

/* ── 5 · React */
function atom(): Pt[] {
  const cx = 300;
  const cy = 176;
  const rx = 120;
  const ry = 40;
  // parámetro donde las órbitas de 60° y 120° cruzan la vertical del centro
  const phiAt = (rot: number) => {
    const c = Math.cos(rot * RAD);
    const s = Math.sin(rot * RAD);
    return Math.atan2(rx * c, ry * s) / RAD;
  };
  const p60 = phiAt(60);
  const p120 = phiAt(120);
  const yI =
    cy + rx * Math.cos(p60 * RAD) * Math.sin(60 * RAD) + ry * Math.sin(p60 * RAD) * Math.cos(60 * RAD);
  return new Pen(0, B)
    .L(300, B)
    .L(300, yI)
    .ell(cx, cy, rx, ry, 60, p60, p60 + 360)
    .ell(cx, cy, rx, ry, 120, p120, p120 + 360)
    .L(300, cy + ry)
    .ell(cx, cy, rx, ry, 0, 90, 450)
    .L(300, cy + 12)
    .arc(cx, cy, 12, 90, 450)
    .L(300, B)
    .L(VIEW_W, B).p;
}

/* ── 6 · IA: chispa + grafo de nodos */
function ai(): Pt[] {
  const cx = 300;
  const cy = 166;
  // anillo de nodos (cada nodo es un bucle en la línea) y la chispa adentro
  const pen = new Pen(0, B).L(300, B).L(300, 272).loop(7, 1);
  pen.L(438, 236).loop(7, 1).L(428, 104).loop(7, 1).L(300, 50).loop(7, 1);
  pen.L(172, 104).loop(7, 1).L(162, 236).loop(7, 1).L(300, 272).L(300, 232);
  pen.Q(cx + 8, cy + 8, 354, cy);
  pen.mark().L(428, 104).back();
  pen.Q(cx + 8, cy - 8, cx, 100);
  pen.mark().L(300, 50).back();
  pen.Q(cx - 8, cy - 8, 246, cy);
  pen.mark().L(172, 104).back();
  pen.Q(cx - 8, cy + 8, cx, 232);
  return pen.L(300, B).L(VIEW_W, B).p;
}

/* ── 7 · bandeja de DJ: vinilo en espiral + brazo */
function turntable(): Pt[] {
  const rcx = 284;
  const rcy = 214;
  const r0 = 78;
  const na = -25;
  return new Pen(0, B)
    .L(400, B)
    .L(200, B)
    .arc(200, 296, 14, 90, 180)
    .L(186, 288)
    .mark()
    .L(204, 288)
    .arc(212, 288, 8, 180, 540)
    .back()
    .L(186, 126)
    .arc(200, 126, 14, 180, 270)
    .L(400, 112)
    .arc(400, 126, 14, 270, 360)
    .L(414, 136)
    .mark()
    .L(391, 136)
    .arc(382, 136, 9, 0, 360)
    .L(374, 164)
    .L(rcx + r0 * Math.cos(na * RAD), rcy + r0 * Math.sin(na * RAD))
    .spiral(rcx, rcy, r0, 13, na, 4.5)
    .back()
    .L(414, 296)
    .arc(400, 296, 14, 0, 90)
    .L(VIEW_W, B).p;
}

/* ── 8 · vóley */
function volley(): Pt[] {
  // Pelota de vóley clásica (3 costuras en molinete con sus paralelas),
  // dibujada en una grilla de 24 u (centro 12,12 · radio 10) y escalada.
  const k = 9.6;
  const cx = 300;
  const cy = B - 10 * k;
  const X = (x: number) => cx + (x - 12) * k;
  const Y = (y: number) => cy + (y - 12) * k;
  const deg = (x: number, y: number) => {
    const a = Math.atan2(y - 12, x - 12) / RAD;
    return a < 90 ? a + 360 : a;
  };
  const pen = new Pen(0, B).L(300, B);
  let at = 90;
  /** Recorre el borde hasta el punto (x, y) y desde ahí dibuja una rama que vuelve. */
  const branch = (x: number, y: number, draw: () => void) => {
    const a = deg(x, y);
    pen.arc(cx, cy, 10 * k, at, a);
    at = a;
    pen.mark();
    draw();
    pen.back();
  };
  branch(7.8, 21.1, () => pen.A(16.55 * k, 0, X(16.8), Y(13.6)));
  branch(3.3, 17, () => pen.A(12.6 * k, 1, X(12), Y(12)));
  branch(6.3, 3.8, () => pen.A(16.55 * k, 0, X(8.2), Y(15.3)));
  branch(12, 2, () => pen.A(13.3 * k, 0, X(12), Y(12)).A(12.8 * k, 1, X(20.7), Y(17)));
  branch(22, 11.1, () => pen.A(16.55 * k, 0, X(11.1), Y(7.1)));
  pen.arc(cx, cy, 10 * k, at, 450);
  return pen.L(VIEW_W, B).p;
}

export type Chapter = {
  /** Cuándo / contexto (tipografía fina). */
  when: string;
  /** Qué es. */
  what: string;
};

export const CHAPTERS: Chapter[] = [
  { when: "2007 · 6 años", what: "el teléfono de mamá" },
  { when: "2015 · 14 años", what: "mi primera computadora" },
  { when: "2016 · 15 años", what: "el wifi del vecino" },
  { when: "C → C++ → Java → JS", what: "de Assembler a JavaScript" },
  { when: "React", what: "tutor de más de 150 estudiantes" },
  { when: "hoy", what: "construyo con IA" },
  { when: "fuera del código", what: "DJ" },
  { when: "fuera del código", what: "vóley" },
];

export const SHAPES: Float32Array[] = [phone, monitor, wifi, braces, atom, ai, turntable, volley].map(
  (f) => resample(f(), N),
);

/** Polilínea → atributo `d` (1 decimal: suficiente y estable entre server y cliente). */
export function toPath(pts: ArrayLike<number>, from = 0, to = pts.length / 2): string {
  const out: string[] = [];
  for (let i = from; i < to; i++) {
    out.push(`${i === from ? "M" : "L"}${pts[i * 2].toFixed(1)} ${pts[i * 2 + 1].toFixed(1)}`);
  }
  return out.join("");
}
