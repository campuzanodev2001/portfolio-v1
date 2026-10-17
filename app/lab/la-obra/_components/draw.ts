/*
 * Dibujo puro en "art px". Recibe cualquier cosa con fillStyle + fillRect,
 * así lo usa el canvas del cliente (y se puede previsualizar fuera del browser).
 */
import {
  CELL,
  CREW,
  FRAMES,
  type FrameName,
  type Pal,
  SHARED_INK,
  SPR_AX,
  SPR_H,
  SPR_W,
  TILE,
} from "./art";

export type Ctx = {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
};

/** Bloque 3x3: luz arriba-izquierda, sombra abajo-derecha. */
export function drawBlock(g: Ctx, x: number, y: number, pal: Pal, v: number) {
  const [face, hi, lo] = pal.brick[v] ?? pal.brick[0];
  g.fillStyle = face;
  g.fillRect(x, y, CELL, CELL);
  g.fillStyle = hi;
  g.fillRect(x, y, 2, 1);
  g.fillRect(x, y + 1, 1, 1);
  g.fillStyle = lo;
  g.fillRect(x + 1, y + 2, 2, 1);
}

/** Replanteo: el punto azul donde va a ir un bloque. */
export function drawPlan(g: Ctx, x: number, y: number, pal: Pal) {
  g.fillStyle = pal.plan;
  g.fillRect(x + 1, y + 1, 1, 1);
}

/** Línea Bresenham: las diagonales en pixel art son escaleras. */
export function stairLine(
  g: Ctx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

export type Geo = {
  W: number; // ancho total en art px
  nx: number; // origen del nombre
  ny: number;
  gy: number; // piso de la vereda
};

/** Escenario fijo: losa, pilotes, andamio y vereda de baldosas vainilla. */
export function drawStatic(g: Ctx, geo: Geo, pal: Pal) {
  const { W, nx, ny, gy } = geo;

  // Losa
  g.fillStyle = pal.slab;
  g.fillRect(nx - 2, ny + 33, 136, 2);
  g.fillStyle = pal.slabTop;
  g.fillRect(nx - 2, ny + 33, 136, 1);

  // Pilotes de hormigón (planta libre: la cuadrilla camina por abajo)
  for (const px of [nx + 2, nx + 64, nx + 127]) {
    g.fillStyle = pal.slab;
    g.fillRect(px, ny + 35, 3, gy - ny - 35);
    g.fillStyle = pal.slabTop;
    g.fillRect(px, ny + 35, 1, gy - ny - 35);
  }

  // Andamio sobre "ZANO"
  const tubes = [nx + 82, nx + 106, nx + 127];
  g.fillStyle = pal.tube;
  for (const tx of tubes) g.fillRect(tx, ny - 6, 1, 24);
  g.fillRect(tubes[0], ny - 6, tubes[2] - tubes[0] + 1, 1); // baranda
  g.fillStyle = pal.tubeHi;
  g.fillRect(tubes[0], ny - 6, tubes[2] - tubes[0] + 1, 1);
  g.fillStyle = pal.tube;
  stairLine(g, tubes[0], ny + 17, tubes[1], ny + 11);
  stairLine(g, tubes[1], ny + 8, tubes[2], ny + 2);
  for (const py of [ny, ny + 9]) {
    g.fillStyle = pal.plank;
    g.fillRect(tubes[0] - 1, py, tubes[2] - tubes[0] + 3, 1);
    g.fillStyle = pal.plankLo;
    g.fillRect(tubes[0] - 1, py + 1, tubes[2] - tubes[0] + 3, 1);
  }

  // Vereda: baldosa vainilla de 9 panes, la de cualquier cuadra porteña
  g.fillStyle = pal.tile;
  g.fillRect(0, gy, W, TILE);
  g.fillStyle = pal.grout;
  g.fillRect(0, gy, W, 1);
  for (let x = 0; x < W; x += TILE) {
    g.fillStyle = pal.grout;
    g.fillRect(x, gy, 1, TILE);
    for (let j = 2; j < TILE; j += 2) {
      for (let i = 2; i < TILE; i += 2) {
        g.fillStyle = pal.tileHi;
        g.fillRect(x + i, gy + j, 1, 1);
        if (j + 1 < TILE) {
          g.fillStyle = pal.tileLo;
          g.fillRect(x + i, gy + j + 1, 1, 1);
        }
      }
    }
  }
}

const MOON = [".##..", "##...", "##...", "##...", ".##.."];

export type Rect = { x0: number; y0: number; x1: number; y1: number };
const inside = (x: number, y: number, rs: Rect[]) =>
  rs.some((r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);

/** Cielo de noche entre y0 e y1, esquivando los textos (rects en art px). */
export function drawSky(
  g: Ctx,
  W: number,
  y0: number,
  y1: number,
  avoid: Rect[],
  pal: Pal,
  t: number,
  still: boolean,
) {
  const h = y1 - y0;
  if (h < 4) return;
  // Estrellas deterministas: siempre las mismas, no un random por render
  let s = 1234567;
  const n = Math.max(10, Math.floor((W * h) / 160));
  g.fillStyle = pal.star;
  for (let i = 0; i < n; i++) {
    s = (s * 16807) % 2147483647;
    const x = s % W;
    s = (s * 16807) % 2147483647;
    const y = y0 + (s % h);
    const blink = !still && (i * 7 + Math.floor(t / 700)) % 9 === 0;
    if (!blink && !inside(x, y, avoid)) g.fillRect(x, y, 1, 1);
  }
  const mx = W - 14;
  const my = y0 + 2;
  if (h < 9 || inside(mx, my, avoid) || inside(mx + 4, my + 4, avoid)) return;
  g.fillStyle = pal.moon;
  for (let r = 0; r < MOON.length; r++)
    for (let c = 0; c < 5; c++) if (MOON[r][c] === "#") g.fillRect(mx + c, my + r, 1, 1);
}

/** Sprite de laburante. (x, y) = pies. */
export function drawWorker(
  g: Ctx,
  frame: FrameName,
  crew: number,
  x: number,
  y: number,
  dir: 1 | -1,
  lampOn: boolean,
) {
  const rows = FRAMES[frame];
  const pal = CREW[crew % CREW.length];
  const ox = x - SPR_AX;
  const oy = y - SPR_H;
  for (let r = 0; r < SPR_H; r++) {
    const row = rows[r];
    for (let c = 0; c < SPR_W; c++) {
      const ch = row[c];
      if (ch === ".") continue;
      const col =
        ch === "L"
          ? lampOn
            ? "#FFF3B8"
            : "#CFC7B0"
          : (pal as Record<string, string>)[ch] ?? SHARED_INK[ch];
      g.fillStyle = col;
      g.fillRect(dir === 1 ? ox + c : ox + (SPR_W - 1 - c), oy + r, 1, 1);
    }
  }
}

/** Dónde queda la linterna del casco, para el cono de luz. */
export function lampPos(x: number, y: number, dir: 1 | -1, frame: FrameName) {
  const row = FRAMES[frame].findIndex((r) => r.includes("L"));
  const col = row < 0 ? 7 : FRAMES[frame][row].indexOf("L");
  const c = dir === 1 ? col : SPR_W - 1 - col;
  return { x: x - SPR_AX + c, y: y - SPR_H + Math.max(0, row) };
}
