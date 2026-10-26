/**
 * Escenas del loop "Tokens". Todo vive en una grilla de celdas monoespaciadas
 * (COLS × ROWS). Cada Target es UNA partícula: un carácter real, un trazo de
 * borde o una celda de relleno. La grilla es independiente del tamaño de
 * pantalla: el motor la escala a píxeles en cada resize.
 */

export const COLS = 40;
export const ROWS = 22;

// ── Paleta (índices = colores del atlas) ────────────────────────────────────
export const C = {
  TEXT: 0,
  DIM: 1,
  LINE: 2,
  ACCENT: 3,
  WARN: 4,
  KW: 5,
  STR: 6,
  TAG: 7,
  ATTR: 8,
  NUM: 9,
  INK: 10,
  CHIP: 11,
  AMB: 12,
  FAINT: 13,
} as const;

export const COLORS = [
  "#e7e9ee", // TEXT
  "#737b8c", // DIM
  "#4d5668", // LINE
  "#7df0cf", // ACCENT
  "#ffb36b", // WARN
  "#b9a2ff", // KW
  "#a6e3a1", // STR
  "#82b8ff", // TAG
  "#f3cf86", // ATTR
  "#ff9f80", // NUM
  "#06120e", // INK (texto sobre acento)
  "#1f2632", // CHIP
  "#465062", // AMB
  "#2c3340", // FAINT
];

/** Colores de resaltado de tokens (fondos translúcidos) y su tinta en órbita. */
export const TOKEN_BG = [
  "rgba(125,240,207,0.17)",
  "rgba(185,162,255,0.19)",
  "rgba(130,184,255,0.18)",
  "rgba(243,207,134,0.17)",
];
export const TOKEN_INK = [C.ACCENT, C.KW, C.TAG, C.ATTR];

// ── Glifos ──────────────────────────────────────────────────────────────────
// 0..8 son procedurales (dibujados con paths, no dependen de la fuente).
export const G = {
  H: 0,
  V: 1,
  TL: 2,
  TR: 3,
  BL: 4,
  BR: 5,
  FILL: 6,
  DOT: 7,
  BULLET: 8,
} as const;
const PROCEDURAL = 9;

export const MAX_GLYPHS = 512;
export const glyphChars: string[] = new Array(PROCEDURAL).fill("");
const glyphMap = new Map<string, number>();

export function gid(ch: string): number {
  let id = glyphMap.get(ch);
  if (id === undefined) {
    if (glyphChars.length >= MAX_GLYPHS) return gid("?");
    id = glyphChars.length;
    glyphChars.push(ch);
    glyphMap.set(ch, id);
  }
  return id;
}

/** Glifos para el "ruido" ambiente y el scramble en vuelo. */
export const SCRAMBLE: number[] = Array.from("01{}<>[]()/=+*;:._#$&abcdefgkmnrstxyz").map(gid);

// ── Targets ─────────────────────────────────────────────────────────────────
export interface Target {
  /** centro, en unidades de grilla (x: columnas, y: filas) */
  x: number;
  y: number;
  g: number;
  c: number;
  /** 1 = negrita */
  b: number;
}

class Builder {
  t: Target[] = [];

  put(x: number, y: number, g: number, c: number, b = 0) {
    this.t.push({ x: x + 0.5, y: y + 0.5, g, c, b });
  }

  text(x: number, y: number, s: string, c: number, b = 0) {
    const chars = Array.from(s);
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== " ") this.put(x + i, y, gid(chars[i]), c, b);
    }
  }

  /** Borde redondeado en sentido horario (el orden importa: el prompt lo dibuja así). */
  box(x: number, y: number, w: number, h: number, c: number) {
    const r = x + w - 1;
    const btm = y + h - 1;
    this.put(x, y, G.TL, c);
    for (let i = x + 1; i < r; i++) this.put(i, y, G.H, c);
    this.put(r, y, G.TR, c);
    for (let j = y + 1; j < btm; j++) this.put(r, j, G.V, c);
    this.put(r, btm, G.BR, c);
    for (let i = r - 1; i > x; i--) this.put(i, btm, G.H, c);
    this.put(x, btm, G.BL, c);
    for (let j = btm - 1; j > y; j--) this.put(x, j, G.V, c);
  }

  hline(x: number, y: number, w: number, c: number, step = 1) {
    for (let i = 0; i < w; i += step) this.put(x + i, y, G.H, c);
  }

  vline(x: number, y: number, h: number, c: number) {
    for (let j = 0; j < h; j++) this.put(x, y + j, G.V, c);
  }

  fill(x: number, y: number, w: number, h: number, c: number) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.put(x + i, y + j, G.FILL, c);
  }

  lights() {
    this.put(2, 1, G.BULLET, C.WARN);
    this.put(3, 1, G.BULLET, C.ATTR);
    this.put(4, 1, G.BULLET, C.ACCENT);
  }
}

// ── Código con resaltado de sintaxis ────────────────────────────────────────
const KW = new Set([
  "const", "await", "export", "default", "function", "return", "for", "of", "if", "true", "false",
]);
const TOKEN_RE = /("[^"]*"|\b\d+(?:\.\d+)?\b|<\/?[A-Z]\w*|[A-Za-z_]\w*(?==)|[A-Za-z_]\w*|\s+|.)/g;

function codeBlock(file: string, lines: string[]): Target[] {
  const b = new Builder();
  b.text(1, 1, file, C.DIM);
  lines.forEach((line, n) => {
    const row = 3 + n;
    b.text(n + 1 < 10 ? 2 : 1, row, String(n + 1), C.FAINT);
    let col = 4;
    for (const m of line.matchAll(TOKEN_RE)) {
      const tok = m[0];
      let c: number = C.DIM;
      if (/^\s+$/.test(tok)) c = -1;
      else if (tok[0] === '"') c = C.STR;
      else if (/^\d/.test(tok)) c = C.NUM;
      else if (tok[0] === "<" && tok.length > 1) c = C.TAG;
      else if (KW.has(tok)) c = C.KW;
      else if (/^[A-Za-z_]/.test(tok)) c = line[col - 4 + tok.length] === "=" ? C.ATTR : C.TEXT;
      if (c >= 0) b.text(col, row, tok, c);
      col += Array.from(tok).length;
    }
  });
  return b.t;
}

// ── Prompt ──────────────────────────────────────────────────────────────────
export const PROMPT_COL = 3;
export const PROMPT_ROW = 10;
const PROMPT_WIDTH = 34;

export interface PromptToken {
  line: number;
  /** columnas relativas a PROMPT_COL, sin el espacio inicial */
  start: number;
  end: number;
}

export interface PromptLayout {
  /** borde + etiquetas (aparecen dibujándose en sentido horario) */
  frame: Target[];
  /** caracteres en orden de tipeo; pos = índice en el texto (incluye espacios) */
  chars: { t: Target; pos: number; token: number }[];
  tokens: PromptToken[];
  /** posición del caret (columna, fila) después de tipear `pos` caracteres */
  caret: { x: number; y: number }[];
  length: number;
}

function wrap(text: string): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [""];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    const next = cur ? `${cur} ${w}` : w;
    if (Array.from(next).length <= PROMPT_WIDTH) lines[lines.length - 1] = next;
    else lines.push(w);
  }
  if (lines.length > 2) {
    const second = Array.from(lines[1]).slice(0, PROMPT_WIDTH - 1).join("");
    return [lines[0], `${second}…`];
  }
  return lines.map((l) => Array.from(l).slice(0, PROMPT_WIDTH).join(""));
}

export function buildPrompt(text: string): PromptLayout {
  const fb = new Builder();
  fb.box(1, 7, 38, 7, C.LINE);
  fb.text(PROMPT_COL, 8, "prompt", C.DIM);
  fb.text(30, 12, "[enter]", C.DIM);

  const lines = wrap(text);
  const chars: PromptLayout["chars"] = [];
  const tokens: PromptToken[] = [];
  const caret: PromptLayout["caret"] = [];
  let pos = 0;

  lines.forEach((line, li) => {
    const cs = Array.from(line);
    // Tokenizado tipo BPE: el espacio se pega a la palabra siguiente y las
    // palabras largas se parten en trozos de 4 y 3.
    const tokOf = new Array<number>(cs.length);
    let i = 0;
    while (i < cs.length) {
      const lead = cs[i] === " " ? 1 : 0;
      let j = i + lead;
      while (j < cs.length && cs[j] !== " ") j++;
      let k = i + lead;
      let size = 4;
      while (k < j) {
        const end = Math.min(j, k + size);
        const id = tokens.length;
        tokens.push({ line: li, start: k, end });
        for (let q = k === i + lead ? i : k; q < end; q++) tokOf[q] = id;
        k = end;
        size = size === 4 ? 3 : 4;
      }
      i = j;
    }
    cs.forEach((ch, ci) => {
      caret.push({ x: PROMPT_COL + ci, y: PROMPT_ROW + li });
      if (ch !== " ") {
        chars.push({
          t: { x: PROMPT_COL + ci + 0.5, y: PROMPT_ROW + li + 0.5, g: gid(ch), c: C.TEXT, b: 0 },
          pos,
          token: tokOf[ci] ?? 0,
        });
      }
      pos++;
    });
    if (li < lines.length - 1) {
      caret.push({ x: PROMPT_COL + cs.length, y: PROMPT_ROW + li });
      pos++; // el salto de línea "cuesta" una pulsación
    }
  });
  const last = lines[lines.length - 1];
  caret.push({ x: PROMPT_COL + Array.from(last).length, y: PROMPT_ROW + lines.length - 1 });

  return { frame: fb.t, chars, tokens, caret, length: pos };
}

// ── Interfaces ──────────────────────────────────────────────────────────────
function uiPeluqueria(): Target[] {
  const b = new Builder();
  b.box(0, 0, 40, 22, C.LINE);
  b.lights();
  b.text(16, 1, "nuri.cat", C.DIM);
  b.hline(1, 2, 38, C.LINE);
  b.text(2, 3, "NURI", C.TEXT, 1);
  b.text(20, 3, "servicios", C.DIM);
  b.text(30, 3, "reservar", C.ACCENT);
  b.text(2, 5, "Cortes y color", C.TEXT, 1);
  b.text(2, 6, "en pleno Gràcia", C.DIM);
  b.fill(2, 8, 15, 1, C.ACCENT);
  b.text(3, 8, "Reservar cita", C.INK, 1);
  // foto: caja con rayado diagonal
  b.box(22, 4, 16, 6, C.LINE);
  for (let y = 5; y < 9; y++) for (let x = 23; x < 37; x++) if ((x + y) % 3 === 0) b.text(x, y, "/", C.FAINT);
  b.text(2, 12, "Elegí un horario", C.TEXT, 1);
  b.text(31, 12, "mar 14", C.DIM);
  const times = [
    ["10:00", "11:30", "13:00", "16:30"],
    ["17:00", "18:30", "19:00", "20:00"],
  ];
  times.forEach((row, ri) =>
    row.forEach((t, ci) => {
      const x = 2 + ci * 9;
      const y = 14 + ri * 2;
      const on = ri === 0 && ci === 1;
      b.fill(x, y, 8, 1, on ? C.ACCENT : C.CHIP);
      b.text(x + 1.5, y, t, on ? C.INK : C.TEXT, on ? 1 : 0);
    }),
  );
  b.hline(1, 19, 38, C.FAINT);
  b.text(2, 20, "Gràcia · Barcelona", C.DIM);
  b.text(31, 20, "ca · es", C.DIM);
  return b.t;
}

function uiStock(): Target[] {
  const b = new Builder();
  b.box(0, 0, 40, 22, C.LINE);
  b.text(2, 1, "inventario", C.TEXT, 1);
  b.text(29, 1, "hoy 18:40", C.DIM);
  b.hline(1, 2, 38, C.LINE);
  b.vline(10, 3, 18, C.LINE);
  b.text(2, 4, "stock", C.ACCENT, 1);
  b.text(2, 6, "tiendas", C.DIM);
  b.text(2, 8, "almacén", C.DIM);
  b.text(2, 10, "alertas", C.DIM);
  b.put(9, 10, G.BULLET, C.WARN);
  b.box(12, 3, 12, 4, C.LINE);
  b.text(14, 4, "total kg", C.DIM);
  b.text(14, 5, "412,6", C.TEXT, 1);
  b.box(25, 3, 13, 4, C.LINE);
  b.text(27, 4, "alertas", C.DIM);
  b.text(27, 5, "2 tiendas", C.WARN, 1);
  b.text(12, 8, "kg por tienda", C.DIM);
  b.text(32, 8, "límite", C.WARN);
  b.hline(12, 9, 26, C.WARN, 2);
  const h = [5, 3, 7, 4, 6, 9, 3, 5, 4];
  h.forEach((v, i) => {
    const x = 13 + i * 3;
    b.fill(x, 18 - v, 2, v, v >= 9 ? C.WARN : C.ACCENT);
    b.text(x, 19, `T${i + 1}`, C.DIM);
  });
  b.hline(12, 18, 26, C.LINE);
  return b.t;
}

function uiYoga(): Target[] {
  const b = new Builder();
  b.box(0, 0, 40, 22, C.LINE);
  b.lights();
  b.text(15, 1, "prana.yoga", C.DIM);
  b.hline(1, 2, 38, C.LINE);
  b.text(2, 3, "prana", C.TEXT, 1);
  b.text(21, 3, "clases", C.DIM);
  b.text(29, 3, "precios", C.DIM);
  b.text(11.5, 5, "Respira, muévete.", C.TEXT, 1);
  b.text(7, 6, "Clases cada día en el Born", C.DIM);
  b.fill(13, 8, 14, 1, C.ACCENT);
  b.text(13.5, 8, "Probar gratis", C.INK, 1);
  b.text(14.5, 10, "más elegido", C.ACCENT);
  const plans = [
    ["Suelta", "15 €"],
    ["Mensual", "59 €"],
    ["Anual", "540 €"],
  ];
  plans.forEach(([name, price], i) => {
    const x = 1 + i * 13;
    const hot = i === 1;
    b.box(x, 11, 12, 8, hot ? C.ACCENT : C.LINE);
    b.text(x + 2, 12, name, hot ? C.ACCENT : C.DIM, hot ? 1 : 0);
    b.text(x + 2, 14, price, C.TEXT, 1);
    b.hline(x + 2, 16, 8, C.FAINT);
    b.hline(x + 2, 17, 5, C.FAINT);
  });
  b.text(2, 20, "El Born · Barcelona", C.DIM);
  return b.t;
}

function uiLeads(): Target[] {
  const b = new Builder();
  b.box(0, 0, 40, 22, C.LINE);
  b.text(2, 1, "leads", C.TEXT, 1);
  b.text(8, 1, "Barcelona", C.DIM);
  b.put(29, 1, G.BULLET, C.ACCENT);
  b.text(31, 1, "en curso", C.ACCENT);
  b.hline(1, 2, 38, C.LINE);
  b.text(2, 3, "negocio", C.DIM);
  b.text(19, 3, "nicho", C.DIM);
  b.text(29, 3, "fit", C.DIM);
  b.hline(1, 4, 38, C.FAINT);
  const rows: [string, string, number][] = [
    ["Estética Lua", "belleza", 8],
    ["Barbería Sants", "barbería", 6],
    ["Uñas Clot", "belleza", 7],
    ["Fisio Poble Sec", "salud", 4],
    ["Centro Aura", "belleza", 9],
  ];
  rows.forEach(([name, niche, fit], i) => {
    const y = 5 + i * 2;
    b.text(2, y, name, C.TEXT);
    b.text(19, y, niche, C.DIM);
    b.fill(29, y, fit, 1, fit >= 6 ? C.ACCENT : C.CHIP);
    for (let x = 29 + fit; x < 38; x++) b.put(x, y, G.DOT, C.LINE);
  });
  b.box(1, 15, 38, 6, C.LINE);
  b.text(3, 16, "201 leads", C.TEXT, 1);
  b.text(13, 16, "· 32 % cualificados", C.DIM);
  b.text(3, 17, "nicho ganador: belleza y estética", C.DIM);
  b.fill(3, 19, 13, 1, C.ACCENT);
  b.text(3.5, 19, "generar demo", C.INK, 1);
  b.fill(18, 19, 11, 1, C.CHIP);
  b.text(19, 19, "contactar", C.TEXT);
  return b.t;
}

// ── Escenas ─────────────────────────────────────────────────────────────────
export interface Scene {
  prompt: string;
  ui: Target[];
  code: Target[];
}

export const SCENES: Scene[] = [
  {
    prompt: "una web para una peluquería de Gràcia, con reservas online",
    ui: uiPeluqueria(),
    code: codeBlock("nuri/page.tsx", [
      "export default function Nuri() {",
      "  return (",
      "    <Page>",
      '      <Nav brand="NURI" />',
      "      <Hero",
      '        title="Cortes y color"',
      '        cta="Reservar cita"',
      "      />",
      "      <Slots",
      "        days={7}",
      "        onPick={reservar}",
      "      />",
      "    </Page>",
      "  );",
      "}",
    ]),
  },
  {
    prompt: "un panel de stock para 9 tiendas y un almacén",
    ui: uiStock(),
    code: codeBlock("panel/stock.tsx", [
      "const stock = await db.movimientos",
      '  .groupBy("tienda")',
      '  .sum("kg");',
      "",
      "export function Panel() {",
      "  return (",
      "    <Dashboard>",
      '      <Kpi label="total" />',
      "      <Bars data={stock} />",
      "      <Limit value={limite} />",
      "    </Dashboard>",
      "  );",
      "}",
    ]),
  },
  {
    prompt: "una landing para un estudio de yoga en el Born",
    ui: uiYoga(),
    code: codeBlock("prana/page.tsx", [
      "export default function Prana() {",
      "  return (",
      "    <Landing>",
      "      <Hero",
      '        title="Respira, muévete."',
      '        cta="Probar gratis"',
      "      />",
      "      <Pricing plans={[",
      "        suelta, mensual, anual,",
      "      ]} />",
      "    </Landing>",
      "  );",
      "}",
    ]),
  },
  {
    prompt: "un agente que encuentre negocios sin web en Barcelona",
    ui: uiLeads(),
    code: codeBlock("agente/leads.ts", [
      "const leads = await places.search({",
      '  city: "Barcelona",',
      "  sinWeb: true,",
      "});",
      "",
      "for (const lead of leads) {",
      "  lead.fit = puntuar(lead);",
      "  if (lead.fit > 0.7) {",
      "    await crearDemo(lead);",
      "  }",
      "}",
    ]),
  },
];

export const MAX_TARGETS = Math.max(
  220,
  ...SCENES.map((s) => Math.max(s.ui.length, s.code.length)),
);
