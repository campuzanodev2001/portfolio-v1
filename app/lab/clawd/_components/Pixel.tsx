/**
 * Clawd chico, en SVG: la misma geometría que el sprite del canvas del hero
 * (cuerpo 12×7, cuatro patas, ojos a ±2.5 del centro) en una grilla de 32×20.
 * Cada sección lo usa con una pose y un objeto; las animaciones son CSS en
 * steps(), así que se mueve de a píxel entero como el del hero.
 */

export type Pose = "idle" | "read" | "inspect" | "dj" | "volley" | "write" | "mail" | "lamp";

const C = {
  coral: "#d97757",
  dark: "#ad5a3f",
  light: "#f2ad8e",
  eye: "#1b1a18",
  cream: "#f3efe6",
  paper: "#efeae0",
  ink: "#2a2622",
  deck: "#2e2a25",
  shadow: "#12100e",
};

const OX = 8;
const OY = 8;

function R({ x, y, w = 1, h = 1, f }: { x: number; y: number; w?: number; h?: number; f: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={f} />;
}

// Hacia dónde mira cada pose.
const LOOK: Record<Pose, [number, number]> = {
  idle: [0, 0],
  read: [0, 1],
  inspect: [1, 0],
  dj: [0, 1],
  volley: [0, -1],
  write: [1, 1],
  mail: [1, 0],
  lamp: [1, -1],
};

function Arms({ pose }: { pose: Pose }) {
  const l = OX + 1;
  const r = OX + 14;
  switch (pose) {
    case "volley":
      return (
        <g className="clw-arms-up">
          <R x={l} y={OY} h={4} f={C.coral} />
          <R x={r} y={OY} h={4} f={C.coral} />
        </g>
      );
    case "inspect":
      return (
        <>
          <R x={l} y={OY + 5} h={2} f={C.coral} />
          <R x={r} y={OY + 5} w={3} f={C.coral} />
        </>
      );
    case "lamp":
      return (
        <>
          <R x={l} y={OY + 5} h={2} f={C.coral} />
          <R x={r} y={OY - 1} h={6} f={C.coral} />
        </>
      );
    case "mail":
      return (
        <>
          <R x={l} y={OY + 5} h={2} f={C.coral} />
          <g className="clw-wave">
            <R x={r} y={OY + 1} h={5} f={C.coral} />
          </g>
        </>
      );
    case "write":
    case "dj":
      return (
        <>
          <g className="clw-tap">
            <R x={l} y={OY + 6} h={2} f={C.coral} />
          </g>
          <g className="clw-tap clw-tap--b">
            <R x={r} y={OY + 6} h={2} f={C.coral} />
          </g>
        </>
      );
    default:
      return (
        <>
          <R x={l} y={OY + 5} h={2} f={C.coral} />
          <R x={r} y={OY + 5} h={2} f={C.coral} />
        </>
      );
  }
}

// Auriculares: van dentro del cuerpo para que se muevan con él.
function Headphones() {
  return (
    <>
      <R x={OX + 2} y={OY} w={12} f={C.ink} />
      <R x={OX + 1} y={OY + 1} h={4} f={C.ink} />
      <R x={OX + 14} y={OY + 1} h={4} f={C.ink} />
      <R x={OX} y={OY + 2} h={3} f={C.dark} />
      <R x={OX + 15} y={OY + 2} h={3} f={C.dark} />
    </>
  );
}

function Prop({ pose }: { pose: Pose }) {
  switch (pose) {
    case "read":
      // Una hoja con renglones, sostenida adelante.
      return (
        <g className="clw-prop">
          <R x={OX + 4} y={OY + 6} w={8} h={6} f={C.paper} />
          <R x={OX + 5} y={OY + 7} w={6} f={C.ink} />
          <R x={OX + 5} y={OY + 9} w={4} f={C.ink} />
          <R x={OX + 5} y={OY + 10} w={5} f={C.coral} />
        </g>
      );
    case "inspect":
      // Lupa: anillo de 5×5 con mango.
      return (
        <g className="clw-prop clw-scan">
          <R x={26} y={6} w={3} f={C.cream} />
          <R x={26} y={10} w={3} f={C.cream} />
          <R x={25} y={7} h={3} f={C.cream} />
          <R x={29} y={7} h={3} f={C.cream} />
          <R x={24} y={11} f={C.cream} />
          <R x={23} y={12} f={C.cream} />
        </g>
      );
    case "dj":
      // Bandeja con dos platos que giran (una marca que da la vuelta).
      return (
        <>
          <R x={2} y={OY + 8} w={28} h={4} f={C.deck} />
          <R x={4} y={OY + 9} w={6} h={2} f={C.ink} />
          <R x={22} y={OY + 9} w={6} h={2} f={C.ink} />
          <g className="clw-spin">
            <R x={5} y={OY + 9} f={C.cream} />
            <R x={23} y={OY + 9} f={C.cream} />
          </g>
          <g className="clw-spin clw-spin--b">
            <R x={8} y={OY + 10} f={C.cream} />
            <R x={26} y={OY + 10} f={C.cream} />
          </g>
          <R x={14} y={OY + 9} w={4} f={C.coral} />
        </>
      );
    case "volley":
      // Pelota que sube y baja sobre los brazos.
      return (
        <g className="clw-ball">
          <R x={15} y={0} w={2} f={C.cream} />
          <R x={14} y={1} w={4} h={2} f={C.cream} />
          <R x={15} y={3} w={2} f={C.cream} />
          <R x={15} y={1} w={1} h={2} f={C.coral} />
        </g>
      );
    case "write":
      // Notebook chiquita con un cursor que titila.
      return (
        <>
          <R x={21} y={OY + 3} w={9} h={6} f={C.deck} />
          <R x={22} y={OY + 4} w={4} f={C.coral} />
          <R x={22} y={OY + 6} w={6} f={C.cream} />
          <g className="clw-caret">
            <R x={28} y={OY + 6} f={C.cream} />
          </g>
          <R x={20} y={OY + 9} w={11} h={1} f={C.ink} />
        </>
      );
    case "mail":
      // Sobre levantado.
      return (
        <g className="clw-wave">
          <R x={23} y={OY - 4} w={7} h={5} f={C.paper} />
          <R x={24} y={OY - 3} f={C.ink} />
          <R x={25} y={OY - 2} w={3} f={C.ink} />
          <R x={28} y={OY - 3} f={C.ink} />
        </g>
      );
    case "lamp":
      // Lamparita en alto: la que se lleva de la imprenta a Contacto.
      return (
        <g className="clw-lamp">
          <R x={OX + 13} y={OY - 5} w={3} h={3} f="#ffd98a" />
          <R x={OX + 14} y={OY - 4} f="#fff3d1" />
          <R x={OX + 13} y={OY - 2} w={3} f="#8a8170" />
        </g>
      );
    default:
      return null;
  }
}

// Capucha de hacker: la sección que la usa decide cuándo se ve (.clw-hood).
function Hood() {
  return (
    <g className="clw-hood">
      <R x={OX + 2} y={OY} w={12} h={2} f={C.ink} />
      <R x={OX + 1} y={OY + 1} h={6} f={C.ink} />
      <R x={OX + 14} y={OY + 1} h={6} f={C.ink} />
      <R x={OX + 3} y={OY + 2} w={10} f={C.deck} />
    </g>
  );
}

export function Pixel({
  pose = "idle",
  hood = false,
  className = "",
}: {
  pose?: Pose;
  hood?: boolean;
  className?: string;
}) {
  const [lx, ly] = LOOK[pose];
  const ex = OX + 5 + lx;
  const ey = OY + 4 + ly;
  const front = pose === "read" || pose === "dj";
  return (
    <svg
      className={`clw clw--${pose} ${className}`}
      viewBox="0 0 32 20"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <R x={OX + 2} y={OY + 11} w={12} f={C.shadow} />
      <g className="clw-legs">
        {[3, 5, 10, 12].map((x, i) => (
          <g key={x} className={i % 2 ? "clw-leg-b" : "clw-leg-a"}>
            <R x={OX + x} y={OY + 9} h={2} f={C.dark} />
          </g>
        ))}
      </g>
      <g className="clw-body">
        <R x={OX + 2} y={OY + 2} w={12} h={7} f={C.coral} />
        <R x={OX + 3} y={OY + 2} w={10} f={C.light} />
        <R x={OX + 2} y={OY + 8} w={12} f={C.dark} />
        <g className="clw-eyes">
          <R x={ex} y={ey} h={2} f={C.eye} />
          <R x={ex + 5} y={ey} h={2} f={C.eye} />
        </g>
        {pose === "dj" && <Headphones />}
        {hood && <Hood />}
        <Arms pose={pose} />
        {!front && <Prop pose={pose} />}
      </g>
      {front && <Prop pose={pose} />}
      <g className="clw-heart">
        <R x={14} y={0} w={1} f="#ff8a7a" />
        <R x={16} y={0} w={1} f="#ff8a7a" />
        <R x={13} y={1} w={5} f="#ff8a7a" />
        <R x={14} y={2} w={3} f="#ff8a7a" />
        <R x={15} y={3} f="#ff8a7a" />
      </g>
    </svg>
  );
}
