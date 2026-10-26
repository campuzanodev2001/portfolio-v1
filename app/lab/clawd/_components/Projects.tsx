"use client";

import { useState } from "react";
import { FILTERS, PROJECTS, type Project, type Tag, type Text } from "./data";
import { Pixel } from "./Pixel";

/** Un texto del copy, o un dato que falta (se ve marcado, no se inventa). */
export function T({ v }: { v: Text }) {
  if (typeof v === "string") return <>{v}</>;
  return <span className="cl-pending">pendiente: {v.pending}</span>;
}

type Side = "me" | "ai";

function Card({ p, index }: { p: Project; index: number }) {
  const [side, setSide] = useState<Side>("me");
  const [open, setOpen] = useState(false);
  const list = side === "me" ? p.me : p.ai;
  const id = `pj-${p.slug}`;

  return (
    <li className="cl-card" data-side={side} style={{ "--i": index } as React.CSSProperties}>
      <div className="cl-card__head">
        <span className="cl-card__kicker">{p.kicker}</span>
        <span className="cl-card__status">
          <T v={p.status} />
        </span>
      </div>
      <h3 className="cl-card__name">{p.name}</h3>
      <p className="cl-card__one">
        <T v={p.oneLiner} />
      </p>

      {/* El reparto: lo que decidió Daniel / lo que hace la IA. Clawd se pasa de lado. */}
      <div className="cl-split" role="group" aria-label="Reparto del trabajo">
        <button
          type="button"
          className="cl-split__btn"
          aria-pressed={side === "me"}
          onClick={() => setSide("me")}
        >
          Qué decidí yo
        </button>
        <button
          type="button"
          className="cl-split__btn"
          aria-pressed={side === "ai"}
          onClick={() => setSide("ai")}
        >
          Qué hace la IA
        </button>
        <span className="cl-split__knob" aria-hidden="true" />
      </div>
      <div className="cl-split__body">
        <Pixel pose={side === "ai" ? "write" : "inspect"} className="cl-card__clawd" />
        <ul className="cl-card__list" aria-live="polite">
          {list.map((v, i) => (
            <li key={`${side}-${i}`} style={{ "--j": i } as React.CSSProperties}>
              <T v={v} />
            </li>
          ))}
        </ul>
      </div>

      <div className="cl-card__more" id={id} hidden={!open}>
        {p.body.map((v, i) => (
          <p key={i}>
            <T v={v} />
          </p>
        ))}
        {p.note && <p className="cl-card__note">{p.note}</p>}
      </div>

      <div className="cl-card__foot">
        <ul className="cl-tags" aria-label="Stack">
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <button
          type="button"
          className="cl-more"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Ver menos" : "Ver más"}
        </button>
      </div>
    </li>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<Tag | "todos">("todos");
  const shown = PROJECTS.filter((p) => filter === "todos" || p.tags.includes(filter));

  return (
    <>
      <div className="cl-filters" role="group" aria-label="Filtrar proyectos">
        {FILTERS.map((f) => {
          const n = f.id === "todos" ? PROJECTS.length : PROJECTS.filter((p) => p.tags.includes(f.id as Tag)).length;
          return (
            <button
              key={f.id}
              type="button"
              className="cl-chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label} <span className="cl-chip__n">{n}</span>
            </button>
          );
        })}
      </div>
      {shown.length ? (
        <ul className="cl-cards" key={filter}>
          {shown.map((p, i) => (
            <Card key={p.slug} p={p} index={i} />
          ))}
        </ul>
      ) : (
        <p className="cl-empty">No hay proyectos con este filtro todavía.</p>
      )}
    </>
  );
}
