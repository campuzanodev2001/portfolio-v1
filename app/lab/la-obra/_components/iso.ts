/*
 * Barrio isométrico en pixel art, rasterizado en el server a <path>s.
 * Proyección 2:1 clásica: X = (i - j) * 2, Y = (i + j) - k.
 * Cero JS en el cliente: es un SVG con shape-rendering="crispEdges".
 */

export type Building = {
  name: string;
  a: number; // largo en i
  b: number; // largo en j
  h: number; // altura
  built?: number; // si está en obra, hasta dónde está levantado
  seed: number;
};

export const BARRIO: Building[] = [
  { name: "NZ Automotores", a: 9, b: 6, h: 14, seed: 3 },
  { name: "The Box", a: 7, b: 7, h: 8, seed: 5 },
  { name: "Portal Store", a: 6, b: 6, h: 22, seed: 8 },
  { name: "Moreno Herramientas", a: 8, b: 7, h: 32, built: 13, seed: 13 },
  { name: "Tom Martorello", a: 5, b: 5, h: 18, seed: 21 },
  { name: "Tailor AI", a: 6, b: 6, h: 27, seed: 34 },
  { name: "Nuestros Planes", a: 6, b: 5, h: 10, seed: 55 },
];

const C = {
  top: "#E07A4F",
  left: "#C2512E",
  right: "#8A3620",
  lit: "#F2B21B",
  dark: "#3B2119",
  plan: "#5D74E6",
  tube: "#8E877C",
};

export function barrioSvg() {
  const GAP = 4;
  // fila horizontal: cada edificio corre en (+i, -j) para quedar a la misma altura
  let cursor = 0;
  const placed = BARRIO.map((b) => {
    const p = { b, i0: cursor, j0: -cursor };
    cursor += Math.ceil((Math.max(b.a, b.b) * 2 + GAP) / 2);
    return p;
  });
  const maxH = Math.max(...BARRIO.map((b) => b.h));
  const px = new Map<string, string>();
  const put = (x: number, y: number, c: string) => px.set(`${x},${y}`, c);

  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const { b, i0, j0 } of placed) {
    const OX = (i0 - j0) * 2;
    const OY = maxH + 2;
    const hb = b.built ?? b.h;
    let s = b.seed;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    const lit = new Map<string, boolean>();
    const isLit = (k: string) => {
      if (!lit.has(k)) lit.set(k, rnd() < 0.45);
      return lit.get(k)!;
    };
    for (let Y = OY - b.h - 4; Y < OY + b.a + b.b + 2; Y++) {
      for (let X = OX - b.b * 2 - 2; X < OX + b.a * 2 + 2; X++) {
        const x = X - OX + 0.5;
        const y = Y - OY + 0.5;
        let col: string | null = null;
        // techo
        const ti = (x / 2 + y + hb) / 2;
        const tj = (y + hb - x / 2) / 2;
        if (ti >= 0 && ti < b.a && tj >= 0 && tj < b.b) col = C.top;
        // cara j = b (luz)
        if (!col) {
          const i = x / 2 + b.b;
          const k = i + b.b - y;
          if (i >= 0 && i < b.a && k >= 0 && k < hb) {
            const win = Math.floor(i) % 2 === 1 && Math.floor(k) % 4 >= 1 && Math.floor(k) % 4 <= 2 && k < hb - 2 && i < b.a - 1;
            col = win ? (isLit(`l${Math.floor(i)},${Math.floor(k / 4)}`) ? C.lit : C.dark) : C.left;
          }
        }
        // cara i = a (sombra)
        if (!col) {
          const j = b.a - x / 2;
          const k = b.a + j - y;
          if (j >= 0 && j < b.b && k >= 0 && k < hb) {
            const win = Math.floor(j) % 2 === 1 && Math.floor(k) % 4 >= 1 && Math.floor(k) % 4 <= 2 && k < hb - 2 && j < b.b - 1;
            col = win ? (isLit(`r${Math.floor(j)},${Math.floor(k / 4)}`) ? C.lit : C.dark) : C.right;
          }
        }
        if (col) {
          put(X, Y, col);
          minX = Math.min(minX, X);
          maxX = Math.max(maxX, X);
          maxY = Math.max(maxY, Y);
        }
      }
    }
    if (b.built !== undefined) {
      // lo que falta: replanteo punteado y un andamio
      const P = (i: number, j: number, k: number) => [OX + (i - j) * 2, OY + (i + j) - k] as const;
      const edges: [readonly [number, number], readonly [number, number]][] = [
        [P(0, b.b, b.built), P(0, b.b, b.h)],
        [P(b.a, b.b, b.built), P(b.a, b.b, b.h)],
        [P(b.a, 0, b.built), P(b.a, 0, b.h)],
        [P(0, 0, b.h), P(b.a, 0, b.h)],
        [P(b.a, 0, b.h), P(b.a, b.b, b.h)],
        [P(b.a, b.b, b.h), P(0, b.b, b.h)],
        [P(0, b.b, b.h), P(0, 0, b.h)],
      ];
      for (const [[x0, y0], [x1, y1]] of edges) {
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
        for (let q = 0; q <= n; q += 2) {
          const x = Math.round(x0 + ((x1 - x0) * q) / n);
          const y = Math.round(y0 + ((y1 - y0) * q) / n);
          if (!px.has(`${x},${y}`)) put(x, y, C.plan);
        }
      }
      // andamio en la cara de luz
      const [ax0, ay0] = P(0, b.b, 0);
      const [ax1, ay1] = P(b.a, b.b, 0);
      for (const [x, y] of [
        [ax0 - 2, ay0],
        [ax1 - 2, ay1],
      ]) {
        for (let k = 0; k < b.built + 6; k++) put(x, y - k, C.tube);
      }
      for (let k = 5; k < b.built + 6; k += 6) {
        for (let q = 0; q <= ax1 - ax0; q++) put(ax0 - 2 + q, Math.round(ay0 - k + q / 2), C.tube);
      }
    }
  }

  // runs horizontales agrupados por color
  const byColor = new Map<string, string[]>();
  const rows = new Map<number, number[]>();
  for (const key of px.keys()) {
    const [x, y] = key.split(",").map(Number);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y)!.push(x);
  }
  for (const [y, xs] of rows) {
    xs.sort((p, q) => p - q);
    let start = xs[0];
    let prev = xs[0];
    let col = px.get(`${start},${y}`)!;
    const flush = (end: number) => {
      if (!byColor.has(col)) byColor.set(col, []);
      byColor.get(col)!.push(`M${start - minX} ${y}h${end - start + 1}v1h-${end - start + 1}z`);
    };
    for (let n = 1; n <= xs.length; n++) {
      const x = xs[n];
      const c = x === undefined ? null : px.get(`${x},${y}`)!;
      if (x === prev + 1 && c === col) {
        prev = x;
        continue;
      }
      flush(prev);
      if (x === undefined || c === null) break;
      start = prev = x;
      col = c;
    }
  }
  return {
    w: maxX - minX + 1,
    h: maxY + 1,
    paths: [...byColor].map(([fill, d]) => ({ fill, d: d.join("") })),
  };
}
