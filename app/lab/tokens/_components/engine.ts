/**
 * Motor de partículas-glifo del hero "Tokens".
 *
 * Un solo rAF, typed arrays, canvas 2D y un atlas de glifos pre-rasterizados.
 * Cada partícula interpola entre dos "fuentes" de posición (ambiente, ancla,
 * órbita) con un peso suavizado: nunca se teletransporta, así que el loop no
 * tiene corte. Ver BRIEF.md para la coreografía completa.
 */

import {
  COLORS,
  COLS,
  C,
  G,
  MAX_GLYPHS,
  MAX_TARGETS,
  PROMPT_COL,
  PROMPT_ROW,
  ROWS,
  SCENES,
  SCRAMBLE,
  TOKEN_BG,
  TOKEN_INK,
  buildPrompt,
  glyphChars,
  type PromptLayout,
  type Target,
} from "./scenes";

// ── Coreografía (segundos, relativos al inicio de cada escena) ──────────────
export const T_TOKENS = 3.5;
export const T_STREAM = 4.8;
export const T_BUILD = 6.4;
export const T_CODE = 10.6;
export const SCENE_LEN = 13.8;
const STILL_AT = T_BUILD + 2.8; // cuadro fijo para prefers-reduced-motion

const EVENTS = [0, T_TOKENS, T_STREAM, T_BUILD, T_CODE] as const;
const STEPS = ["prompt", "tokens", "ui", "código"];

const SRC_AMB = 0;
const SRC_FROM = 1;
const SRC_TO = 2;
const SRC_ORB = 3;

const NCOL = COLORS.length;
const AMB_SCALE = 0.72;
const ORB_TILT = 0.58;
const ORB_ROT = -0.21;

export interface Engine {
  destroy(): void;
  setPaused(paused: boolean): void;
}

export function createEngine(
  canvas: HTMLCanvasElement,
  stage: HTMLElement,
  host: HTMLElement,
  reduced: boolean,
): Engine {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy() {}, setPaused() {} };

  // ── Layout ────────────────────────────────────────────────────────────────
  let W = 1;
  let H = 1;
  let dpr = 1;
  let sx0 = 0; // origen del escenario dentro del canvas (css px)
  let sy0 = 0;
  let cw = 8; // ancho de celda (css px)
  let rh = 15; // alto de celda
  let K = cw / rh;
  let lensR = 120;

  // ── Partículas ────────────────────────────────────────────────────────────
  const coarse = matchMedia("(pointer: coarse)").matches;
  const r0 = host.getBoundingClientRect();
  const cores = navigator.hardwareConcurrency || 4;
  let n = Math.round((r0.width * r0.height) / (coarse ? 300 : 420));
  if (cores <= 4) n = Math.round(n * 0.8);
  const N = Math.max(MAX_TARGETS + 320, Math.min(2800, Math.max(1000, n)));

  const ax = new Float32Array(N);
  const ay = new Float32Array(N);
  const avx = new Float32Array(N);
  const avy = new Float32Array(N);
  const fx = new Float32Array(N);
  const fy = new Float32Array(N);
  const tx = new Float32Array(N);
  const ty = new Float32Array(N);
  const t0 = new Float32Array(N);
  const du = new Float32Array(N).fill(1);
  const curl = new Float32Array(N);
  const srcF = new Uint8Array(N);
  const srcT = new Uint8Array(N);
  const gF = new Uint16Array(N);
  const gT = new Uint16Array(N);
  const cF = new Uint8Array(N);
  const cT = new Uint8Array(N);
  const bF = new Uint8Array(N);
  const bT = new Uint8Array(N);
  const aF = new Float32Array(N);
  const aT = new Float32Array(N);
  const sF = new Float32Array(N);
  const sT = new Float32Array(N);
  const orR = new Float32Array(N);
  const orA = new Float32Array(N);
  const orW = new Float32Array(N);
  const aAmb = new Float32Array(N);
  const gAmb = new Uint16Array(N);
  const seed = new Uint16Array(N);
  const ox = new Float32Array(N);
  const oy = new Float32Array(N);
  const hl = new Float32Array(N);
  const role = new Uint8Array(N); // 0 ambiente, 1 activa
  // salida del pase de cálculo
  const dX = new Float32Array(N);
  const dY = new Float32Array(N);
  const dA = new Float32Array(N);
  const dS = new Float32Array(N);
  const dG = new Uint16Array(N);
  const dC = new Uint8Array(N);
  const dB = new Uint8Array(N);

  for (let i = 0; i < N; i++) {
    seed[i] = (Math.random() * 65535) | 0;
    aAmb[i] = 0.09 + Math.random() * 0.24;
    gAmb[i] = SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
    gF[i] = gT[i] = gAmb[i];
    cF[i] = cT[i] = C.AMB;
    aF[i] = aT[i] = aAmb[i];
    sF[i] = sT[i] = AMB_SCALE;
    t0[i] = -10;
  }

  // ── Atlas de glifos (lazy) ────────────────────────────────────────────────
  const atlas = document.createElement("canvas");
  const actx = atlas.getContext("2d");
  const ATLAS_CAP = 900;
  const slotOf = new Int32Array(MAX_GLYPHS * NCOL * 2);
  let acw = 1;
  let ach = 1;
  let aCols = 1;
  let aNext = 0;
  let family = "ui-monospace, Menlo, Consolas, monospace";

  function resetAtlas() {
    acw = Math.max(2, Math.ceil(cw * dpr));
    ach = Math.max(2, Math.ceil(rh * dpr));
    aCols = Math.max(1, Math.floor(2048 / acw));
    atlas.width = aCols * acw;
    atlas.height = Math.ceil(ATLAS_CAP / aCols) * ach;
    slotOf.fill(0);
    aNext = 0;
  }

  function slot(g: number, c: number, b: number): number {
    const key = (g * NCOL + c) * 2 + b;
    const s = slotOf[key];
    if (s) return s - 1;
    if (!actx) return 0;
    if (aNext >= ATLAS_CAP) {
      actx.clearRect(0, 0, atlas.width, atlas.height);
      slotOf.fill(0);
      aNext = 0;
    }
    const id = aNext++;
    const x0 = (id % aCols) * acw;
    const y0 = Math.floor(id / aCols) * ach;
    const col = COLORS[c];
    const lw = Math.max(1, Math.round(dpr));
    const mx = x0 + Math.round(acw / 2 - lw / 2) + lw / 2;
    const my = y0 + Math.round(ach / 2 - lw / 2) + lw / 2;
    actx.save();
    actx.beginPath();
    actx.rect(x0, y0, acw, ach);
    actx.clip();
    actx.fillStyle = col;
    actx.strokeStyle = col;
    actx.lineWidth = lw;
    switch (g) {
      case G.H:
        actx.fillRect(x0, my - lw / 2, acw, lw);
        break;
      case G.V:
        actx.fillRect(mx - lw / 2, y0, lw, ach);
        break;
      case G.TL:
      case G.TR:
      case G.BL:
      case G.BR: {
        const ex = g === G.TL || g === G.BL ? x0 + acw : x0;
        const ey = g === G.TL || g === G.TR ? y0 + ach : y0;
        actx.beginPath();
        actx.moveTo(ex, my);
        actx.quadraticCurveTo(mx, my, mx, ey);
        actx.stroke();
        break;
      }
      case G.FILL: {
        const inset = Math.round(ach * 0.13);
        actx.fillRect(x0, y0 + inset, acw, ach - inset * 2);
        break;
      }
      case G.DOT:
      case G.BULLET:
        actx.beginPath();
        actx.arc(x0 + acw / 2, y0 + ach / 2, Math.max(1, acw * (g === G.DOT ? 0.08 : 0.2)), 0, Math.PI * 2);
        actx.fill();
        break;
      default:
        actx.font = `${b ? 600 : 400} ${Math.round(cw * 1.55 * dpr)}px ${family}`;
        actx.textAlign = "center";
        actx.textBaseline = "middle";
        actx.fillText(glyphChars[g] ?? "?", x0 + acw / 2, y0 + ach / 2 + dpr * 0.5);
    }
    actx.restore();
    slotOf[key] = id + 1;
    return id;
  }

  // ── Posiciones ────────────────────────────────────────────────────────────
  let QX = 0;
  let QY = 0;
  let E = 0;
  const ocx = COLS / 2;
  const ocy = ROWS / 2;
  const cosR = Math.cos(ORB_ROT);
  const sinR = Math.sin(ORB_ROT);

  function srcPos(src: number, i: number, t: number) {
    if (src === SRC_AMB) {
      QX = ax[i];
      QY = ay[i];
    } else if (src === SRC_FROM) {
      QX = fx[i];
      QY = fy[i];
    } else if (src === SRC_TO) {
      QX = tx[i];
      QY = ty[i];
    } else {
      const a = orA[i] + orW[i] * t;
      const ex = orR[i] * Math.cos(a);
      const ey = orR[i] * Math.sin(a) * ORB_TILT;
      QX = ocx + ex * cosR - ey * sinR;
      QY = ocy + (ex * sinR + ey * cosR) * K;
    }
  }

  /** Posición actual (grilla) en PX/PY; devuelve el peso crudo w y deja el suavizado en E. */
  let PX = 0;
  let PY = 0;
  function blend(i: number, t: number): number {
    let w = (t - t0[i]) / du[i];
    if (w <= 0) {
      srcPos(srcF[i], i, t);
      PX = QX;
      PY = QY;
      E = 0;
      return 0;
    }
    if (w >= 1) {
      srcPos(srcT[i], i, t);
      PX = QX;
      PY = QY;
      E = 1;
      return 1;
    }
    const e = w < 0.5 ? 4 * w * w * w : 1 - Math.pow(-2 * w + 2, 3) / 2;
    srcPos(srcF[i], i, t);
    const x0 = QX;
    const y0 = QY;
    srcPos(srcT[i], i, t);
    let x = x0 + (QX - x0) * e;
    let y = y0 + (QY - y0) * e;
    const k = curl[i];
    if (k !== 0) {
      const s = Math.sin(Math.PI * e) * k;
      const dxp = (QX - x0) * cw;
      const dyp = (QY - y0) * rh;
      x += (-dyp * s) / cw;
      y += (dxp * s) / rh;
    }
    PX = x;
    PY = y;
    E = e;
    w = Math.max(0, Math.min(1, w));
    return w;
  }

  /** Programa una transición capturando el estado actual en t (sin saltos). */
  function go(
    i: number,
    t: number,
    src: number,
    tg: Target | null,
    delay: number,
    dur: number,
    cu = 0,
    look?: { g: number; c: number; b: number; a: number; s: number },
  ) {
    const w = blend(i, t);
    if (w >= 1) {
      if (srcT[i] === SRC_TO) {
        fx[i] = tx[i];
        fy[i] = ty[i];
        srcF[i] = SRC_FROM;
      } else srcF[i] = srcT[i];
      gF[i] = gT[i];
      cF[i] = cT[i];
      bF[i] = bT[i];
      aF[i] = aT[i];
      sF[i] = sT[i];
    } else if (w > 0) {
      fx[i] = PX;
      fy[i] = PY;
      srcF[i] = SRC_FROM;
      aF[i] += (aT[i] - aF[i]) * E;
      sF[i] += (sT[i] - sF[i]) * E;
      if (E >= 0.5) {
        gF[i] = gT[i];
        cF[i] = cT[i];
        bF[i] = bT[i];
      }
    }
    srcT[i] = src;
    if (tg) {
      tx[i] = tg.x;
      ty[i] = tg.y;
    }
    if (look) {
      gT[i] = look.g;
      cT[i] = look.c;
      bT[i] = look.b;
      aT[i] = look.a;
      sT[i] = look.s;
    } else if (tg) {
      gT[i] = tg.g;
      cT[i] = tg.c;
      bT[i] = tg.b;
      aT[i] = 1;
      sT[i] = 1;
    } else {
      gT[i] = gAmb[i];
      cT[i] = C.AMB;
      bT[i] = 0;
      aT[i] = aAmb[i];
      sT[i] = AMB_SCALE;
    }
    t0[i] = t + delay;
    du[i] = dur;
    curl[i] = cu;
  }

  const toAmb = (i: number, t: number, delay: number, dur: number) => {
    role[i] = 0;
    go(i, t, SRC_AMB, null, delay, dur, (Math.random() - 0.5) * 0.6);
  };

  function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function freeAmbient(): number[] {
    const out: number[] = [];
    for (let i = 0; i < N; i++) if (!role[i]) out.push(i);
    return out;
  }

  // ── Estado de la coreografía ──────────────────────────────────────────────
  let now = 0;
  let sceneNo = 0;
  let sceneStart = 0;
  let evIdx = 0;
  let prompt: PromptLayout = buildPrompt(SCENES[0].prompt);
  let promptIdx: number[] = []; // partícula por carácter (en orden de prompt.chars)
  let typeStep = 0.045;
  let codeSet: number[] = []; // partículas del código, en orden de lectura
  let uiSet: number[] = [];
  let streamSet: number[] = [];
  let customPrompt: string | null = null;
  let typed = "";

  function fire(kind: number, t: number) {
    const scene = SCENES[sceneNo % SCENES.length];

    if (kind === 0) {
      // ── PROMPT: el código anterior se "desenrolla" en el prompt nuevo ────
      prompt = buildPrompt(customPrompt ?? scene.prompt);
      customPrompt = null;
      const chars = prompt.chars;
      typeStep = Math.min(0.045, 2.4 / Math.max(1, prompt.length));
      promptIdx = [];
      const used = new Set<number>();
      if (codeSet.length >= chars.length) {
        for (let k = 0; k < chars.length; k++) {
          const i = codeSet[Math.floor((k * codeSet.length) / chars.length)];
          promptIdx.push(i);
          used.add(i);
        }
        for (const i of codeSet) {
          if (!used.has(i)) toAmb(i, t, 0.1 + Math.max(0, ty[i] - 2) * 0.05, 1.1);
        }
      } else {
        for (const i of codeSet) toAmb(i, t, 0.1, 1.1);
        const free = shuffle(freeAmbient());
        for (let k = 0; k < chars.length; k++) promptIdx.push(free[k]);
      }
      chars.forEach((ch, k) => {
        const i = promptIdx[k];
        role[i] = 1;
        go(i, t, SRC_TO, ch.t, 0.3 + ch.pos * typeStep, 0.45, (Math.random() - 0.5) * 0.5);
      });
      // borde del prompt: las partículas ambiente más cercanas, en sentido horario
      const frame = prompt.frame;
      const frameIdx: number[] = [];
      for (let i = 0; i < N; i++) {
        blend(i, t);
        dX[i] = PX;
        dY[i] = PY;
      }
      for (let k = 0; k < frame.length; k++) {
        const tg = frame[k];
        let best = -1;
        let bd = Infinity;
        for (let i = 0; i < N; i++) {
          if (role[i]) continue;
          const dx = (dX[i] - tg.x) * cw;
          const dy = (dY[i] - tg.y) * rh;
          const d = dx * dx + dy * dy;
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        if (best < 0) break;
        role[best] = 1;
        frameIdx.push(best);
        go(best, t, SRC_TO, tg, 0.05 + (k / frame.length) * 0.8, 0.75, 0.2);
      }
      streamSet = promptIdx.concat(frameIdx);
      codeSet = [];
    } else if (kind === 2) {
      // ── STREAM: los tokens orbitan; el ambiente se suma al vórtice ───────
      const tokR: number[] = prompt.tokens.map(() => 7 + Math.random() * 8);
      const tokA: number[] = prompt.tokens.map(() => Math.random() * Math.PI * 2);
      const offs = new Map<number, number>();
      prompt.chars.forEach((ch, k) => {
        const i = promptIdx[k];
        const tok = ch.token;
        const R = tokR[tok] ?? 10;
        const o = offs.get(tok) ?? 0;
        offs.set(tok, o + 1);
        orR[i] = R;
        orW[i] = 1.05 / Math.sqrt(R / 5);
        orA[i] = (tokA[tok] ?? 0) + o / R - orW[i] * t;
        const look = { g: gT[i], c: TOKEN_INK[tok % TOKEN_INK.length], b: 1, a: 1, s: 1 };
        go(i, t, SRC_ORB, null, (tok / Math.max(1, prompt.tokens.length)) * 0.4, 1.0, 0, look);
      });
      const promptSet = new Set(promptIdx);
      for (const i of streamSet) {
        if (promptSet.has(i)) continue;
        orR[i] = 12 + Math.random() * 5;
        orW[i] = 1.05 / Math.sqrt(orR[i] / 5);
        orA[i] = Math.random() * Math.PI * 2 - orW[i] * t;
        go(i, t, SRC_ORB, null, Math.random() * 0.3, 1.1, 0, {
          g: gT[i], c: C.LINE, b: 0, a: 0.8, s: 0.9,
        });
      }
      const need = scene.ui.length - streamSet.length;
      if (need > 0) {
        const free = shuffle(freeAmbient()).slice(0, need);
        const inks = [C.DIM, C.DIM, C.TEXT, C.LINE, C.ACCENT, C.TAG, C.KW];
        for (const i of free) {
          role[i] = 1;
          const R = 2.5 + Math.pow(Math.random(), 0.7) * 17;
          orR[i] = R;
          orW[i] = 1.05 / Math.sqrt(R / 5);
          orA[i] = Math.random() * Math.PI * 2 - orW[i] * t;
          go(i, t, SRC_ORB, null, Math.random() * 0.4, 1.1, 0, {
            g: SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0],
            c: inks[(Math.random() * inks.length) | 0],
            b: 0,
            a: 0.45 + Math.random() * 0.45,
            s: 0.8 + Math.random() * 0.2,
          });
          streamSet.push(i);
        }
      }
    } else if (kind === 3) {
      // ── BUILD: el vórtice cristaliza en la interfaz, de arriba hacia abajo ─
      const set = shuffle(streamSet.slice());
      const ui = scene.ui;
      uiSet = [];
      for (let k = 0; k < set.length; k++) {
        const i = set[k];
        if (k < ui.length) {
          const tg = ui[k];
          uiSet.push(i);
          go(i, t, SRC_TO, tg, tg.y * 0.03 + Math.random() * 0.25, 1.15);
        } else toAmb(i, t, Math.random() * 0.3, 1.2);
      }
      streamSet = [];
    } else if (kind === 4) {
      // ── CODE: la interfaz se descompone en las líneas que la generan ─────
      const code = scene.code;
      const sorted = uiSet.slice().sort((p, q) => ty[p] * 64 + tx[p] - (ty[q] * 64 + tx[q]));
      const M = sorted.length;
      const pick: number[] = [];
      if (code.length <= M) {
        const used = new Set<number>();
        for (let k = 0; k < code.length; k++) {
          const i = sorted[Math.floor((k * M) / code.length)];
          pick.push(i);
          used.add(i);
        }
        for (const i of sorted) if (!used.has(i)) toAmb(i, t, ty[i] * 0.04, 1.0);
      } else {
        pick.push(...sorted);
        const free = shuffle(freeAmbient()).slice(0, code.length - M);
        for (const i of free) {
          role[i] = 1;
          pick.push(i);
        }
      }
      code.forEach((tg, k) => {
        const i = pick[k];
        go(i, t, SRC_TO, tg, tg.y * 0.035 + Math.random() * 0.2, 1.05, (Math.random() - 0.5) * 0.6);
      });
      codeSet = pick;
      uiSet = [];
    }
  }

  function schedule(t: number) {
    while (t >= sceneStart + EVENTS[evIdx]) {
      fire(evIdx, sceneStart + EVENTS[evIdx]);
      evIdx++;
      if (evIdx === EVENTS.length) {
        evIdx = 0;
        sceneNo++;
        sceneStart += SCENE_LEN;
      }
    }
  }

  // ── Ambiente: campo de flujo suave, rebote blando en los bordes ───────────
  function stepAmbient(dt: number) {
    const minX = -sx0 / cw - 1;
    const maxX = (W - sx0) / cw + 1;
    const minY = -sy0 / rh - 1;
    const maxY = (H - sy0) / rh + 1;
    const tt = now;
    const lerp = Math.min(1, dt * 0.9);
    for (let i = 0; i < N; i++) {
      const x = ax[i];
      const y = ay[i];
      const th =
        2.1 * Math.sin(x * 0.09 + tt * 0.07 + seed[i] * 0.0001) + 1.9 * Math.cos(y * 0.11 - tt * 0.05);
      let vx = avx[i] + (Math.cos(th) * 0.42 - avx[i]) * lerp;
      let vy = avy[i] + (Math.sin(th) * 0.42 - avy[i]) * lerp;
      if (x < minX) vx += dt * 1.5;
      else if (x > maxX) vx -= dt * 1.5;
      if (y < minY) vy += dt * 1.5;
      else if (y > maxY) vy -= dt * 1.5;
      avx[i] = vx;
      avy[i] = vy;
      ax[i] = x + vx * dt;
      ay[i] = y + vy * dt * K;
    }
  }

  // ── Puntero: lente de atención + ripples ──────────────────────────────────
  let mx = -9999;
  let my = -9999;
  let lensOn = false;
  let lensK = 0;
  const ripples: { x: number; y: number; t: number }[] = [];
  const candI = new Int32Array(10);
  const candD = new Float32Array(10);

  function draw(dt: number) {
    if (!ctx) return;
    const t = now;
    const local = t - sceneStart;
    lensK += ((lensOn ? 1 : 0) - lensK) * Math.min(1, dt * 6);
    const R = lensR;
    const R2 = R * R;
    const smooth = Math.min(1, dt * 9);
    for (let r = ripples.length - 1; r >= 0; r--) if (t - ripples[r].t > 1.3) ripples.splice(r, 1);

    // barrido de "render" sobre la UI y el código ya armados
    let sweep = -99;
    const sw0 = T_BUILD + 2.4;
    if (local > sw0 && local < sw0 + 1.1) sweep = ((local - sw0) / 1.1) * (ROWS + 4) - 2;
    const sw1 = T_CODE + 1.9;
    if (local > sw1 && local < sw1 + 1.0) sweep = ((local - sw1) / 1.0) * (ROWS + 4) - 2;

    let nc = 0;
    const intro = Math.min(1, t / 0.9);

    for (let i = 0; i < N; i++) {
      const w = blend(i, t);
      const e = E;
      let x = sx0 + PX * cw;
      let y = sy0 + PY * rh;
      let alpha = aF[i] + (aT[i] - aF[i]) * e;
      let scale = sF[i] + (sT[i] - sF[i]) * e;
      let g: number;
      if (gF[i] !== gT[i] && w > 0.1 && w < 0.88) g = SCRAMBLE[(seed[i] + ((t * 16) | 0)) % SCRAMBLE.length];
      else g = e < 0.5 ? gF[i] : gT[i];
      let c = e < 0.5 ? cF[i] : cT[i];
      const b = e < 0.5 ? bF[i] : bT[i];
      const settled = w >= 1 && srcT[i] === SRC_TO;

      // lente + ripples → desplazamiento y brillo
      let px = 0;
      let py = 0;
      let h = 0;
      if (lensK > 0.01) {
        const dx = x - mx;
        const dy = y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 0.001;
          const f = 1 - d / R;
          const push = f * f * (settled ? 9 : 26) * lensK;
          px += (dx / d) * push;
          py += (dy / d) * push;
          h = f * lensK;
          if (settled && alpha > 0.5) {
            if (nc < 10) {
              candI[nc] = i;
              candD[nc++] = d;
            } else {
              let m = 0;
              for (let q = 1; q < 10; q++) if (candD[q] > candD[m]) m = q;
              if (d < candD[m]) {
                candI[m] = i;
                candD[m] = d;
              }
            }
          }
        }
      }
      for (let r = 0; r < ripples.length; r++) {
        const rp = ripples[r];
        const age = t - rp.t;
        const rad = age * 520;
        const dx = x - rp.x;
        const dy = y - rp.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const band = (d - rad) / 34;
        if (band > -3 && band < 3) {
          const k = Math.exp(-band * band) * (1 - age / 1.3);
          px += (dx / d) * k * 18;
          py += (dy / d) * k * 18;
          h = Math.max(h, k);
        }
      }
      if (sweep > -50 && settled) {
        const dd = Math.abs(ty[i] - sweep);
        if (dd < 1.6) h = Math.max(h, (1 - dd / 1.6) * 0.9);
      }
      ox[i] += (px - ox[i]) * smooth;
      oy[i] += (py - oy[i]) * smooth;
      hl[i] += (h - hl[i]) * smooth;
      const hh = hl[i];
      if (hh > 0.02) {
        alpha = Math.min(1, alpha + hh * (role[i] ? 0.4 : 0.6));
        scale *= 1 + hh * (role[i] ? 0.18 : 0.45);
        if (hh > 0.4 && g !== G.FILL && c !== C.INK) c = C.ACCENT;
      }
      x += ox[i];
      y += oy[i];
      if (settled && hh < 0.02 && Math.abs(ox[i]) + Math.abs(oy[i]) < 0.05) {
        x = Math.round(x * dpr - acw / 2) / dpr + acw / 2 / dpr;
        y = Math.round(y * dpr - ach / 2) / dpr + ach / 2 / dpr;
      }
      dX[i] = x * dpr;
      dY[i] = y * dpr;
      dA[i] = alpha * intro;
      dS[i] = scale;
      dG[i] = g;
      dC[i] = c;
      dB[i] = b;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // resaltado de tokens
    if (local > T_TOKENS - 0.05 && local < T_STREAM + 0.6) {
      const out = Math.max(0, Math.min(1, 1 - (local - T_STREAM) / 0.45));
      prompt.tokens.forEach((tk, j) => {
        const a = Math.max(0, Math.min(1, (local - T_TOKENS - j * 0.035) / 0.25)) * out;
        if (a <= 0) return;
        ctx.globalAlpha = a;
        ctx.fillStyle = TOKEN_BG[j % TOKEN_BG.length];
        const x = (sx0 + (PROMPT_COL + tk.start) * cw) * dpr;
        const y = (sy0 + (PROMPT_ROW + tk.line) * rh + rh * 0.1) * dpr;
        ctx.fillRect(x + dpr, y, ((tk.end - tk.start) * cw - 2) * dpr, rh * 0.8 * dpr);
      });
      const a = Math.max(0, Math.min(1, (local - T_TOKENS - 0.3) / 0.4)) * out;
      if (a > 0) {
        ctx.globalAlpha = a;
        ctx.fillStyle = COLORS[C.ACCENT];
        ctx.font = `${Math.round(cw * 1.3 * dpr)}px ${family}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${prompt.tokens.length} tokens`,
          (sx0 + PROMPT_COL * cw) * dpr,
          (sy0 + 12.5 * rh) * dpr,
        );
      }
    }

    // líneas de atención
    if (nc > 0 && lensK > 0.05) {
      ctx.lineWidth = Math.max(1, dpr * 0.8);
      ctx.strokeStyle = COLORS[C.ACCENT];
      for (let q = 0; q < nc; q++) {
        const i = candI[q];
        ctx.globalAlpha = (0.06 + 0.32 * (1 - candD[q] / R)) * lensK;
        ctx.beginPath();
        ctx.moveTo(mx * dpr, my * dpr);
        ctx.lineTo(dX[i], dY[i]);
        ctx.stroke();
      }
    }

    // partículas: rellenos primero (los textos de botones van encima)
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < N; i++) {
        const g = dG[i];
        if ((g === G.FILL) !== (pass === 0)) continue;
        const a = dA[i];
        if (a < 0.01) continue;
        const s = slot(g, dC[i], dB[i]);
        const w = acw * dS[i];
        const h = ach * dS[i];
        ctx.globalAlpha = a;
        ctx.drawImage(
          atlas,
          (s % aCols) * acw,
          Math.floor(s / aCols) * ach,
          acw,
          ach,
          dX[i] - w / 2,
          dY[i] - h / 2,
          w,
          h,
        );
      }
    }

    // caret del prompt
    if (local > 0.2 && local < T_STREAM) {
      let p = 0;
      for (const ch of prompt.chars) if (local >= 0.3 + ch.pos * typeStep + 0.45) p = ch.pos + 1;
      const done = local > 0.3 + prompt.length * typeStep + 0.45;
      if (done) p = prompt.caret.length - 1;
      if (!done || ((local * 2) | 0) % 2 === 0) {
        const cp = prompt.caret[Math.min(p, prompt.caret.length - 1)];
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = COLORS[C.ACCENT];
        ctx.fillRect(
          Math.round((sx0 + cp.x * cw) * dpr),
          Math.round((sy0 + cp.y * rh + rh * 0.18) * dpr),
          Math.max(1, Math.round(1.5 * dpr)),
          Math.round(rh * 0.64 * dpr),
        );
      }
    }

    // fila de pasos (o el prompt que está escribiendo el visitante)
    ctx.font = `${Math.round(11 * dpr)}px ${family}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const sy = (sy0 - 13) * dpr;
    if (typed || customPrompt) {
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = COLORS[C.ACCENT];
      const label = typed ? `› ${typed}${((t * 2) | 0) % 2 ? "▍" : " "}` : "› en cola para el próximo ciclo";
      ctx.fillText(label, sx0 * dpr, sy);
    } else {
      const step = local < T_TOKENS ? 0 : local < T_BUILD ? 1 : local < T_CODE ? 2 : 3;
      let x = sx0 * dpr;
      STEPS.forEach((label, k) => {
        ctx.globalAlpha = k === step ? 1 : 0.55;
        ctx.fillStyle = COLORS[k === step ? C.ACCENT : C.DIM];
        ctx.fillText(label, x, sy);
        x += ctx.measureText(label).width;
        if (k < STEPS.length - 1) {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = COLORS[C.DIM];
          ctx.fillText(" → ", x, sy);
          x += ctx.measureText(" → ").width;
        }
      });
    }

    // anillos de ripple
    if (ripples.length) {
      ctx.lineWidth = Math.max(1, dpr);
      ctx.strokeStyle = COLORS[C.ACCENT];
      for (const rp of ripples) {
        const age = t - rp.t;
        ctx.globalAlpha = Math.max(0, 0.28 * (1 - age / 1.3));
        ctx.beginPath();
        ctx.arc(rp.x * dpr, rp.y * dpr, age * 520 * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    const cr = canvas.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    W = Math.max(1, cr.width);
    H = Math.max(1, cr.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    sx0 = sr.left - cr.left;
    sy0 = sr.top - cr.top;
    cw = Math.max(4, sr.width / COLS);
    rh = Math.max(7, sr.height / ROWS);
    K = cw / rh;
    lensR = Math.max(90, Math.min(150, W * 0.12));
    const fam = getComputedStyle(host).getPropertyValue("--tk-mono").trim();
    if (fam) family = `${fam}, ui-monospace, Menlo, monospace`;
    resetAtlas();
  }

  function seedAmbient() {
    const minX = -sx0 / cw;
    const maxX = (W - sx0) / cw;
    const minY = -sy0 / rh;
    const maxY = (H - sy0) / rh;
    for (let i = 0; i < N; i++) {
      ax[i] = minX + Math.random() * (maxX - minX);
      ay[i] = minY + Math.random() * (maxY - minY);
    }
  }

  // ── Loop / pausa ──────────────────────────────────────────────────────────
  let raf = 0;
  let last = 0;
  let inView = true;
  let paused = false;

  function frame(ts: number) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 1 / 60;
    last = ts;
    now += dt;
    schedule(now);
    stepAmbient(dt);
    draw(dt);
  }

  function sync() {
    const run = !reduced && inView && !paused && document.visibilityState === "visible";
    if (run && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function still() {
    now = STILL_AT;
    schedule(now);
    // fuerza a todas las transiciones a su estado final
    for (let i = 0; i < N; i++) t0[i] = -10;
    draw(1);
  }

  resize();
  seedAmbient();
  if (reduced) still();

  const ro = new ResizeObserver(() => {
    resize();
    if (reduced) draw(1);
  });
  ro.observe(host);
  const io = new IntersectionObserver((es) => {
    inView = es[0]?.isIntersecting ?? true;
    sync();
  });
  io.observe(canvas);
  const onVis = () => sync();
  document.addEventListener("visibilitychange", onVis);
  document.fonts?.ready.then(() => {
    resize();
    if (reduced) draw(1);
  });

  // puntero
  const rel = (e: PointerEvent) => {
    const cr = canvas.getBoundingClientRect();
    return { x: e.clientX - cr.left, y: e.clientY - cr.top };
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const p = rel(e);
    mx = p.x;
    my = p.y;
    lensOn = true;
  };
  const onLeave = () => {
    lensOn = false;
  };
  const onDown = (e: PointerEvent) => {
    if (reduced || paused) return;
    if ((e.target as HTMLElement).closest("a,button")) return;
    const p = rel(e);
    ripples.push({ x: p.x, y: p.y, t: now });
    if (ripples.length > 4) ripples.shift();
  };
  host.addEventListener("pointermove", onMove, { passive: true });
  host.addEventListener("pointerleave", onLeave, { passive: true });
  host.addEventListener("pointerdown", onDown, { passive: true });

  // easter egg: escribí un prompt con el teclado y Enter → el próximo ciclo lo construye
  const onKey = (e: KeyboardEvent) => {
    if (reduced || e.metaKey || e.ctrlKey || e.altKey) return;
    const el = document.activeElement;
    if (el && el !== document.body && el !== host && !host.contains(el)) return;
    if (el && el !== document.body && el !== host && (el.closest("a,button,input,textarea") || (el as HTMLElement).isContentEditable)) return;
    if (e.key === "Enter" && typed.trim()) {
      customPrompt = typed.trim();
      typed = "";
    } else if (e.key === "Escape") typed = "";
    else if (e.key === "Backspace" && typed) typed = typed.slice(0, -1);
    else if (e.key.length === 1 && (typed || e.key !== " ") && typed.length < 60) typed += e.key;
    else return;
    if (e.key === " " || e.key === "Backspace") e.preventDefault();
  };
  window.addEventListener("keydown", onKey);

  // easter egg: doble click en el nombre muestra cómo lo tokeniza el modelo
  const name = host.querySelector<HTMLElement>("[data-tk-name]");
  const onName = () => {
    if (name) name.dataset.tokens = name.dataset.tokens === "on" ? "off" : "on";
  };
  name?.addEventListener("dblclick", onName);

  console.info(
    "%ctokens%c  Escribí un prompt con el teclado y apretá Enter: el próximo ciclo lo construye. Doble click en el nombre para ver cómo se tokeniza.",
    "background:#7df0cf;color:#06120e;padding:2px 6px;border-radius:3px;font-weight:600",
    "color:inherit",
  );

  sync();

  return {
    setPaused(p: boolean) {
      paused = p;
      if (p) lensOn = false;
      sync();
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      name?.removeEventListener("dblclick", onName);
    },
  };
}
