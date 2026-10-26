"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECTS, type Text } from "./data";
import { Pixel } from "./Pixel";

/**
 * Proyectos como vías. "La IA corre, yo pongo las vías": cada proyecto es una
 * estación sobre una vía horizontal (swipe con scroll-snap). Antes de cada
 * estación hay una aguja cerrada; al tocarla, Daniel tiende la vía (sus
 * decisiones se asientan en crema) y recién entonces Clawd entra con el vagón
 * y descarga sus cajas (lo que hace la IA, en coral). Sin tocarla, Clawd espera.
 */

/** Un texto del copy, o un dato que falta (se ve marcado, no se inventa). */
export function T({ v }: { v: Text }) {
  if (typeof v === "string") return <>{v}</>;
  return <span className="cl-pending">pendiente: {v.pending}</span>;
}

const TRAVEL_MS = 1100;

// El strip es position: relative, así que offsetLeft ya es relativo a él.
const pad = (el: HTMLElement) => parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;

// Cajas sobre el vagón: dos a los costados de Clawd y una apilada.
const CRATES = [
  { x: 4, y: -3 },
  { x: 24, y: -3 },
  { x: 4, y: -7 },
];

// Vagón de 32×9 en la misma grilla que Clawd (viewBox con 8 filas arriba para
// las cajas apiladas, que son la carga de la IA).
function Wagon({ crates }: { crates: number }) {
  return (
    <svg className="pj-wagon" viewBox="0 -8 32 17" shapeRendering="crispEdges" aria-hidden="true">
      {CRATES.slice(0, crates).map((c, i) => (
        <g key={i} className="pj-crate">
          <rect x={c.x} y={c.y} width={4} height={4} fill="#f2ad8e" />
          <rect x={c.x} y={c.y + 3} width={4} height={1} fill="#ad5a3f" />
          <rect x={c.x + 1} y={c.y + 1} width={2} height={1} fill="#d97757" />
        </g>
      ))}
      <rect x={3} y={1} width={26} height={5} fill="#2e2a25" />
      <rect x={3} y={1} width={26} height={1} fill="#ad5a3f" />
      <rect x={1} y={4} width={2} height={1} fill="#57503f" />
      <rect x={29} y={4} width={2} height={1} fill="#57503f" />
      {[7, 22].map((x) => (
        <g key={x} className="pj-wheel">
          <rect x={x} y={6} width={3} height={3} fill="#f3efe6" />
          <rect className="pj-spoke" x={x + 1} y={6} width={1} height={1} fill="#2a2622" />
        </g>
      ))}
    </svg>
  );
}

export function Projects() {
  const strip = useRef<HTMLOListElement>(null);
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(() => PROJECTS.map(() => false));
  // Estación donde ya descargó (llegó con la aguja abierta).
  const [unloaded, setUnloaded] = useState(() => PROJECTS.map(() => false));
  const [moving, setMoving] = useState(false);

  // Estación actual = la más cercana al borde izquierdo del strip.
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const items = [...el.children] as HTMLElement[];
      let best = 0;
      let dist = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(it.offsetLeft - el.scrollLeft - pad(el));
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setAt(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Con reduced motion: vías tendidas y carga descargada, sin viaje.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const all = PROJECTS.map(() => true);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia del sistema, se lee una vez al montar
      setOpen(all);
      setUnloaded(all);
    }
  }, []);

  // El vagón viaja; al llegar a una estación con la vía tendida, descarga.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- el viaje arranca cuando cambia el destino
    setMoving(true);
    const t = window.setTimeout(() => {
      setMoving(false);
      if (open[at]) setUnloaded((u) => (u[at] ? u : u.map((v, i) => v || i === at)));
    }, TRAVEL_MS);
    return () => clearTimeout(t);
  }, [at, open]);

  const go = (i: number) => {
    const el = strip.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    el.scrollTo({ left: item.offsetLeft - pad(el) });
  };

  const docked = open[at];
  const crates = docked && unloaded[at] ? 0 : Math.min(3, PROJECTS[at].ai.length);

  return (
    <div className="pj" data-moving={moving ? "" : undefined}>
      <div className="pj-rail" data-reveal="custom">
        <ol className="pj-strip" ref={strip} tabIndex={0} aria-label="Proyectos: deslizá para pasar de estación">
          {PROJECTS.map((p, i) => (
            <li
              key={p.slug}
              className="pj-station"
              aria-label={`Estación ${i + 1} de ${PROJECTS.length}: ${p.name}`}
              data-open={open[i] ? "" : undefined}
              data-unloaded={unloaded[i] ? "" : undefined}
              data-here={at === i ? "" : undefined}
            >
              {/* La escena: aguja + vía + andén. El vagón se dibuja aparte. */}
              <div className="pj-scene">
                <button
                  type="button"
                  className="pj-switch"
                  aria-pressed={open[i]}
                  onClick={() => setOpen((o) => o.map((v, j) => (j === i ? true : v)))}
                  disabled={open[i]}
                >
                  <span className="pj-switch__lever" aria-hidden="true" />
                  <span className="pj-switch__label">{open[i] ? "Vía tendida" : "Tender la vía"}</span>
                </button>
                <span className="pj-sign" aria-hidden="true">
                  E{i + 1}
                </span>
                {at === i && (
                  <div className="pj-train" data-wait={!open[i] ? "" : undefined}>
                    <span className="pj-ask" aria-hidden="true">
                      ?
                    </span>
                    <Pixel pose={open[i] ? "idle" : "inspect"} className="pj-clawd" />
                    <Wagon crates={crates} />
                  </div>
                )}
              </div>

              <div className="pj-board">
                <p className="pj-kicker">
                  <span>{p.kicker}</span>
                  <span className="pj-status">
                    <T v={p.status} />
                  </span>
                </p>
                <h3 className="pj-name">{p.name}</h3>
                <p className="pj-one">
                  <T v={p.oneLiner} />
                </p>

                <div className="pj-cols">
                  <div className="pj-me">
                    <h4 className="pj-h">Las vías · lo que decidí yo</h4>
                    <ul>
                      {p.me.map((v, j) => (
                        <li key={j} style={{ "--j": j } as React.CSSProperties}>
                          <T v={v} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pj-ai">
                    <h4 className="pj-h">La carga · lo que hace la IA</h4>
                    <ul>
                      {p.ai.map((v, j) => (
                        <li key={j} style={{ "--j": j } as React.CSSProperties}>
                          <T v={v} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pj-more">
                  {p.body.map((v, j) => (
                    <p key={j}>
                      <T v={v} />
                    </p>
                  ))}
                  {p.note && <p className="pj-note">{p.note}</p>}
                  <p className="pj-stack">{p.stack.join(" · ")}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="pj-nav">
        <button type="button" className="pj-nav__btn" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Estación anterior">
          ←
        </button>
        <ol className="pj-dots" aria-label="Estaciones">
          {PROJECTS.map((p, i) => (
            <li key={p.slug}>
              <button
                type="button"
                aria-label={p.name}
                aria-current={at === i ? "step" : undefined}
                data-open={open[i] ? "" : undefined}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ol>
        <span className="pj-count" aria-live="polite">
          {at + 1}/{PROJECTS.length}
        </span>
        <button
          type="button"
          className="pj-nav__btn"
          onClick={() => go(at + 1)}
          disabled={at === PROJECTS.length - 1}
          aria-label="Estación siguiente"
        >
          →
        </button>
      </div>
    </div>
  );
}
