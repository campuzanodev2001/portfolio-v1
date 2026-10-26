/**
 * Dibujos de cada capa. Todas comparten la huella del teléfono: 46 × 61
 * unidades (1 unidad = 1cqw de la lámina que las contiene), así que el SVG
 * escala exacto en cada nivel del Droste — incluidos los trazos.
 */

export interface PlateSpec {
  n: string;
  name: string;
  sub: string;
}

/** Índice = posición en la pila (0 abajo, 6 arriba). */
export const PLATE_SPECS: PlateSpec[] = [
  { n: "00", name: "Bits", sub: "0 · 1" },
  { n: "01", name: "Silicio", sub: "transistores" },
  { n: "02", name: "Datos", sub: "Postgres · SQL" },
  { n: "03", name: "Red / API", sub: "HTTP · fetch" },
  { n: "04", name: "Lógica", sub: "TypeScript" },
  { n: "05", name: "Componentes", sub: "React" },
  { n: "06", name: "Interfaz", sub: "HTML · CSS" },
];

function Outline() {
  return (
    <>
      <rect className="dz-o" x="0.15" y="0.15" width="45.7" height="60.7" rx="4" />
      <rect className="dz-hl" x="0.15" y="0.15" width="45.7" height="60.7" rx="4" />
    </>
  );
}

// "D" y "C" en ASCII.
const BITS = ["01000100", "01000011"];

function Bits() {
  return (
    <g className="dz-t">
      {Array.from({ length: 9 }, (_, r) => (
        <text key={r} x="5" y={10 + r * 5.2} className={r === 4 ? "dz-acc" : undefined}>
          {BITS[r % 2]}
          <tspan x="25">{BITS[(r + 1) % 2]}</tspan>
        </text>
      ))}
      <text x="5" y="57" className="dz-tiny">
        D · C — ASCII
      </text>
    </g>
  );
}

function Silicio() {
  const k = [0, 1, 2, 3, 4];
  return (
    <g className="dz-l">
      <rect x="11" y="18.5" width="24" height="24" />
      <rect x="15" y="22.5" width="16" height="16" className="dz-dash" />
      {k.map((i) => (
        <g key={i}>
          <line x1="7" x2="11" y1={21.5 + i * 4.5} y2={21.5 + i * 4.5} />
          <line x1="35" x2="39" y1={21.5 + i * 4.5} y2={21.5 + i * 4.5} />
          <line y1="14.5" y2="18.5" x1={14 + i * 4.5} x2={14 + i * 4.5} />
          <line y1="42.5" y2="46.5" x1={14 + i * 4.5} x2={14 + i * 4.5} />
        </g>
      ))}
      {/* un transistor, de cerca */}
      <path d="M19 30.5h3M22 27v7M23.5 27v7M23.5 28h3.5M23.5 33h3.5" className="dz-acc-l" />
    </g>
  );
}

function Datos() {
  return (
    <g className="dz-l">
      <ellipse cx="23" cy="10" rx="9" ry="2.8" />
      <path d="M14 10v11c0 1.6 4 2.8 9 2.8s9-1.2 9-2.8V10" />
      <path d="M14 15.5c0 1.6 4 2.8 9 2.8s9-1.2 9-2.8" className="dz-dash" />
      <rect x="6" y="31" width="34" height="22" />
      {[36.5, 42, 47.5].map((y) => (
        <line key={y} x1="6" x2="40" y1={y} y2={y} />
      ))}
      <line x1="14" x2="14" y1="31" y2="53" />
      <g className="dz-t">
        <text x="7.5" y="35" className="dz-tiny">
          id
        </text>
        <text x="15.5" y="35" className="dz-tiny">
          movimiento
        </text>
      </g>
    </g>
  );
}

function Red() {
  const nodes: [number, number][] = [
    [12, 13],
    [34, 13],
    [23, 30],
    [12, 47],
    [34, 47],
  ];
  return (
    <g className="dz-l">
      <path d="M12 13L23 30L34 13M23 30L12 47M23 30L34 47M12 13H34" className="dz-dash" />
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
      ))}
      <g className="dz-t">
        <text x="5" y="24" className="dz-tiny">
          GET /api
        </text>
        <text x="28" y="40" className="dz-tiny dz-acc">
          200 OK
        </text>
      </g>
    </g>
  );
}

function Logica() {
  const lines = [
    ["const", " t = (now / 16000) % 1;"],
    ["const", " z = smooth(.8, 1, t);"],
    ["const", " s = 2.5 ** z;"],
    ["", "set('--zs', s);"],
    ["", "requestAnimationFrame(loop);"],
  ];
  return (
    <g className="dz-t dz-code">
      {lines.map(([kw, rest], i) => (
        <text key={i} x="4" y={12 + i * 4.6}>
          <tspan className="dz-dim-t">{i + 1}</tspan>
          <tspan x="7.5" className="dz-acc">
            {kw}
          </tspan>
          <tspan>{rest}</tspan>
        </text>
      ))}
      <path d="M4 40h20M4 44.6h30M4 49.2h14" className="dz-l dz-dash" />
    </g>
  );
}

function Componentes() {
  const boxes: [string, number, number, number, number][] = [
    ["<Hero>", 4, 5, 38, 51],
    ["<Name />", 7.5, 11, 31, 7],
    ["<Cta />", 7.5, 21, 15, 5.5],
    ["<Lamina />", 7.5, 29.5, 31, 22],
  ];
  return (
    <g>
      {boxes.map(([label, x, y, w, h]) => (
        <g key={label}>
          <rect x={x} y={y} width={w} height={h} rx="0.8" className="dz-l dz-dash" />
          <text x={x + 1} y={y + 2.4} className="dz-t dz-tiny">
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

const ART = [Bits, Silicio, Datos, Red, Logica, Componentes];

/** Capas 0–5. La 6 (interfaz) es el teléfono y la arma Lamina. */
export function PlateArt({ i, detail }: { i: number; detail: boolean }) {
  const Art = ART[i];
  return (
    <svg className="dz-art" viewBox="0 0 46 61" aria-hidden="true">
      <Outline />
      {detail && Art ? <Art /> : null}
    </svg>
  );
}

export function DeviceBody() {
  return (
    <svg className="dz-art" viewBox="0 0 46 61" aria-hidden="true">
      <rect className="dz-body" x="0.15" y="0.15" width="45.7" height="60.7" rx="4" />
      <rect className="dz-hl" x="0.15" y="0.15" width="45.7" height="60.7" rx="4" />
      <circle className="dz-cam" cx="23" cy="2" r="0.7" />
      <rect className="dz-home" x="18" y="57" width="10" height="1" rx="0.5" />
    </svg>
  );
}
