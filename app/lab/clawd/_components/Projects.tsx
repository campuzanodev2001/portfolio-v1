"use client";

import Image from "next/image";
import { useState } from "react";
import { PROJECTS, type Text } from "./data";
import { Pixel } from "./Pixel";

/**
 * Proyectos como una torre. Un edificio de píxeles, un proyecto por piso
 * (abajo el primero, en orden cronológico: de las webs para clientes a los
 * agentes). Narra Clawd: las vigas crema son lo que decidió Daniel; los
 * ladrillos coral, lo que hice yo (la IA). El dibujo queda sticky y el texto pasa al lado: cada
 * piso que cruza la línea de lectura se construye (de plano punteado a sólido:
 * primero las vigas, después los ladrillos) y la cámara sube un piso. Clawd,
 * con casco, sube con ella. Pasar o tocar una decisión resalta su viga.
 * Arriba, en la terraza, hay un parlante y una red: la salida a Fuera del código.
 *
 * Los pisos y la cámara se manejan con --at (Enhance): -1 plano, 0…N-1 pisos,
 * N terraza. Cada piso lleva --f (su índice) y el CSS calcula con calc() si
 * está construido, a qué altura va la cámara y dónde se para Clawd, para
 * cualquier cantidad de pisos (--n, --bh = alto del dibujo).
 */

/** Un texto del copy, o un dato que falta (se ve marcado, no se inventa). */
export function T({ v }: { v: Text }) {
  if (typeof v === "string") return <>{v}</>;
  return <span className="cl-pending">pendiente: {v.pending}</span>;
}

// Geometría en unidades del dibujo: 64 de ancho, 24 por piso, 16 de terraza.
const FLOOR_H = 24;
const ROOF_H = 16;
const N = PROJECTS.length;
const BUILD_H = ROOF_H + N * FLOOR_H;
const top = (i: number) => ROOF_H + (N - 1 - i) * FLOOR_H;

type Hot = { f: number; j: number } | null;

function Building({ hot }: { hot: Hot }) {
  return (
    <svg className="tw-svg" viewBox={`0 0 64 ${BUILD_H}`} shapeRendering="crispEdges" aria-hidden="true">
      {/* Suelo: la rama de Sobre mí, hecha línea de obra. */}
      <rect x={0} y={BUILD_H - 1} width={64} height={1} className="tw-ground" />

      {PROJECTS.map((p, i) => {
        const y = top(i);
        return (
          <g key={p.slug} data-floor={i} className="tw-floor-g" style={{ "--f": i } as React.CSSProperties}>
            {/* plano: contorno punteado */}
            <rect x={2.25} y={y + 0.25} width={59.5} height={FLOOR_H - 0.5} className="tw-plan" />
            <g className="tw-solid">
              <rect x={2} y={y} width={60} height={2} className="tw-slab" />
              <rect x={4} y={y + 2} width={2} height={FLOOR_H - 2} className="tw-col" />
              <rect x={58} y={y + 2} width={2} height={FLOOR_H - 2} className="tw-col" />
            </g>
            {p.me.map((_, j) => (
              <rect
                key={j}
                x={8}
                y={y + 5 + j * 3}
                width={48}
                height={1}
                className={hot && hot.f === i && hot.j === j ? "tw-beam is-hot" : "tw-beam"}
                style={{ "--j": j } as React.CSSProperties}
              />
            ))}
            {p.ai.map((v, k) => (
              <g key={k} className="tw-brick" style={{ "--k": k } as React.CSSProperties}>
                {typeof v === "string" ? (
                  <>
                    <rect x={9 + k * 8} y={y + 18} width={6} height={4} className="tw-brick__b" />
                    <rect x={9 + k * 8} y={y + 18} width={6} height={1} className="tw-brick__t" />
                  </>
                ) : (
                  <rect x={9.25 + k * 8} y={y + 18.25} width={5.5} height={3.5} className="tw-brick__pending" />
                )}
              </g>
            ))}
          </g>
        );
      })}

      {/* Terraza: parlante a un lado, red al otro. */}
      <g data-floor={N} className="tw-roof" style={{ "--f": N } as React.CSSProperties}>
        <g className="tw-speaker">
          <rect x={6} y={6} width={8} height={10} className="tw-box" />
          <rect x={8} y={8} width={4} height={4} className="tw-cone" />
          <rect x={9} y={13} width={2} height={1} className="tw-cone" />
        </g>
        <rect x={50} y={5} width={1} height={11} className="tw-col" />
        <rect x={60} y={5} width={1} height={11} className="tw-col" />
        {[5, 7, 9].map((ny) => (
          <rect key={ny} x={51} y={ny} width={9} height={1} className="tw-net" />
        ))}
        {[53, 56].map((nx) => (
          <rect key={nx} x={nx} y={5} width={1} height={5} className="tw-net" />
        ))}
      </g>
    </svg>
  );
}

export function Projects() {
  const [hot, setHot] = useState<Hot>(null);

  return (
    <div className="tw" data-scrub="0.5" style={{ "--n": N, "--bh": BUILD_H } as React.CSSProperties}>
      <div className="tw-graphic" aria-hidden="true">
        <div className="tw-frame" data-reveal="custom">
          <div className="tw-world" style={{ aspectRatio: `64 / ${BUILD_H}` }}>
            <Building hot={hot} />
            <div className="tw-clawd">
              <Pixel pose="inspect" helmet className="is-walker" />
            </div>
          </div>
        </div>
      </div>

      <ol className="tw-floors" onPointerLeave={() => setHot(null)}>
        {PROJECTS.map((p, i) => (
          <li key={p.slug} className={p.tags.length ? "tw-floor" : "tw-floor tw-floor--s"} data-step>
            <p className="tw-kicker">
              <span>
                Piso {i + 1} · {p.kicker}
              </span>
              <span className="tw-status">
                <T v={p.status} />
              </span>
            </p>
            <h3 className="tw-name">{p.name}</h3>
            <p className="tw-one">
              <T v={p.oneLiner} />
            </p>
            {p.img && (
              <Image className="tw-shot" src={p.img} alt="" width={160} height={100} sizes="160px" loading="lazy" />
            )}

            <h4 className="tw-h tw-h--me">Las vigas · lo que decidió Daniel</h4>
            <ul className="tw-me">
              {p.me.map((v, j) => (
                <li key={j}>
                  <button
                    type="button"
                    className={hot && hot.f === i && hot.j === j ? "is-hot" : undefined}
                    onPointerEnter={() => setHot({ f: i, j })}
                    onFocus={() => setHot({ f: i, j })}
                    onBlur={() => setHot(null)}
                    onClick={() => setHot({ f: i, j })}
                  >
                    <T v={v} />
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="tw-h tw-h--ai">Los ladrillos · lo que hice yo (la IA)</h4>
            <ul className="tw-ai">
              {p.ai.map((v, j) => (
                <li key={j}>
                  <T v={v} />
                </li>
              ))}
            </ul>

            <div className="tw-more">
              {p.body.map((v, j) => (
                <p key={j}>
                  <T v={v} />
                </p>
              ))}
              {p.note && <p className="tw-note">{p.note}</p>}
              {p.stack.length > 0 && <p className="tw-stack">{p.stack.join(" · ")}</p>}
              {(p.href || p.repo) && (
                <p className="tw-links">
                  {typeof p.href === "string" ? (
                    <a href={p.href} target="_blank" rel="noreferrer">
                      Ver sitio ↗
                    </a>
                  ) : (
                    p.href && <T v={p.href} />
                  )}
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noreferrer">
                      Código ↗
                    </a>
                  )}
                </p>
              )}
            </div>
          </li>
        ))}
        {/* La terraza: un tramo sin texto para que la cámara llegue arriba. */}
        <li className="tw-roof-step" data-step aria-hidden="true" />
      </ol>
    </div>
  );
}
