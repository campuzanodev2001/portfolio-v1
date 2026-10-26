/* ==========================================================================
   Penrose — motor del loop imposible (canvas 2D, sin dependencias).

   La escalera NO es imposible: es una espiral real de 18 escalones que sube
   1/6 de bloque por paso. El último escalón termina desplazado (3, 3, 3)
   respecto del primero. En proyección isométrica la dirección (1, 1, 1) es
   exactamente la dirección de la mirada, así que todo lo que se corre sobre
   ese eje cae en el mismo píxel: el escalón 19 se dibuja encima del 0.
   La costura no se esconde, desaparece matemáticamente.
   ========================================================================== */

export const N = 18; // escalones del circuito
export const RISE = 1 / 6; // cuánto sube cada escalón (en bloques)
export const SHIFT = N * RISE; // 3 → desplazamiento (3,3,3) entre vueltas
const DEPTH = 1.3; // alto de cada bloque (paredes que caen)
export const HOP_MS = 620;
export const LOOP_MS = N * HOP_MS; // 11.16 s

const SIN_A = 1 / Math.sqrt(3); // elevación isométrica: atan(1/√2)
const COS_A = Math.sqrt(2 / 3);

type Cell = { x: number; y: number; top: number };

// 6 pasos +x, 6 pasos +y, 3 pasos −x, 3 pasos −y. Neto: (+3, +3) en planta
// y +3 en altura: justo el vector que la isométrica aplasta a un punto.
const MOVES: ReadonlyArray<readonly [number, number]> = [
  ...Array<[number, number]>(6).fill([1, 0]),
  ...Array<[number, number]>(6).fill([0, 1]),
  ...Array<[number, number]>(3).fill([-1, 0]),
  ...Array<[number, number]>(3).fill([0, -1]),
];

const CELLS: Cell[] = (() => {
  const out: Cell[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < N; i++) {
    out.push({ x, y, top: i * RISE });
    x += MOVES[i][0];
    y += MOVES[i][1];
  }
  return out;
})();

/** Escalón i de la espiral infinita (i puede ser ≥ N o negativo). */
function cellAt(i: number): Cell {
  const k = Math.floor(i / N);
  const c = CELLS[i - k * N];
  const d = k * SHIFT;
  return { x: c.x + d, y: c.y + d, top: c.top + d };
}

export const STATIONS = [
  { i: 0, label: "frontend", color: "#f08a6c", dir: [0, -1] as const, align: "center" },
  { i: 6, label: "API", color: "#52c3b4", dir: [0.55, -1] as const, align: "left" },
  { i: 12, label: "agente IA", color: "#f2c14e", dir: [0, -1] as const, align: "center" },
  { i: 15, label: "DB", color: "#a092ff", dir: [-0.55, -1] as const, align: "right" },
] as const;

/** Color del paquete = última estación por la que pasó. Periódico en N. */
function stationBefore(i: number) {
  const r = ((i % N) + N) % N;
  let s: (typeof STATIONS)[number] = STATIONS[STATIONS.length - 1];
  for (const st of STATIONS) if (st.i <= r) s = st;
  return s;
}

// Tres paquetes con desfasajes no enteros: siempre hay alguno saltando.
const PACKET_OFFSETS = [0, 6.4, 12.2];

const C = {
  topA: "#ece5d8",
  topB: "#e1d8c8",
  right: "#b9ab97",
  left: "#857a6f",
  line: "rgba(24, 22, 34, 0.22)",
  fade: "#14182a",
  shadow: "20, 22, 38",
};

type Box = {
  x0: number; x1: number; y0: number; y1: number; z0: number; z1: number;
  kind: "step" | "pillar" | "packet";
  top: string; right: string; left: string;
  cell?: number; glow?: number; glowColor?: string;
  sb?: [number, number, number, number];
  depth?: number;
};

type View = { c: number; s: number; vx: number; vy: number; vz: number };

function makeView(phi: number): View {
  const psi = Math.PI / 4 + phi;
  const c = Math.cos(psi);
  const s = Math.sin(psi);
  return { c, s, vx: s * COS_A, vy: c * COS_A, vz: SIN_A };
}

function proj(v: View, x: number, y: number, z: number): [number, number] {
  return [x * v.c - y * v.s, (x * v.s + y * v.c) * SIN_A - z * COS_A];
}

function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * ¿Quién va adelante? Ejes separadores entre cajas alineadas. Con la cámara
 * en el octante (+,+,+) la caja del lado positivo del plano va adelante.
 * 1 = b adelante, −1 = a adelante, 0 = no hay veredicto (no se tapan).
 */
function front(a: Box, b: Box): number {
  const E = 1e-6;
  let verdict = 0;
  const pairs: Array<[number, number, number, number]> = [
    [a.x0, a.x1, b.x0, b.x1],
    [a.y0, a.y1, b.y0, b.y1],
    [a.z0, a.z1, b.z0, b.z1],
  ];
  for (const [a0, a1, b0, b1] of pairs) {
    let v = 0;
    if (a1 <= b0 + E) v = 1;
    else if (b1 <= a0 + E) v = -1;
    if (!v) continue;
    if (verdict && v !== verdict) return 0;
    verdict = v;
  }
  return verdict;
}

/** Orden del pintor por grafo (Kahn), desempatando por profundidad. */
function paintOrder(items: Box[]): Box[] {
  const n = items.length;
  const indeg = new Array<number>(n).fill(0);
  const adj: number[][] = items.map(() => []);
  const E = 1e-3;
  for (let i = 0; i < n; i++) {
    const A = items[i].sb!;
    for (let j = i + 1; j < n; j++) {
      const B = items[j].sb!;
      if (A[2] <= B[0] + E || B[2] <= A[0] + E || A[3] <= B[1] + E || B[3] <= A[1] + E) continue;
      const f = front(items[i], items[j]);
      if (f === 1) { adj[i].push(j); indeg[j]++; }
      else if (f === -1) { adj[j].push(i); indeg[i]++; }
    }
  }
  const done = new Array<boolean>(n).fill(false);
  const out: Box[] = [];
  for (let k = 0; k < n; k++) {
    let pick = -1;
    for (let i = 0; i < n; i++) {
      if (done[i] || indeg[i] > 0) continue;
      if (pick < 0 || items[i].depth! < items[pick].depth!) pick = i;
    }
    if (pick < 0) {
      // ciclo (no debería pasar): el más lejano primero
      for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || items[i].depth! < items[pick].depth!)) pick = i;
    }
    done[pick] = true;
    out.push(items[pick]);
    for (const j of adj[pick]) indeg[j]--;
  }
  return out;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Packet = { x: number; y: number; z: number; squash: number; color: string; glow: boolean };

/** Posición de un paquete en la espiral real (continua salvo en la vuelta). */
function packetAt(s: number): Packet {
  const i = Math.floor(s);
  const u = s - i;
  const a = cellAt(i);
  const b = cellAt(i + 1);
  const REST = 0.36;
  const color = stationBefore(i).color;
  if (u < REST) {
    const land = u < 0.12 ? 1 - u / 0.12 : 0;
    return { x: a.x + 0.5, y: a.y + 0.5, z: a.top, squash: land * 0.22, color, glow: color === STATIONS[2].color };
  }
  const v = (u - REST) / (1 - REST);
  const e = ease(v);
  return {
    x: a.x + 0.5 + (b.x - a.x) * e,
    y: a.y + 0.5 + (b.y - a.y) * e,
    z: a.top + (b.top - a.top) * e + 4 * v * (1 - v) * 0.55,
    squash: -0.06 * Math.sin(v * Math.PI),
    color,
    glow: color === STATIONS[2].color,
  };
}

export type PenroseOptions = {
  reducedMotion: boolean;
  /** Se marca con data-paused cuando el loop está detenido (pausa el título). */
  pauseTarget?: HTMLElement | null;
  /** Avisa cuando la ilusión se rompe/recompone (|giro| > umbral). */
  onBroken?: (broken: boolean) => void;
};

export type PenroseController = {
  reveal: () => void;
  setReducedMotion: (r: boolean) => void;
  destroy: () => void;
};

export function createPenrose(canvas: HTMLCanvasElement, opts: PenroseOptions): PenroseController {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { reveal() {}, setReducedMotion() {}, destroy() {} };
  const g = ctx;

  let reduced = opts.reducedMotion;
  let dpr = 1;
  let W = 0;
  let H = 0;
  let S = 1; // px de dispositivo por unidad de bloque
  let ox = 0;
  let oy = 0;
  let font = "ui-monospace, monospace";

  // Fotograma quieto para reduced-motion: paquetes en reposo, cada uno sobre un escalón.
  let simMs = reduced ? HOP_MS * 0.2 : 0;
  let last = 0;
  let raf = 0;
  let visible = document.visibilityState === "visible";
  let inView = true;

  // Giro de cámara (resorte): 0 = isometría exacta (la ilusión).
  let phi = 0;
  let vel = 0;
  let target = 0;
  let holdTimer = 0;
  let broken = false;
  let drag: { x: number; start: number; id: number } | null = null;

  function fit() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W;
    canvas.height = H;
    font = getComputedStyle(canvas).fontFamily || font;
    const v = makeView(0);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of CELLS) {
      for (const [x, y, z] of [
        [c.x, c.y, c.top + 0.62], [c.x + 1, c.y, c.top], [c.x, c.y + 1, c.top],
        [c.x + 1, c.y + 1, c.top - DEPTH], [c.x + 1, c.y, c.top - DEPTH], [c.x, c.y + 1, c.top - DEPTH],
      ]) {
        const [sx, sy] = proj(v, x, y, z);
        minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
      }
    }
    const padX = 34 * dpr;
    const padY = 40 * dpr;
    S = Math.min((W - 2 * padX) / (maxX - minX), (H - 2 * padY) / (maxY - minY)) * 0.9;
    ox = W / 2 - (S * (minX + maxX)) / 2;
    oy = H / 2 - (S * (minY + maxY)) / 2 + 6 * dpr;
  }

  function P(v: View, x: number, y: number, z: number): [number, number] {
    const [sx, sy] = proj(v, x, y, z);
    return [ox + S * sx, oy + S * sy];
  }

  function poly(pts: Array<[number, number]>, fill: string | CanvasGradient, stroke = true) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    // mismo color: tapa la micro-grieta del antialias entre caras
    g.strokeStyle = fill;
    g.lineWidth = 1;
    g.stroke();
    if (stroke) {
      g.strokeStyle = C.line;
      g.lineWidth = Math.max(1, dpr * 0.75);
      g.stroke();
    }
  }

  function sideFill(color: string, fade: boolean, a: [number, number], b: [number, number]) {
    if (!fade) return color;
    const grad = g.createLinearGradient(a[0], a[1], b[0], b[1]);
    grad.addColorStop(0, color);
    grad.addColorStop(0.45, color);
    grad.addColorStop(1, C.fade);
    return grad;
  }

  function drawBox(v: View, b: Box, packets: Packet[]) {
    const { x0, x1, y0, y1, z0, z1 } = b;
    const t00 = P(v, x0, y0, z1), t10 = P(v, x1, y0, z1), t11 = P(v, x1, y1, z1), t01 = P(v, x0, y1, z1);
    const b10 = P(v, x1, y0, z0), b11 = P(v, x1, y1, z0), b01 = P(v, x0, y1, z0);
    const fade = b.kind === "step";
    // cara +x (derecha) y cara +y (izquierda): las únicas laterales visibles
    poly([t10, t11, b11, b10], sideFill(b.right, fade, t10, b10));
    poly([t01, t11, b11, b01], sideFill(b.left, fade, t01, b01));
    if (b.glow && b.glow > 0.01) {
      g.save();
      g.shadowColor = b.glowColor!;
      g.shadowBlur = 22 * dpr * b.glow;
      poly([t00, t10, t11, t01], b.top);
      g.restore();
    } else {
      poly([t00, t10, t11, t01], b.top);
    }

    // sombras de paquetes sobre la pisada del escalón
    if (b.kind === "step") {
      for (const p of packets) {
        if (p.z < z1 - 1e-6) continue;
        const h = 0.17;
        const ax0 = Math.max(x0, p.x - h), ax1 = Math.min(x1, p.x + h);
        const ay0 = Math.max(y0, p.y - h), ay1 = Math.min(y1, p.y + h);
        if (ax1 <= ax0 || ay1 <= ay0) continue;
        const alpha = 0.3 * Math.max(0, 1 - (p.z - z1) / 0.9);
        if (alpha <= 0.01) continue;
        g.beginPath();
        const q = [P(v, ax0, ay0, z1), P(v, ax1, ay0, z1), P(v, ax1, ay1, z1), P(v, ax0, ay1, z1)];
        g.moveTo(q[0][0], q[0][1]);
        for (let k = 1; k < 4; k++) g.lineTo(q[k][0], q[k][1]);
        g.closePath();
        g.fillStyle = `rgba(${C.shadow}, ${alpha})`;
        g.fill();
      }
    }
  }

  function screenBounds(v: View, b: Box) {
    let a = Infinity, c = Infinity, d = -Infinity, e = -Infinity;
    for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1]) {
      const [sx, sy] = proj(v, x, y, z);
      if (sx < a) a = sx; if (sx > d) d = sx;
      if (sy < c) c = sy; if (sy > e) e = sy;
    }
    b.sb = [a, c, d, e];
    b.depth = ((b.x0 + b.x1) / 2) * v.vx + ((b.y0 + b.y1) / 2) * v.vy + ((b.z0 + b.z1) / 2) * v.vz;
  }

  function draw() {
    const v = makeView(phi);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    g.lineJoin = "round";

    const sBase = simMs / HOP_MS;
    const packets = PACKET_OFFSETS.map((o) => packetAt((((sBase + o) % N) + N) % N));

    // brillo de cada estación: decae después de que un paquete aterriza en ella
    const glow = STATIONS.map((st) => {
      let gmax = 0;
      for (const o of PACKET_OFFSETS) {
        const ds = ((((sBase + o) - st.i) % N) + N) % N;
        if (ds < 1.7) gmax = Math.max(gmax, 1 - ds / 1.7);
      }
      return gmax;
    });

    const items: Box[] = [];
    CELLS.forEach((c, i) => {
      items.push({
        x0: c.x, x1: c.x + 1, y0: c.y, y1: c.y + 1, z0: c.top - DEPTH, z1: c.top,
        kind: "step", top: i % 2 ? C.topB : C.topA, right: C.right, left: C.left, cell: i,
      });
    });
    STATIONS.forEach((st, k) => {
      const c = CELLS[st.i];
      const gl = glow[k];
      items.push({
        x0: c.x + 0.1, x1: c.x + 0.32, y0: c.y + 0.1, y1: c.y + 0.32, z0: c.top, z1: c.top + 0.62,
        kind: "pillar", top: gl > 0.02 ? st.color : shade(st.color, 0.82),
        right: shade("#cfc3b1", 0.86), left: shade("#cfc3b1", 0.64),
        glow: gl, glowColor: st.color,
      });
    });
    for (const p of packets) {
      const hw = 0.16 * (1 + p.squash * 0.6);
      const hh = 0.32 * (1 - p.squash);
      items.push({
        x0: p.x - hw, x1: p.x + hw, y0: p.y - hw, y1: p.y + hw, z0: p.z + 0.002, z1: p.z + 0.002 + hh,
        kind: "packet", top: p.color, right: shade(p.color, 0.8), left: shade(p.color, 0.6),
        glow: p.glow ? 0.55 : 0, glowColor: p.color,
      });
    }
    for (const b of items) screenBounds(v, b);
    for (const b of paintOrder(items)) drawBox(v, b, packets);

    // El revés de la trama: el escalón 19 "de verdad" (flota delante del 0).
    const reveal = Math.min(1, Math.abs(phi) / 0.07);
    if (reveal > 0.02) {
      const gc = cellAt(N);
      const z1 = gc.top, z0 = gc.top - DEPTH;
      const q = (x: number, y: number, z: number) => P(v, x, y, z);
      g.save();
      g.globalAlpha = reveal;
      g.setLineDash([4 * dpr, 4 * dpr]);
      g.strokeStyle = STATIONS[0].color;
      g.lineWidth = 1.25 * dpr;
      const T = [q(gc.x, gc.y, z1), q(gc.x + 1, gc.y, z1), q(gc.x + 1, gc.y + 1, z1), q(gc.x, gc.y + 1, z1)];
      g.beginPath();
      T.forEach((p, k) => (k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      g.closePath();
      for (const [x, y] of [[gc.x + 1, gc.y], [gc.x + 1, gc.y + 1], [gc.x, gc.y + 1]]) {
        const a = q(x, y, z1), b = q(x, y, z0);
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
      }
      g.stroke();
      g.setLineDash([]);
      g.font = `${10.5 * dpr}px ${font}`;
      g.fillStyle = STATIONS[0].color;
      g.textAlign = "center";
      const lbl = q(gc.x + 0.5, gc.y + 0.5, z1 + 0.85);
      g.fillText("escalón 19 (el real)", lbl[0], lbl[1]);
      g.restore();
    }

    // etiquetas de estación (decorativas; el canvas tiene su aria-label)
    g.font = `${11 * dpr}px ${font}`;
    g.textBaseline = "alphabetic";
    STATIONS.forEach((st, k) => {
      const c = CELLS[st.i];
      const tip = P(v, c.x + 0.21, c.y + 0.21, c.top + 0.62);
      const len = 22 * dpr;
      const end: [number, number] = [tip[0] + st.dir[0] * len, tip[1] + st.dir[1] * len];
      const a = 0.55 + 0.45 * glow[k];
      g.globalAlpha = a;
      g.strokeStyle = st.color;
      g.lineWidth = dpr;
      g.beginPath();
      g.moveTo(tip[0], tip[1] - 3 * dpr);
      g.lineTo(end[0], end[1]);
      g.stroke();
      g.textAlign = st.align;
      const tx = end[0] + (st.align === "left" ? 4 : st.align === "right" ? -4 : 0) * dpr;
      const ty = end[1] - 5 * dpr;
      g.lineWidth = 4 * dpr;
      g.strokeStyle = C.fade;
      g.strokeText(st.label, tx, ty);
      g.fillStyle = st.color;
      g.fillText(st.label, tx, ty);
      g.globalAlpha = 1;
    });
  }

  function springActive() {
    return Math.abs(phi - target) > 1e-4 || Math.abs(vel) > 1e-4;
  }

  function shouldRun() {
    return visible && inView && (!reduced || springActive());
  }

  function setPaused(p: boolean) {
    opts.pauseTarget?.toggleAttribute("data-paused", p);
  }

  function tick(now: number) {
    raf = 0;
    const dt = Math.min(now - last, 50);
    last = now;
    if (!reduced) simMs = (simMs + dt) % LOOP_MS;

    if (reduced) {
      phi = target;
      vel = 0;
    } else {
      // resorte apenas subamortiguado: el "snap" vuelve con un rebote mínimo
      const k = 70;
      const d = 2 * Math.sqrt(k) * 0.72;
      const s = dt / 1000;
      vel += (-k * (phi - target) - d * vel) * s;
      phi += vel * s;
      if (!springActive()) { phi = target; vel = 0; }
    }

    const isBroken = Math.abs(phi) > 0.04;
    if (isBroken !== broken) {
      broken = isBroken;
      opts.onBroken?.(broken);
    }

    draw();
    if (shouldRun()) raf = requestAnimationFrame(tick);
    else setPaused(true);
  }

  function kick() {
    if (raf) return;
    if (!visible || !inView) { setPaused(true); return; }
    setPaused(reduced);
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function setTarget(t: number) {
    target = t;
    if (reduced) {
      phi = t;
      const isBroken = Math.abs(phi) > 0.04;
      if (isBroken !== broken) { broken = isBroken; opts.onBroken?.(broken); }
      draw();
      return;
    }
    kick();
  }

  // --- eventos ---------------------------------------------------------------
  const onVis = () => { visible = document.visibilityState === "visible"; if (visible) kick(); };
  document.addEventListener("visibilitychange", onVis);

  const io = new IntersectionObserver((entries) => {
    inView = entries[entries.length - 1].isIntersecting;
    if (inView) kick();
  });
  io.observe(canvas);

  const ro = new ResizeObserver(() => { fit(); draw(); });
  ro.observe(canvas);

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    window.clearTimeout(holdTimer);
    drag = { x: e.clientX, start: target, id: e.pointerId };
  };
  const onMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4 && !canvas.hasPointerCapture(e.pointerId)) canvas.setPointerCapture(e.pointerId);
    const w = canvas.clientWidth || 1;
    setTarget(Math.max(-0.32, Math.min(0.32, drag.start + (dx / w) * 1.1)));
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    // se sostiene un instante para que se vea el truco y vuelve a encajar
    holdTimer = window.setTimeout(() => setTarget(0), 650);
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  if (document.fonts) document.fonts.ready.then(() => { font = getComputedStyle(canvas).fontFamily || font; draw(); }).catch(() => {});

  fit();
  draw();
  kick();

  return {
    reveal() {
      window.clearTimeout(holdTimer);
      setTarget(0.22);
      holdTimer = window.setTimeout(() => setTarget(0), 2600);
    },
    setReducedMotion(r: boolean) {
      reduced = r;
      if (r) { simMs = HOP_MS * 0.2; phi = target; vel = 0; draw(); }
      kick();
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    },
  };
}
