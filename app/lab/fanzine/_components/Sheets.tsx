import { tornEdge } from "./print";

/**
 * Stub under the hero: the next four sheets of the zine, stacked, each with
 * its own cut. Only a preview of the border treatment — content comes later.
 */
const SHEETS = [
  {
    n: "02",
    title: "Bio",
    cut: "Rasgada a mano",
    line: "Técnico en Informática. Más de cinco años haciendo frontend. Claude Code y Cursor, todos los días.",
    edge: "torn",
  },
  {
    n: "03",
    title: "Proyectos",
    cut: "Tijera dentada",
    line: "Siete proyectos reales: de una tienda en Tiendanube a una PWA para organizar planes en pareja.",
    edge: "zigzag",
  },
  {
    n: "04",
    title: "Blog",
    cut: "Troquelada",
    line: "Notas de taller. Todavía en imprenta.",
    edge: "perf",
  },
  {
    n: "05",
    title: "Contacto",
    cut: "Arrancada del anotador",
    line: "danicampu56@gmail.com",
    edge: "pad",
  },
] as const;

function TornTop() {
  const e = tornEdge(7);
  return (
    <svg
      className="fz-torn"
      viewBox={`0 0 ${e.w} ${e.h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={e.fiber} className="fz-torn__fiber" />
      <path d={e.paper} className="fz-torn__paper" />
    </svg>
  );
}

export function Sheets() {
  return (
    <section className="fz-stack" aria-labelledby="fz-stack-h">
      <h2 id="fz-stack-h" className="fz-sr">
        Próximas hojas
      </h2>
      {SHEETS.map((s) => (
        <article key={s.n} className={`fz-sheet fz-sheet--${s.edge}`}>
          {s.edge === "torn" && <TornTop />}
          <div className="fz-sheet__in">
            <p className="fz-sheet__meta">
              <span>Hoja {s.n}/05</span>
              <span>Corte: {s.cut}</span>
            </p>
            <h3 className="fz-sheet__h">{s.title}</h3>
            <p className="fz-sheet__p">{s.line}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
