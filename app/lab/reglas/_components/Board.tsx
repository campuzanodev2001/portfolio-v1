"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import {
  BLOCKS,
  COLS,
  DROP_ORDER,
  INITIAL,
  PERSONA_SAY,
  ROWS,
  effects,
  findRules,
} from "./rules";

type Drag = {
  i: number;
  x: number;
  y: number;
  id: number;
  moving: boolean;
};

const v = (o: Record<string, string | number>) => o as CSSProperties;
const pos = (i: number) => ({ c: i % COLS, r: Math.floor(i / COLS) });
const reduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Board() {
  const [cells, setCells] = useState(INITIAL);
  const [picked, setPicked] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [hint, setHint] = useState(false);
  const [msg, setMsg] = useState("");
  const [ball, setBall] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const drag = useRef<Drag | null>(null);
  const swallowClick = useRef(false);
  const touched = useRef(false);

  const rules = useMemo(() => findRules(cells), [cells]);
  const fx = useMemo(() => effects(rules), [rules]);

  /* Las reglas mandan sobre la raíz: el CSS hace el resto. */
  useEffect(() => {
    const root = document.getElementById("reglas");
    if (!root) return;
    root.dataset.persona = fx.persona;
    root.dataset.theme = fx.dark ? "oscura" : "clara";
    root.dataset.honest = fx.honest ? "1" : "0";
  }, [fx]);

  /* Pista sin palabras: cuando termina el loader, VOLEY amaga hacia el slot. */
  useEffect(() => {
    const root = document.getElementById("reglas");
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      const s = root?.dataset.stage;
      if (s && s !== "done") return;
      root?.removeEventListener("stage", arm);
      t1 = setTimeout(() => {
        if (touched.current) return;
        setHint(true);
        t2 = setTimeout(() => setHint(false), 5000);
      }, 700);
    };
    root?.addEventListener("stage", arm);
    arm();
    return () => {
      root?.removeEventListener("stage", arm);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const interact = () => {
    touched.current = true;
    if (hint) setHint(false);
  };

  const nope = (i: number, why: string) => {
    const id = cells[i];
    const el = id ? blockRefs.current[id]?.firstElementChild : null;
    if (el && !reduced()) {
      el.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-6%) rotate(-4deg)" },
          { transform: "translateX(6%) rotate(4deg)" },
          { transform: "translateX(-3%)" },
          { transform: "translateX(0)" },
        ],
        { duration: 340, easing: "ease-out" },
      );
    }
    setMsg(why);
  };

  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = cells.slice();
    [next[from], next[to]] = [next[to], next[from]];
    const before = new Set(findRules(cells).map((r) => r.text));
    const nextRules = findRules(next);
    const after = new Set(nextRules.map((r) => r.text));
    const nfx = effects(nextRules);
    const made = [...after].filter((t) => !before.has(t));
    const broke = [...before].filter((t) => !after.has(t));

    const parts: string[] = [];
    if (made.length) parts.push(`Formaste ${made.join(" y ")}.`);
    if (broke.length && !made.length) parts.push(`Rompiste ${broke.join(" y ")}.`);
    if (nfx.persona !== fx.persona) parts.push(PERSONA_SAY[nfx.persona]);
    if (nfx.dark !== fx.dark) parts.push(nfx.dark ? "La página se apagó." : "Volvió la luz.");
    if (nfx.honest && !fx.honest) parts.push("Mirá los créditos.");
    if (nfx.saque && !fx.saque) parts.push("¡Saque!");
    const idleNew = nfx.idle.filter((r) => made.includes(r.text));
    if (idleNew.length) parts.push("Esa regla todavía no hace nada.");
    if (!parts.length) parts.push("Nada cambió. Probá armar una oración.");

    if (nfx.saque && !fx.saque) setBall((n) => n + 1);
    setCells(next);
    setMsg(parts.join(" "));
  };

  const activate = (i: number) => {
    interact();
    const id = cells[i];
    if (picked === null) {
      if (!id) return;
      if (BLOCKS[id].fixed) return nope(i, "ES no se mueve: es el verbo. Mové lo que lo rodea.");
      setPicked(i);
      setMsg(`Agarraste ${BLOCKS[id].say}. Elegí dónde soltarlo.`);
      return;
    }
    if (picked === i) {
      setPicked(null);
      setMsg("Lo soltaste donde estaba.");
      return;
    }
    if (id && BLOCKS[id].fixed) return nope(i, "Ahí está el ES, y de ahí no se mueve.");
    move(picked, i);
    setPicked(null);
  };

  const focusAt = (i: number) => {
    setFocus(i);
    slotRefs.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const { c, r } = pos(i);
    let n = -1;
    if (e.key === "ArrowRight") n = r * COLS + Math.min(COLS - 1, c + 1);
    else if (e.key === "ArrowLeft") n = r * COLS + Math.max(0, c - 1);
    else if (e.key === "ArrowDown") n = Math.min(ROWS - 1, r + 1) * COLS + c;
    else if (e.key === "ArrowUp") n = Math.max(0, r - 1) * COLS + c;
    else if (e.key === "Home") n = r * COLS;
    else if (e.key === "End") n = r * COLS + COLS - 1;
    else if (e.key === "Escape" && picked !== null) {
      e.preventDefault();
      setPicked(null);
      setMsg("Cancelado.");
      return;
    }
    if (n < 0) return;
    e.preventDefault();
    interact();
    focusAt(n);
  };

  /* Arrastre: el bloque sigue al puntero; al soltar, cae en la celda de abajo. */
  const cellFromPoint = (x: number, y: number) => {
    const b = boardRef.current?.getBoundingClientRect();
    if (!b) return -1;
    const c = Math.floor(((x - b.left) / b.width) * COLS);
    const r = Math.floor(((y - b.top) / b.height) * ROWS);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return -1;
    return r * COLS + c;
  };

  const blockEl = (i: number) => {
    const id = cells[i];
    return id ? blockRefs.current[id] : null;
  };

  const onDown = (e: PointerEvent<HTMLButtonElement>, i: number) => {
    const id = cells[i];
    if (e.button !== 0 || !id || BLOCKS[id].fixed) return;
    drag.current = { i, x: e.clientX, y: e.clientY, id: e.pointerId, moving: false };
  };

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moving) {
      if (Math.hypot(dx, dy) < 8) return;
      d.moving = true;
      interact();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      setPicked(d.i);
    }
    const el = blockEl(d.i);
    if (el) {
      el.dataset.drag = "1";
      el.style.setProperty("--dx", `${dx}px`);
      el.style.setProperty("--dy", `${dy}px`);
    }
  };

  const endDrag = (e: PointerEvent<HTMLButtonElement>, cancel = false) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moving) return;
    const el = blockEl(d.i);
    if (el) {
      delete el.dataset.drag;
      el.style.removeProperty("--dx");
      el.style.removeProperty("--dy");
    }
    swallowClick.current = true;
    setTimeout(() => (swallowClick.current = false), 0);
    setPicked(null);
    if (cancel) return;
    const t = cellFromPoint(e.clientX, e.clientY);
    if (t < 0 || t === d.i) return;
    const tid = cells[t];
    if (tid && BLOCKS[tid].fixed) return nope(t, "Ahí está el ES, y de ahí no se mueve.");
    move(d.i, t);
    setFocus(t);
  };

  const label = (i: number) => {
    const { c, r } = pos(i);
    const id = cells[i];
    const what = id
      ? `${BLOCKS[id].say}${BLOCKS[id].fixed ? " (fijo)" : ""}`
      : "vacío";
    return `Fila ${r + 1}, columna ${c + 1}: ${what}`;
  };

  const idOrder = Object.keys(BLOCKS);
  const at = (id: string) => cells.indexOf(id);

  return (
    <div className="rg-play">
      <p id="rg-howto" className="rg-sr">
        Tablero de palabras. Cada fila o columna que dice SUSTANTIVO ES
        PROPIEDAD es una regla de la página. Moverse con flechas; Enter o
        Espacio agarra un bloque y Enter lo suelta en otra celda, intercambiando
        lugares. Escape cancela. Los bloques ES están fijos.
      </p>
      <div
        ref={boardRef}
        className="rg-board"
        data-hint={hint ? "1" : undefined}
        data-picking={picked !== null ? "1" : undefined}
      >
        <div className="rg-grid" aria-hidden="true">
          {cells.map((_, i) => (
            <span key={i} className="rg-cell" />
          ))}
        </div>

        <div className="rg-blocks" aria-hidden="true">
          {idOrder.map((id) => {
            const b = BLOCKS[id];
            const i = at(id);
            if (i < 0) return null;
            const { c, r } = pos(i);
            const cls = [
              "rg-b",
              `rg-k-${b.kind}`,
              fx.live.has(id) ? "rg-on" : "",
              picked === i ? "rg-up" : "",
              b.w2 ? "rg-two" : "",
            ].join(" ");
            return (
              <div
                key={id}
                ref={(el) => {
                  blockRefs.current[id] = el;
                }}
                className={cls}
                data-id={id}
                style={v({ "--c": c, "--row": r, "--i": DROP_ORDER.indexOf(id) })}
              >
                <div className="rg-b-in">
                  <span className="rg-w">{b.w}</span>
                  {b.w2 && <span className="rg-w">{b.w2}</span>}
                  {b.kind === "op" && (
                    <svg className="rg-arrow" viewBox="0 0 24 8" aria-hidden="true">
                      <path d="M0 4h20M16 0.5 20 4l-4 3.5" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
          <div className="rg-hintarrow" style={v({ "--c": 2.5, "--row": 0 })}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 12H5M10 6l-6 6 6 6" />
            </svg>
          </div>
        </div>

        <div
          className="rg-slots"
          role="group"
          aria-label="Tablero de reglas"
          aria-describedby="rg-howto"
        >
          {cells.map((id, i) => (
            <button
              key={i}
              type="button"
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              className="rg-slot"
              data-has={id ? (BLOCKS[id].fixed ? "fixed" : "1") : undefined}
              tabIndex={i === focus ? 0 : -1}
              aria-label={label(i)}
              aria-pressed={picked === i}
              onFocus={() => setFocus(i)}
              onKeyDown={(e) => onKey(e, i)}
              onPointerDown={(e) => onDown(e, i)}
              onPointerMove={onMove}
              onPointerUp={(e) => endDrag(e)}
              onPointerCancel={(e) => endDrag(e, true)}
              onClick={() => {
                if (swallowClick.current) return;
                activate(i);
              }}
            />
          ))}
        </div>
      </div>

      <div className="rg-readout">
        <ul className="rg-rules" aria-label="Reglas activas">
          {rules.length === 0 && <li className="rg-idle">ninguna regla en pie</li>}
          {rules.map((r) => (
            <li key={r.text} className={fx.idle.includes(r) ? "rg-idle" : ""}>
              <span aria-hidden="true">→ </span>
              {r.text}
            </li>
          ))}
        </ul>
        <p className="rg-msg" role="status" aria-live="polite">
          {msg}
        </p>
      </div>

      {ball > 0 && (
        <div key={ball} className="rg-ball" aria-hidden="true" onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setBall(0);
        }}>
          <div className="rg-ball-y">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" />
              <path d="M20 2c-6 8-6 22 0 36M2 20c9-4 22-3 33 6M8 7c10 2 20 10 24 26" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
