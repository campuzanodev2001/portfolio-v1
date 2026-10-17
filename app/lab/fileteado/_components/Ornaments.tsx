"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { CREMA, SPROUT_SLOTS, generate, sprout, type HostSpine, type Piece, type gem } from "./geometry";
import styles from "../fileteado.module.css";

type Gem = ReturnType<typeof gem>;
type CornerKey = "tl" | "tr" | "bl" | "br";

/* Las cuatro esquinas son la misma pieza espejada: así manda el oficio. */
const CORNERS: { k: CornerKey; t?: string }[] = [
  { k: "tl" },
  { k: "tr", t: "matrix(-1 0 0 1 200 0)" },
  { k: "bl", t: "matrix(1 0 0 -1 0 200)" },
  { k: "br", t: "matrix(-1 0 0 -1 200 200)" },
];

const ms = (d: number, t?: number) =>
  ({ "--d": `${d}ms`, ...(t ? { "--t": `${t}ms` } : {}) }) as CSSProperties;

function PieceMask({ p, className }: { p: Piece; className: string }) {
  return (
    <mask id={`fil-m-${p.id}`} maskUnits="userSpaceOnUse" x="-60" y="-60" width="320" height="320">
      <path
        d={p.mask.d}
        className={className}
        style={ms(p.delay, p.dur)}
        fill="none"
        stroke="#fff"
        strokeWidth={p.mask.w}
        pathLength={1}
      />
    </mask>
  );
}

function PieceArt({ p }: { p: Piece }) {
  return (
    <g mask={`url(#fil-m-${p.id})`}>
      {p.layers.map((l, i) => (
        <path key={i} d={l.d} fill={l.fill} />
      ))}
    </g>
  );
}

function GemArt({ g, stroke }: { g: Gem; stroke: number }) {
  return (
    <>
      <path d={g.outline} fill="none" stroke={CREMA} strokeWidth={stroke} strokeLinejoin="round" />
      {g.facets.map((l, i) => (
        <path key={i} d={l.d} fill={l.fill} />
      ))}
      <circle cx={g.glint.cx} cy={g.glint.cy} r={g.glint.r} fill="#fff" />
    </>
  );
}

interface Sprout {
  n: number;
  slot: number;
  pieces: Piece[];
}

/**
 * Cinco lugares para brotar; al sexto toque el fileteador poda y vuelve a
 * empezar. Azar libre (Math.random): cada visita florece distinto.
 */
function growSprout(current: Sprout[], host: HostSpine): Sprout[] {
  const base = current.length >= SPROUT_SLOTS.length ? [] : current;
  const used = new Set(base.map((s) => s.slot));
  const free = SPROUT_SLOTS.map((_, i) => i).filter((i) => !used.has(i));
  const slot = free[Math.floor(Math.random() * free.length)];
  const n = (current.at(-1)?.n ?? 0) + 1;
  const pieces = sprout(host, slot, Math.floor(Math.random() * 2 ** 32), n);
  return [...base, { n, slot, pieces }];
}

/**
 * Define (una sola vez, en <defs>) la media esquina, la esquina completa, la
 * unidad de guarda y la piedra lateral; después las cuatro esquinas son
 * <use> espejados. Todo lo que se anima vive en las máscaras (que no se
 * clonan), así el florecimiento puede agregar piezas sin re-disparar nada.
 */
export default function Ornaments({ seed }: { seed: number }) {
  const orn = useMemo(() => generate(seed), [seed]);
  const [sprouts, setSprouts] = useState<Sprout[]>([]);
  const [bloom, setBloom] = useState<{ k: CornerKey; n: number } | null>(null);

  const onBloom = (k: CornerKey) => {
    const next = growSprout(sprouts, orn.host);
    setSprouts(next);
    setBloom({ k, n: next.at(-1)!.n });
  };

  const { half, corner, unit, side } = orn;

  return (
    <>
      <svg className={styles.defs} aria-hidden="true" focusable="false" width="0" height="0">
        <defs>
          {[...half.pieces, ...unit.pieces].map((p) => (
            <PieceMask key={p.id} p={p} className={styles.grow} />
          ))}
          {sprouts.flatMap((s) =>
            s.pieces.map((p) => <PieceMask key={p.id} p={p} className={styles.sprout} />),
          )}
          <mask id="fil-m-gem" maskUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240">
            <circle className={styles.popMask} style={ms(0)} cx="31" cy="31" r="36" fill="#fff" />
          </mask>
          <mask id="fil-m-pearls" maskUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240">
            <circle className={styles.popMask} style={ms(half.pearlDelay)} cx="96" cy="96" r="26" fill="#fff" />
          </mask>
          <mask id="fil-m-ugem" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="48">
            <circle className={styles.popMask} style={ms(620)} cx="60" cy="24" r="18" fill="#fff" />
          </mask>

          <g id="fil-half">
            {half.pieces.map((p) => (
              <PieceArt key={p.id} p={p} />
            ))}
            <g mask="url(#fil-m-pearls)">
              {half.pearls.map((q, i) => (
                <circle key={i} cx={q.cx} cy={q.cy} r={q.r} fill={q.fill} />
              ))}
            </g>
            {sprouts.flatMap((s) => s.pieces.map((p) => <PieceArt key={p.id} p={p} />))}
          </g>
          <g id="fil-corner">
            <use href="#fil-half" />
            <use href="#fil-half" transform="matrix(0 1 1 0 0 0)" />
            <g mask="url(#fil-m-gem)">
              <GemArt g={corner} stroke={2.6} />
            </g>
          </g>

          <g id="fil-unit">
            {unit.pieces.map((p) => (
              <PieceArt key={p.id} p={p} />
            ))}
            <g transform="matrix(-1 0 0 1 120 0)">
              {unit.pieces.map((p) => (
                <PieceArt key={p.id} p={p} />
              ))}
            </g>
            <g mask="url(#fil-m-ugem)">
              <GemArt g={unit.gem} stroke={1.8} />
            </g>
          </g>
          <g id="fil-gem-side">
            <GemArt g={side} stroke={1.6} />
          </g>
        </defs>
      </svg>

      {CORNERS.map((c) => (
        <button
          key={c.k}
          type="button"
          className={`${styles.corner} ${styles[c.k]}`}
          onClick={() => onBloom(c.k)}
          aria-label="Esquinero fileteado"
        >
          <svg
            key={bloom?.k === c.k ? bloom.n : 0}
            className={`${styles.cornerArt} ${bloom?.k === c.k ? styles.spring : ""}`}
            viewBox="0 0 200 200"
            aria-hidden="true"
            focusable="false"
          >
            <use href="#fil-corner" transform={c.t} />
          </svg>
        </button>
      ))}
    </>
  );
}
