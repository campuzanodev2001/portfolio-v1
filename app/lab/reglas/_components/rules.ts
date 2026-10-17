/*
 * Las Reglas — modelo del tablero (sin React, lo usan server y client).
 *
 * Tablero de 4 columnas x 5 filas. Una regla es SUSTANTIVO · ES · (PROPIEDAD |
 * SUSTANTIVO), leída de izquierda a derecha o de arriba hacia abajo.
 * Los "ES" están fijos: son el verbo, la gramática de la página.
 */

export const COLS = 4;
export const ROWS = 5;

export type Kind = "noun" | "op" | "prop";
export type Block = {
  id: string;
  /** Texto del bloque (línea 2 opcional para palabras compuestas). */
  w: string;
  w2?: string;
  /** Cómo se lee en voz alta / en el readout. */
  say: string;
  kind: Kind;
  fixed?: boolean;
};

export const BLOCKS: Record<string, Block> = {
  daniel: { id: "daniel", w: "DANIEL", say: "DANIEL", kind: "noun" },
  pagina: { id: "pagina", w: "PÁGINA", say: "PÁGINA", kind: "noun" },
  pelota: { id: "pelota", w: "PELOTA", say: "PELOTA", kind: "noun" },
  claude: { id: "claude", w: "CLAUDE", say: "CLAUDE", kind: "noun" },
  es1: { id: "es1", w: "ES", say: "ES", kind: "op", fixed: true },
  es2: { id: "es2", w: "ES", say: "ES", kind: "op", fixed: true },
  es3: { id: "es3", w: "ES", say: "ES", kind: "op", fixed: true },
  solver: { id: "solver", w: "PROBLEM", w2: "SOLVER", say: "PROBLEM SOLVER", kind: "prop" },
  voley: { id: "voley", w: "VOLEY", say: "VOLEY", kind: "prop" },
  musica: { id: "musica", w: "MÚSICA", say: "MÚSICA", kind: "prop" },
  profe: { id: "profe", w: "PROFE", say: "PROFE", kind: "prop" },
  gamer: { id: "gamer", w: "GAMER", say: "GAMER", kind: "prop" },
  clara: { id: "clara", w: "CLARA", say: "CLARA", kind: "prop" },
  oscura: { id: "oscura", w: "OSCURA", say: "OSCURA", kind: "prop" },
  saque: { id: "saque", w: "SAQUE", say: "SAQUE", kind: "prop" },
};

const _ = null;
/** Fila por fila. Ojo: ninguna columna arma una regla vertical al inicio. */
export const INITIAL: (string | null)[] = [
  "daniel", "es1", "solver", "voley",
  "pagina", "es2", "clara", "musica",
  _, _, _, "profe",
  "pelota", "es3", _, "gamer",
  "claude", _, "oscura", "saque",
];

/** Orden de caída en el loader: primero la oración principal. */
export const DROP_ORDER = [
  "daniel", "es1", "solver", "pagina", "es2", "clara", "voley", "musica",
  "profe", "pelota", "es3", "gamer", "claude", "oscura", "saque",
];

export type Rule = { s: string; o: string; ids: string[]; text: string };

export function findRules(cells: (string | null)[]): Rule[] {
  const out: Rule[] = [];
  const at = (c: number, r: number) =>
    c < COLS && r < ROWS ? cells[r * COLS + c] : null;
  const dirs: [number, number][] = [
    [1, 0],
    [0, 1],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const a = at(c, r);
      if (!a || BLOCKS[a].kind !== "noun") continue;
      for (const [dc, dr] of dirs) {
        const b = at(c + dc, r + dr);
        const d = at(c + 2 * dc, r + 2 * dr);
        if (!b || !d || BLOCKS[b].kind !== "op" || BLOCKS[d].kind === "op") continue;
        out.push({
          s: a,
          o: d,
          ids: [a, b, d],
          text: `${BLOCKS[a].say} ES ${BLOCKS[d].say}`,
        });
      }
    }
  }
  return out;
}

export const PERSONAS = ["solver", "voley", "musica", "profe", "gamer"] as const;
export type Persona = (typeof PERSONAS)[number] | "nada" | "claude";

export type Effects = {
  persona: Persona;
  dark: boolean;
  honest: boolean;
  saque: boolean;
  /** Ids de bloques que forman reglas con efecto. */
  live: Set<string>;
  /** Reglas bien formadas que la página todavía no entiende. */
  idle: Rule[];
};

export function effects(rules: Rule[]): Effects {
  const fx: Effects = {
    persona: "nada",
    dark: false,
    honest: false,
    saque: false,
    live: new Set(),
    idle: [],
  };
  let personaSet = false;
  for (const r of rules) {
    let ok = false;
    if (r.s === "daniel" && !personaSet) {
      if ((PERSONAS as readonly string[]).includes(r.o)) {
        fx.persona = r.o as Persona;
        ok = personaSet = true;
      } else if (r.o === "claude") {
        fx.persona = "claude";
        ok = personaSet = true;
      }
    } else if (r.s === "pagina" && (r.o === "oscura" || r.o === "clara")) {
      fx.dark = r.o === "oscura";
      ok = true;
    } else if (r.s === "claude" && r.o === "daniel") {
      fx.honest = ok = true;
    } else if (r.s === "pelota" && (r.o === "saque" || r.o === "voley")) {
      fx.saque = ok = true;
    }
    if (ok) r.ids.forEach((id) => fx.live.add(id));
    else fx.idle.push(r);
  }
  return fx;
}

export const PERSONA_SAY: Record<Persona, string> = {
  solver: "Daniel en modo default: resolver.",
  voley: "Daniel en modo vóley.",
  musica: "Daniel en modo música.",
  profe: "Daniel en modo profe.",
  gamer: "Daniel en modo gamer.",
  nada: "Sin regla, Daniel no es nada. Volvé a armar la oración.",
  claude: "No. Claude ayuda, pero Daniel decide.",
};
