/*
 * Pixel art compartido (server + client). Sprites copiados de La Obra y
 * recortados: la cuadrilla es la misma gente, ahora trabajando sobre letras.
 * Todo en "art px": en pantalla 1 art px = --u px CSS (entero).
 */

export const SPR_W = 11;
export const SPR_H = 10;
export const SPR_AX = 5; // columna de los pies

// Y casco · y sombra casco · L linterna · S piel · s piel sombra · K ojo
// G grafa · g grafa sombra · W reflectivo · B botines · H martillo · h mango
// E sobre (carta) · M mate · T termo
export const FRAMES = {
  idle: [
    "...yYYYL...",
    "...yYYYYYY.",
    "...SSSKS...",
    "...sSSSS...",
    "...GGGGG...",
    "..GWWWWWG..",
    "..SgGGGgS..",
    "...GG.GG...",
    "...GG.GG...",
    "...BB.BBB..",
  ],
  walkA: [
    "...yYYYL...",
    "...yYYYYYY.",
    "...SSSKS...",
    "...sSSSS...",
    "...GGGGG...",
    "..GWWWWWG..",
    "...SGGGS...",
    "...GG.GG...",
    "..GG...GG..",
    "..BB...BBB.",
  ],
  walkB: [
    "...yYYYL...",
    "...yYYYYYY.",
    "...SSSKS...",
    "...sSSSS...",
    "...GGGGG...",
    "...GWWWG...",
    "...gSGGS...",
    "....GGG....",
    "....GGG....",
    "....BBBB...",
  ],
  up: [
    "..SyYYYLS..",
    "..GyYYYYYY.",
    "..GSSSKSG..",
    "...sSSSS...",
    "...GGGGG...",
    "...WWWWW...",
    "...GGGGG...",
    "...GG.GG...",
    "...GG.GG...",
    "...BB.BBB..",
  ],
  hamUp: [
    "...yYYYL.HH",
    "...yYYYYYh.",
    "...SSSKSS..",
    "...sSSSSG..",
    "...GGGGGG..",
    "..GWWWWW...",
    "..SgGGGg...",
    "...GG.GG...",
    "...GG.GG...",
    "...BB.BBB..",
  ],
  hamDown: [
    "...yYYYL...",
    "...yYYYYYY.",
    "...SSSKS...",
    "...sSSSS...",
    "...GGGGGGG.",
    "..GWWWWW.S.",
    "..SgGGGg.h.",
    "...GG.GGHHH",
    "...GG.GG...",
    "...BB.BBB..",
  ],
  sit: [
    "...........",
    "...........",
    "...yYYYL...",
    "...yYYYYYY.",
    "...SKSKS...",
    "...sSSSS...",
    "..GSSSSSG..",
    "..GWWWWWG..",
    "..GGGGGGGB.",
    "..ggGGGGGB.",
  ],
  // sentado con mate: el termo al lado, el mate en la mano
  mate: [
    "...........",
    "...........",
    "...yYYYL...",
    "...yYYYYYY.",
    "...SKSKS..T",
    "...sSSSS..T",
    "..GSSSSSMST",
    "..GWWWWWGMT",
    "..GGGGGGGBT",
    "..ggGGGGGBT",
  ],
  // llevando la carta del formulario de contacto
  carta: [
    "..EEEEEEE..",
    "..SEEEEES..",
    "..GyYYYLG..",
    "...yYYYYYY.",
    "...SSSKS...",
    "...GGGGG...",
    "...WWWWW...",
    "...GG.GG...",
    "..GG...GG..",
    "..BB...BBB.",
  ],
} as const;

export type FrameName = keyof typeof FRAMES;

export type Crew = { Y: string; y: string; S: string; s: string };

// Casco blanco = capataz, como en cualquier obra.
export const CREW: Crew[] = [
  { Y: "#F2B21B", y: "#C4860F", S: "#E3B088", s: "#BE8862" },
  { Y: "#EEE9DC", y: "#B9B09C", S: "#9A5F3C", s: "#77452A" },
  { Y: "#EE7B28", y: "#B5551A", S: "#C98E64", s: "#A26D47" },
  { Y: "#F2B21B", y: "#C4860F", S: "#6E4129", s: "#52301E" },
];

export const INK: Record<string, string> = {
  K: "#1c1714",
  G: "#2F4FA2",
  g: "#213979",
  W: "#E9E2CF",
  B: "#3A2A20",
  H: "#8C8A86",
  h: "#9C6B3C",
  E: "#F7F1E3",
  M: "#7A4B26",
  T: "#B9C0C8",
};

export function colorOf(ch: string, crew: number, lampOn = false): string | null {
  if (ch === ".") return null;
  if (ch === "L") return lampOn ? "#FFF3B8" : "#CFC7B0";
  const c = CREW[crew % CREW.length] as Record<string, string>;
  return c[ch] ?? INK[ch] ?? null;
}

/** Sprite como paths SVG agrupados por color (server: cero JS en el cliente). */
export function spritePaths(frame: FrameName, crew: number, flip = false) {
  const rows = FRAMES[frame];
  const by = new Map<string, string>();
  for (let r = 0; r < SPR_H; r++) {
    for (let c = 0; c < SPR_W; c++) {
      const col = colorOf(rows[r][c], crew);
      if (!col) continue;
      const x = flip ? SPR_W - 1 - c : c;
      by.set(col, (by.get(col) ?? "") + `M${x} ${r}h1v1h-1z`);
    }
  }
  return [...by].map(([fill, d]) => ({ fill, d }));
}

/* ---------- Baldosa vainilla de 9 panes (8x8 art px) ---------- */

export const TILE = 8;

/** SVG de una baldosa, como data URI para usar de fondo repetido. */
export function tileDataUri(day = true) {
  const tile = day ? "#D9CCB2" : "#2C3150";
  const hi = day ? "#EEE5D2" : "#3A4064";
  const lo = day ? "#B8AA8E" : "#20253F";
  const grout = day ? "#A3967D" : "#1A1E35";
  let d = "";
  let dh = "";
  let dl = "";
  for (let j = 2; j < TILE; j += 2) {
    for (let i = 2; i < TILE; i += 2) {
      dh += `M${i} ${j}h1v1h-1z`;
      if (j + 1 < TILE) dl += `M${i} ${j + 1}h1v1h-1z`;
    }
  }
  d = `M0 0h8v1h-8zM0 1h1v7h-1z`;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' shape-rendering='crispEdges'>` +
    `<rect width='8' height='8' fill='${tile}'/>` +
    `<path d='${d}' fill='${grout}'/><path d='${dh}' fill='${hi}'/><path d='${dl}' fill='${lo}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* ---------- Casco para el retrato pixelado ---------- */

export const HELMET = [
  "......YYYYYYY......",
  "....YYYYYYYYYYY....",
  "...YYYYYYLYYYYYY...",
  "..YYYYYYLLLYYYYYY..",
  "..YYYYYYYYYYYYYYY..",
  ".yYYYYYYYYYYYYYYYy.",
  "yyyyyyyyyyyyyyyyyyy",
];

export function helmetPaths() {
  const by = new Map<string, string>();
  const pal: Record<string, string> = { Y: "#F2B21B", y: "#C4860F", L: "#FFF3B8" };
  HELMET.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      const col = pal[ch];
      if (col) by.set(col, (by.get(col) ?? "") + `M${c} ${r}h1v1h-1z`);
    }),
  );
  return { w: HELMET[0].length, h: HELMET.length, paths: [...by].map(([fill, d]) => ({ fill, d })) };
}
