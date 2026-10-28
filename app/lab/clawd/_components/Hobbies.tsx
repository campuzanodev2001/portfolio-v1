import { SectionHead } from "./SectionHead";

/**
 * Fuera del código: dos escenas, cada una con un video de Daniel (GIF
 * entrecortado a propósito, como señal que pierde cuadros) y un Clawd en
 * pixel art que lo imita abajo. DJ primero: la onda de Proyectos cae acá.
 *
 * Todo es por tiempo, no por scroll: las animaciones arrancan cuando la escena
 * entra en pantalla (data-in, vía Enhance). Con reduced-motion se ve el
 * póster quieto en lugar del GIF y los sprites se frenan.
 */

const C = {
  coral: "#d97757",
  dark: "#ad5a3f",
  light: "#f2ad8e",
  eye: "#1b1a18",
  cream: "#f3efe6",
  ink: "#2a2622",
  deck: "#2e2a25",
  line: "#3a352e",
  shadow: "#12100e",
};

function R({ x, y, w = 1, h = 1, f }: { x: number; y: number; w?: number; h?: number; f: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={f} />;
}

/** Cuerpo de Clawd (12×7) con patas, arriba a la izquierda en (x, y). */
function Crab({ x, y, look = [0, 0] }: { x: number; y: number; look?: [number, number] }) {
  const ex = x + 3 + look[0];
  const ey = y + 2 + look[1];
  return (
    <>
      {[1, 3, 8, 10].map((dx, i) => (
        <g key={dx} className={i % 2 ? "hb-leg hb-leg--b" : "hb-leg"}>
          <R x={x + dx} y={y + 7} h={2} f={C.dark} />
        </g>
      ))}
      <R x={x} y={y} w={12} h={7} f={C.coral} />
      <R x={x + 1} y={y} w={10} f={C.light} />
      <R x={x} y={y + 6} w={12} f={C.dark} />
      <g className="hb-eyes">
        <R x={ex} y={ey} h={2} f={C.eye} />
        <R x={ex + 5} y={ey} h={2} f={C.eye} />
      </g>
    </>
  );
}

function Note({ x, y }: { x: number; y: number }) {
  return (
    <>
      <R x={x + 2} y={y} h={4} f={C.light} />
      <R x={x + 3} y={y} f={C.light} />
      <R x={x} y={y + 3} w={2} h={2} f={C.light} />
    </>
  );
}

/** Cabina: Clawd con auriculares detrás de las bandejas, VU en el frente. */
function DjStage() {
  return (
    <svg className="hb-sprite" viewBox="0 0 64 24" shapeRendering="crispEdges" aria-hidden="true">
      <g className="hb-note hb-note--a">
        <Note x={12} y={6} />
      </g>
      <g className="hb-note hb-note--b">
        <Note x={48} y={5} />
      </g>

      <g className="hb-bob">
        <Crab x={26} y={6} look={[0, 1]} />
        {/* auriculares */}
        <R x={27} y={5} w={10} f={C.ink} />
        <R x={26} y={6} h={3} f={C.ink} />
        <R x={37} y={6} h={3} f={C.ink} />
        <R x={25} y={7} h={3} f={C.dark} />
        <R x={38} y={7} h={3} f={C.dark} />
      </g>
      <g className="hb-tap">
        <R x={25} y={12} h={3} f={C.coral} />
      </g>
      <g className="hb-tap hb-tap--b">
        <R x={38} y={12} h={3} f={C.coral} />
      </g>

      {/* bandejas y mixer */}
      <R x={6} y={14} w={52} h={2} f={C.deck} />
      <R x={9} y={14} w={10} f={C.ink} />
      <R x={45} y={14} w={10} f={C.ink} />
      <g className="hb-spin">
        <R x={10} y={14} f={C.cream} />
        <R x={53} y={14} f={C.cream} />
      </g>
      <g className="hb-spin hb-spin--b">
        <R x={17} y={14} f={C.cream} />
        <R x={46} y={14} f={C.cream} />
      </g>
      <R x={29} y={14} w={6} f={C.coral} />

      {/* frente de la cabina con el VU */}
      <R x={8} y={16} w={48} h={7} f={C.ink} />
      <R x={8} y={16} w={48} f={C.line} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i} className={`hb-vu hb-vu--${i}`}>
          <R x={25 + i * 2} y={18} h={4} f={i === 3 ? C.coral : C.light} />
        </g>
      ))}
      <R x={0} y={23} w={64} f={C.line} />
    </svg>
  );
}

/** Cancha: Clawd salta, remata y la pelota pasa la red. */
function VolleyStage() {
  return (
    <svg className="hb-sprite" viewBox="0 0 64 24" shapeRendering="crispEdges" aria-hidden="true">
      <g className="hb-shadow">
        <R x={20} y={22} w={12} f={C.shadow} />
      </g>
      <g className="hb-jump">
        <g className="hb-arms-down">
          <R x={19} y={17} h={2} f={C.coral} />
          <R x={32} y={17} h={2} f={C.coral} />
        </g>
        <g className="hb-arms-up">
          <R x={21} y={10} h={3} f={C.coral} />
          <R x={30} y={10} h={3} f={C.coral} />
        </g>
        <Crab x={20} y={13} look={[1, -1]} />
      </g>

      {/* red */}
      <R x={40} y={9} w={1} h={13} f={C.cream} />
      <R x={41} y={10} w={1} h={10} f={C.line} />
      {[11, 13, 15, 17, 19].map((y) => (
        <R key={y} x={41} y={y} f="#8a8170" />
      ))}
      <R x={41} y={10} f={C.cream} />

      <g className="hb-ball">
        <R x={1} y={0} f={C.cream} />
        <R x={0} y={1} w={3} f={C.cream} />
        <R x={1} y={2} f={C.cream} />
        <R x={1} y={1} f={C.coral} />
      </g>
      <R x={0} y={22} w={64} h={2} f={C.line} />
      <R x={52} y={22} w={1} f="#8a8170" />
    </svg>
  );
}

function Scene({
  name,
  tag,
  alt,
  stage,
  children,
}: {
  name: "dj" | "voley";
  tag: string;
  alt: string;
  stage: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure className={`hb-scene hb-scene--${name}`} data-reveal="custom">
      <div className="hb-screen">
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet={`/lab/hobbies/${name}.jpg`} />
          <img src={`/lab/hobbies/${name}.gif`} alt={alt} width={240} height={320} loading="lazy" decoding="async" />
        </picture>
        <span className="hb-tag" aria-hidden="true">
          {tag}
        </span>
      </div>
      <div className="hb-stage">{stage}</div>
      <figcaption className="hb-cap">{children}</figcaption>
    </figure>
  );
}

export function Hobbies() {
  return (
    <section className="cl-sec hb" id="hobbies" aria-labelledby="hobbies-t">
      <SectionHead
        id="hobbies"
        title="Fuera del código"
        prompt="contá qué hago además de codear"
        reply="Dos cosas: pasa música y juega al vóley."
      />

      <div className="hb-grid">
        <Scene
          name="dj"
          tag="en vivo"
          alt="Daniel pasando música: las bandejas en primer plano y la pista llena bajo las luces."
          stage={<DjStage />}
        >
          Los fines de semana Daniel pasa música. Yo le sigo el ritmo desde la cabina, más o menos.
        </Scene>
        <Scene
          name="voley"
          tag="repetición"
          alt="Daniel en un partido de vóley, con la pelota en el aire."
          stage={<VolleyStage />}
        >
          Y juega al vóley. Yo practico el remate con una pelota de mi tamaño.
        </Scene>
      </div>
    </section>
  );
}
