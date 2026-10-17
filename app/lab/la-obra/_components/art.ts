/*
 * La Obra — datos de pixel art compartidos (server + client).
 * Todo se mide en "art px" (un pixel del dibujo). En pantalla cada art px
 * vale `u` px CSS (entero: 2 en mobile, hasta 6 en desktop).
 */

/* ---------- Geometría del escenario (art px, relativo al stage) ---------- */

export const CELL = 3; // un bloque del nombre = 3x3 art px
export const NAME_COLS = 44;
export const NAME_ROWS = 11; // 5 filas DANIEL + 1 de aire + 5 filas CAMPUZANO
export const NAME_W = NAME_COLS * CELL; // 132
export const NAME_H = NAME_ROWS * CELL; // 33
export const NAME_Y = 12; // aire arriba para el andamio y su laburante
export const SLAB_Y = NAME_Y + NAME_H; // losa bajo el nombre (2 filas)
export const GROUND_Y = SLAB_Y + 14; // donde pisan los laburantes
export const TILE = 8; // baldosa "vainilla" de 9 panes
export const STAGE_H = GROUND_Y + TILE; // 67
export const U_MIN = 2;
export const U_MAX = 6;

/* ---------- Tipografía de bloques: 5 filas, ancho variable ---------- */

const GLYPHS: Record<string, string[]> = {
  D: ["###.", "#..#", "#..#", "#..#", "###."],
  A: [".##.", "#..#", "####", "#..#", "#..#"],
  N: ["#..#", "##.#", "#.##", "#..#", "#..#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  E: ["###", "#..", "##.", "#..", "###"],
  L: ["#..", "#..", "#..", "#..", "###"],
  C: [".##", "#..", "#..", "#..", ".##"],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"],
  P: ["###.", "#..#", "###.", "#...", "#..."],
  U: ["#..#", "#..#", "#..#", "#..#", ".##."],
  Z: ["####", "...#", ".##.", "#...", "####"],
  O: [".##.", "#..#", "#..#", "#..#", ".##."],
};

export type Slot = { c: number; r: number; v: number };

/** Lista de bloques del nombre, en coordenadas de grilla (col, fila). */
export function nameSlots(): Slot[] {
  const out: Slot[] = [];
  const lines: [string, number][] = [
    ["DANIEL", 0],
    ["CAMPUZANO", 6],
  ];
  let seed = 7;
  for (const [word, row0] of lines) {
    let col = 0;
    for (const ch of word) {
      const g = GLYPHS[ch];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < g[r].length; c++) {
          if (g[r][c] === "#") {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            // ~1 de cada 6 ladrillos sale de otra hornada
            const v = seed % 6 === 0 ? 1 : seed % 11 === 0 ? 2 : 0;
            out.push({ c: col + c, r: row0 + r, v });
          }
        }
      }
      col += g[0].length + 1;
    }
  }
  return out;
}

/* ---------- Paleta "Corralón" ---------- */

export type Pal = {
  brick: [string, string, string][]; // [cara, luz, sombra] por hornada
  plan: string;
  slab: string;
  slabTop: string;
  tile: string;
  tileHi: string;
  tileLo: string;
  grout: string;
  tube: string;
  tubeHi: string;
  plank: string;
  plankLo: string;
  ink: string;
  star: string;
  moon: string;
};

export const DAY: Pal = {
  brick: [
    ["#C2512E", "#E07A4F", "#8A3620"],
    ["#B04428", "#CF6A43", "#7A2E1A"],
    ["#CD6236", "#E88C5C", "#94401F"],
  ],
  plan: "#2B49C4",
  slab: "#9C958A",
  slabTop: "#B9B3A7",
  tile: "#D9CCB2",
  tileHi: "#EEE5D2",
  tileLo: "#B8AA8E",
  grout: "#A3967D",
  tube: "#6F7887",
  tubeHi: "#A3ABB8",
  plank: "#B07A43",
  plankLo: "#7E5128",
  ink: "#221B16",
  star: "#EFE7D6",
  moon: "#F4E6B8",
};

export const NIGHT: Pal = {
  brick: [
    ["#76382B", "#94503B", "#4A231C"],
    ["#6A3127", "#874634", "#421F19"],
    ["#7F3F2F", "#9E5A42", "#52281F"],
  ],
  plan: "#5D74E6",
  slab: "#3C3F55",
  slabTop: "#4E5269",
  tile: "#2C3150",
  tileHi: "#3A4064",
  tileLo: "#20253F",
  grout: "#1A1E35",
  tube: "#4A5168",
  tubeHi: "#6A7290",
  plank: "#5B4232",
  plankLo: "#3F2D22",
  ink: "#0B0D1C",
  star: "#EFE7D6",
  moon: "#F4E6B8",
};

/* ---------- Sprites de la cuadrilla (11x10, mirando a la derecha) ---------- */
// Cuerpo en cols 2..8, ancla (pies) en col 5. Herramientas pueden usar 0..10.
// Y casco · y sombra casco · L linterna · S piel · s piel sombra · K ojo
// G grafa (ropa de trabajo) · g grafa sombra · W banda reflectiva · B botines
// H cabeza del martillo · h mango

export const SPR_W = 11;
export const SPR_H = 10;
export const SPR_AX = 5;

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
} as const;

export type FrameName = keyof typeof FRAMES;

export type Crew = {
  Y: string;
  y: string;
  S: string;
  s: string;
};

// Cascos y pieles de la cuadrilla (blanco = capataz, como en cualquier obra).
export const CREW: Crew[] = [
  { Y: "#F2B21B", y: "#C4860F", S: "#E3B088", s: "#BE8862" },
  { Y: "#EEE9DC", y: "#B9B09C", S: "#9A5F3C", s: "#77452A" },
  { Y: "#EE7B28", y: "#B5551A", S: "#C98E64", s: "#A26D47" },
  { Y: "#F2B21B", y: "#C4860F", S: "#6E4129", s: "#52301E" },
  { Y: "#EE7B28", y: "#B5551A", S: "#F0C7A0", s: "#CFA27A" },
];

export const SHARED_INK: Record<string, string> = {
  K: "#221B16",
  G: "#2F4FA2",
  g: "#213979",
  W: "#E9E2CF",
  B: "#3A2A20",
  H: "#8C8A86",
  h: "#9C6B3C",
};

/** Escalones del borde de sección (en u): ancho, alto y cantidad por lado. */
export const STEP_W = 5;
export const STEP_H = 3;
export const STEPS = 4;
