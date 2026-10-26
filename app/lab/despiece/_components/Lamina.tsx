import type { CSSProperties } from "react";
import { MAX_LEVEL, PLATES } from "./timeline";
import { DeviceBody, PLATE_SPECS, PlateArt } from "./plates";

/**
 * Una lámina: hoja de plano (marco, cajetín, cotas) + el teléfono en capas.
 * La pantalla del teléfono contiene otra <Lamina>, un nivel más adentro.
 *
 * Todo se mide en cqw de la propia lámina (container-type: inline-size), así
 * que cada nivel es una copia exacta a escala 0.4 del anterior: lo que hace
 * posible que el zoom final empalme con el inicio.
 */
export function Lamina({ level }: { level: number }) {
  const labels = level === 1;
  const detail = level <= 2;
  return (
    <div className="dz-stage" data-level={level}>
      <div className="dz-world">
        <Sheet />
        <div className="dz-device">
          <div className="dz-rig">
            {Array.from({ length: PLATES }, (_, i) => {
              const spec = PLATE_SPECS[i];
              const style = { "--i": i, "--h": `var(--h${i})` } as CSSProperties;
              const isUi = i === PLATES - 1;
              return (
                <div key={spec.n} className="dz-plate" data-plate={i} style={style}>
                  {isUi ? (
                    <>
                      <DeviceBody />
                      <div className="dz-screen">
                        {level < MAX_LEVEL ? <Lamina level={level + 1} /> : <div className="dz-stage dz-stage--end" />}
                      </div>
                    </>
                  ) : (
                    <PlateArt i={i} detail={detail} />
                  )}
                  {labels ? (
                    <span className="dz-call">
                      <span className="dz-call__in">
                        <span className="dz-call__n">{spec.n}</span>
                        <span className="dz-call__name">{spec.name}</span>
                        <span className="dz-call__sub">{spec.sub}</span>
                      </span>
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Marco, rótulos y cajetín: 100 × 125 unidades = la lámina entera. */
function Sheet() {
  return (
    <svg className="dz-sheet" viewBox="0 0 100 125" aria-hidden="true">
      <rect className="dz-frame" x="2.5" y="2.5" width="95" height="120" />
      <path
        className="dz-reg"
        d="M2.5 7.5V2.5H7.5M92.5 2.5H97.5V7.5M97.5 117.5V122.5H92.5M7.5 122.5H2.5V117.5"
      />
      <text className="dz-s dz-s--strong" x="6" y="9.5">
        LÁMINA 01 — DESPIECE
      </text>
      <text className="dz-s" x="6" y="13.2">
        proyección isométrica · 7 capas
      </text>
      <text className="dz-s" x="94" y="9.5" textAnchor="end">
        DC/01
      </text>

      {/* cotas: solo con el teléfono de frente */}
      <g className="dz-dim">
        <path d="M27 29.5H73M27 28v3M73 28v3" />
        <path d="M28.6 28.7L27 29.5L28.6 30.3M71.4 28.7L73 29.5L71.4 30.3" />
        <text x="50" y="28" textAnchor="middle">
          46
        </text>
        <path d="M77 33.5V94.5M75.5 33.5h3M75.5 94.5h3" />
        <path d="M76.2 35.1L77 33.5L77.8 35.1M76.2 92.9L77 94.5L77.8 92.9" />
        <text x="79.5" y="65">
          61
        </text>
      </g>

      {/* cajetín */}
      <g className="dz-box">
        <rect x="52" y="100" width="42" height="19.5" />
        <path d="M52 106.8H94M52 113.4H94M73 113.4V119.5" />
        <text className="dz-s dz-s--strong" x="54" y="104.6">
          DANIEL CAMPUZANO
        </text>
        <text className="dz-s" x="54" y="111.3">
          Fullstack Developer · IA
        </text>
        <text className="dz-s" x="54" y="117.8">
          ESC 1:2,5
        </text>
        <text className="dz-s" x="75" y="117.8">
          HOJA 1/∞
        </text>
      </g>
      <text className="dz-s" x="6" y="117.8">
        N.º DC-01 · BCN
      </text>
    </svg>
  );
}
