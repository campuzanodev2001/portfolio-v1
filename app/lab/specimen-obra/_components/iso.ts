/*
 * Un solo edificio isométrico en pixel art, rasterizado en el server (adaptado
 * del barrio de La Obra). Es el "thumbnail" de Moreno Herramientas, que no
 * tiene captura porque está en obra: lo levantado en ladrillo, lo que falta
 * en replanteo azul, y el andamio. Proyección 2:1: X=(i-j)*2, Y=(i+j)-k.
 */

const C = {
  top: "#E07A4F",
  left: "#C2512E",
  right: "#8A3620",
  lit: "#F2B21B",
  dark: "#3B2119",
  plan: "#2B49C4",
  tube: "#6F7887",
  plank: "#B07A43",
};

export function obraSvg() {
  const a = 9;
  const b = 7;
  const h = 30;
  const built = 12;
  const OX = b * 2 + 2;
  const OY = h + 2;
  const px = new Map<string, string>();
  const put = (x: number, y: number, c: string) => px.set(`${x},${y}`, c);
  let s = 13;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const lit = new Map<string, boolean>();
  const isLit = (k: string) => {
    if (!lit.has(k)) lit.set(k, rnd() < 0.4);
    return lit.get(k)!;
  };
  const win = (i: number, k: number, n: number) =>
    Math.floor(i) % 2 === 1 && Math.floor(k) % 4 >= 1 && Math.floor(k) % 4 <= 2 && k < built - 2 && i < n - 1;

  for (let Y = OY - h - 4; Y < OY + a + b + 2; Y++) {
    for (let X = OX - b * 2 - 2; X < OX + a * 2 + 2; X++) {
      const x = X - OX + 0.5;
      const y = Y - OY + 0.5;
      let col: string | null = null;
      const ti = (x / 2 + y + built) / 2;
      const tj = (y + built - x / 2) / 2;
      if (ti >= 0 && ti < a && tj >= 0 && tj < b) col = C.top;
      if (!col) {
        const i = x / 2 + b;
        const k = i + b - y;
        if (i >= 0 && i < a && k >= 0 && k < built)
          col = win(i, k, a) ? (isLit(`l${Math.floor(i)},${Math.floor(k / 4)}`) ? C.lit : C.dark) : C.left;
      }
      if (!col) {
        const j = a - x / 2;
        const k = a + j - y;
        if (j >= 0 && j < b && k >= 0 && k < built)
          col = win(j, k, b) ? (isLit(`r${Math.floor(j)},${Math.floor(k / 4)}`) ? C.lit : C.dark) : C.right;
      }
      if (col) put(X, Y, col);
    }
  }

  // lo que falta: aristas punteadas en replanteo
  const P = (i: number, j: number, k: number) => [OX + (i - j) * 2, OY + (i + j) - k] as const;
  const edges: [readonly [number, number], readonly [number, number]][] = [
    [P(0, b, built), P(0, b, h)],
    [P(a, b, built), P(a, b, h)],
    [P(a, 0, built), P(a, 0, h)],
    [P(0, 0, h), P(a, 0, h)],
    [P(a, 0, h), P(a, b, h)],
    [P(a, b, h), P(0, b, h)],
    [P(0, b, h), P(0, 0, h)],
  ];
  for (const [[x0, y0], [x1, y1]] of edges) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let q = 0; q <= n; q += 2) {
      const x = Math.round(x0 + ((x1 - x0) * q) / n);
      const y = Math.round(y0 + ((y1 - y0) * q) / n);
      if (!px.has(`${x},${y}`)) put(x, y, C.plan);
    }
  }
  // andamio sobre la cara de luz: diagonales que en pixel son escalones
  const [ax0, ay0] = P(0, b, 0);
  const [ax1, ay1] = P(a, b, 0);
  for (const [x, y] of [
    [ax0 - 2, ay0],
    [ax1 - 2, ay1],
  ]) {
    for (let k = 0; k < built + 7; k++) put(x, y - k, C.tube);
  }
  for (let k = 5; k < built + 7; k += 6) {
    for (let q = 0; q <= ax1 - ax0; q++) put(ax0 - 2 + q, Math.round(ay0 - k + q / 2), C.plank);
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const key of px.keys()) {
    const [x, y] = key.split(",").map(Number);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const byColor = new Map<string, string>();
  for (const [key, col] of px) {
    const [x, y] = key.split(",").map(Number);
    byColor.set(col, (byColor.get(col) ?? "") + `M${x - minX} ${y - minY}h1v1h-1z`);
  }
  return {
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    paths: [...byColor].map(([fill, d]) => ({ fill, d })),
  };
}
