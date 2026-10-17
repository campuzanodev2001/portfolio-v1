/*
 * Pixel art shared by the server (SVG sprites in the HTML) and the client
 * (the hero canvas). Everything is measured in "art px"; on screen one art px
 * is `--u` CSS px (an integer: 2 on mobile, up to 5 on desktop).
 *
 * The crew came over from La Obra. In the print shop they kept their
 * helmets, which are pink now: there are only two inks in the building.
 */

/** The two riso inks + paper, and what they make together. */
export const INK = {
  paper: "#F2ECDF",
  pink: "#FF48B0", // Fluorescent Pink: decoration only (2.6:1 on paper)
  blue: "#3D5588", // Federal Blue: all text (6.2:1 on paper)
  violet: "#3D185E", // pink × blue in multiply: the free third ink
  yellow: "#FFE800", // the hidden drum
} as const;

export const SPR_W = 11;
export const SPR_H = 10;
export const SPR_AX = 5;

/*
 * Sprites, 11×10, facing right, feet at the bottom row, anchor col 5.
 * Y helmet · y helmet shade · L lamp · S skin · s skin shade · K eye
 * G work clothes (grafa) · g shade · W reflective band · B boots
 * H mallet head · h handle
 */
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

export type Crew = { S: string; s: string; boss?: boolean };

/** Four of them. White helmet = the foreman, like on any site. */
export const CREW: Crew[] = [
  { S: "#E3B088", s: "#BE8862" },
  { S: "#9A5F3C", s: "#77452A", boss: true },
  { S: "#C98E64", s: "#A26D47" },
  { S: "#6E4129", s: "#52301E" },
];

export const HELMET = {
  pink: ["#FF48B0", "#C43997"],
  yellow: ["#FFE800", "#C9A800"],
  boss: ["#FFFDF8", "#CFC6B3"],
} as const;

export const SHARED: Record<string, string> = {
  L: "#FFF6D8",
  K: INK.violet,
  G: INK.blue,
  g: "#2A3B60",
  W: INK.paper,
  B: INK.violet,
  H: "#6B6F86",
  h: "#9C6B3C",
};

/** The riso itself: a boxy duplicator with the pink drum showing. 28×16. */
export const RISO = [
  "......KKKKKKKKKKKKKKKK......",
  "......KWWWWWWWWWWWWWWK......",
  "......KWWWWWWWWWWWRPWK......",
  "......KKKKKKKKKKKKKKKK......",
  "......KBBBBBBBBBBBBBBK......",
  "WWWWWWKBKKKKKKKKKKKKBKWWWW..",
  "KKKKKKKBKPPPPPPPPPPKBKKKKKK.",
  "......KBKPpPpPpPpPpKBK......",
  "......KBKPPPPPPPPPPKBK......",
  "......KBKKKKKKKKKKKKBK......",
  "......KBBBBBBBBBBBBBBK......",
  "......KBBBBbbbbbbBBBBK......",
  "......KBBBBBBBBBBBBBBK......",
  "......KBBBBBBBBBBBBBBK......",
  "......KKKKKKKKKKKKKKKK......",
  ".......KK..........KK.......",
];

const RISO_INK: Record<string, string> = {
  K: INK.violet,
  W: "#FFFDF8",
  B: INK.blue,
  b: "#2A3B60",
  P: INK.pink,
  p: "#C43997",
  R: INK.pink,
};

/** Cardboard boxes for the "en prensa" scene (Moreno Herramientas). 7×6. */
export const BOX = ["KKKKKKK", "KcccCcK", "KcccCcK", "KCCCCCK", "KcccCcK", "KKKKKKK"];
const BOX_INK: Record<string, string> = { K: "#6B4B2A", c: "#C9A06A", C: "#E6C894" };

export type Run = { cls?: string; fill?: string; d: string };

/**
 * Rasterizes rows of characters into one <path> per colour, as horizontal
 * runs. `helmetCls` keeps the helmet recolourable from CSS (yellow ink egg).
 */
function rasterize(
  rows: readonly string[],
  color: (ch: string) => { cls?: string; fill?: string } | null,
  ox: number,
  oy: number,
  mirror = false,
): Run[] {
  const groups = new Map<string, Run>();
  const w = rows[0]?.length ?? 0;
  rows.forEach((row, r) => {
    let c = 0;
    while (c < w) {
      const ch = row[mirror ? w - 1 - c : c];
      const col = ch === "." ? null : color(ch);
      if (!col) {
        c++;
        continue;
      }
      let n = 1;
      while (c + n < w && row[mirror ? w - 1 - (c + n) : c + n] === ch) n++;
      const key = col.cls ?? col.fill ?? "";
      const g = groups.get(key) ?? { ...col, d: "" };
      g.d += `M${ox + c} ${oy + r}h${n}v1h-${n}z`;
      groups.set(key, g);
      c += n;
    }
  });
  return [...groups.values()];
}

export function workerRuns(frame: FrameName, crew: number, ox = 0, oy = 0, mirror = false) {
  const c = CREW[crew % CREW.length];
  return rasterize(
    FRAMES[frame],
    (ch) => {
      if (ch === "Y") return c.boss ? { fill: HELMET.boss[0] } : { cls: "imp-hm" };
      if (ch === "y") return c.boss ? { fill: HELMET.boss[1] } : { cls: "imp-hm2" };
      if (ch === "S") return { fill: c.S };
      if (ch === "s") return { fill: c.s };
      return SHARED[ch] ? { fill: SHARED[ch] } : null;
    },
    ox,
    oy,
    mirror,
  );
}

export function risoRuns(ox = 0, oy = 0) {
  return rasterize(RISO, (ch) => (RISO_INK[ch] ? { fill: RISO_INK[ch] } : null), ox, oy);
}

export function boxRuns(ox = 0, oy = 0) {
  return rasterize(BOX, (ch) => (BOX_INK[ch] ? { fill: BOX_INK[ch] } : null), ox, oy);
}

/* ---------- Canvas drawing (client) ---------- */

export type Ctx = {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
};

/** Draws a worker with feet at (x, y). */
export function drawWorker(
  g: Ctx,
  frame: FrameName,
  crew: number,
  x: number,
  y: number,
  dir: 1 | -1,
  yellow: boolean,
) {
  const rows = FRAMES[frame];
  const c = CREW[crew % CREW.length];
  const hm = c.boss ? HELMET.boss : yellow ? HELMET.yellow : HELMET.pink;
  const ox = x - SPR_AX;
  const oy = y - SPR_H;
  for (let r = 0; r < SPR_H; r++) {
    const row = rows[r];
    for (let k = 0; k < SPR_W; k++) {
      const ch = row[k];
      if (ch === ".") continue;
      g.fillStyle =
        ch === "Y" ? hm[0] : ch === "y" ? hm[1] : ch === "S" ? c.S : ch === "s" ? c.s : SHARED[ch];
      g.fillRect(dir === 1 ? ox + k : ox + (SPR_W - 1 - k), oy + r, 1, 1);
    }
  }
}
