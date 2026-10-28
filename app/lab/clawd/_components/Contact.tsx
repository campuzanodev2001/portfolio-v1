import { AGENCY, LINKS, MAIL } from "./data";
import { Pixel } from "./Pixel";
import { SectionHead } from "./SectionHead";

/**
 * Contacto: "apagá las luces". Cuando la sala entra en pantalla (una vez),
 * Clawd pasa fila por fila con la lámpara de la imprenta y sube cada llave;
 * cuelga la lámpara sobre "Contactame", se va caminando a su cuarto y se
 * acuesta. Queda dormido para siempre (no se resetea al volver a subir).
 * Todo por tiempo (CSS: animation-delay encadenados, en pausa hasta data-in).
 * Sin JS o con reduced-motion: todo prendido y Clawd ya dormido.
 */

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

function Row({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <li className="ct-row" style={{ "--i": i } as CSSVars}>
      <span className="ct-switch" aria-hidden="true" />
      <Pixel pose="lamp" className="ct-visit" />
      {children}
    </li>
  );
}

function R({ x, y, w = 1, h = 1, f, c }: { x: number; y: number; w?: number; h?: number; f?: string; c?: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={f} className={c} />;
}

const K = {
  coral: "#d97757",
  dark: "#ad5a3f",
  light: "#f2ad8e",
  wife: "#e89a7c",
  bow: "#f2a0b5",
  eye: "#1b1a18",
  wood: "#4a3a2e",
  woodDk: "#3a2f26",
  frame: "#8a8170",
  sky: "#252a35",
  sheet: "#b9b1a2",
  pillow: "#e6e0d4",
  blanket: "#3d4f66",
  blanketHi: "#50668a",
  cat: "#9b948a",
};

/** El cuarto de Clawd: cama, mesita de luz y el cuadro de la familia. */
function Bedroom() {
  return (
    <div className="ct-bedroom" aria-hidden="true">
      <span className="ct-glow" />
      <svg className="ct-bed-svg" viewBox="0 0 96 56" shapeRendering="crispEdges">
        {/* Piso */}
        <R x={0} y={48} w={96} h={8} f="#100e0c" />
        <R x={0} y={48} w={96} f="#2a2621" />

        {/* El cuadro: Clawd, su esposa (moño) y la gatita. */}
        <R x={49} y={3} w={2} f={K.frame} />
        <R x={40} y={6} w={20} h={16} f={K.frame} />
        <R x={41} y={7} w={18} h={14} f={K.sky} />
        <R x={42} y={19} w={16} f="#3a352e" />
        {/* corazón */}
        <R x={48} y={10} f={K.bow} />
        <R x={50} y={10} f={K.bow} />
        <R x={48} y={11} w={3} f={K.bow} />
        <R x={49} y={12} f={K.bow} />
        {/* él */}
        <R x={43} y={15} w={5} h={3} f={K.coral} />
        <R x={43} y={15} w={5} f={K.light} />
        <R x={44} y={16} f={K.eye} />
        <R x={46} y={16} f={K.eye} />
        <R x={44} y={18} f={K.dark} />
        <R x={46} y={18} f={K.dark} />
        {/* la gatita */}
        <R x={48} y={16} f={K.cat} />
        <R x={50} y={16} f={K.cat} />
        <R x={48} y={17} w={3} h={2} f={K.cat} />
        <R x={51} y={17} f={K.cat} />
        {/* ella */}
        <R x={52} y={15} w={5} h={3} f={K.wife} />
        <R x={53} y={16} f={K.eye} />
        <R x={55} y={16} f={K.eye} />
        <R x={53} y={13} h={2} f={K.bow} />
        <R x={55} y={13} h={2} f={K.bow} />
        <R x={54} y={14} f="#d97a95" />
        <R x={53} y={18} f={K.dark} />
        <R x={55} y={18} f={K.dark} />

        {/* Mesita de luz + velador */}
        <R x={5} y={35} w={16} h={2} f={K.wood} />
        <R x={6} y={37} w={14} h={11} f={K.woodDk} />
        <R x={8} y={41} w={10} f="#2a221b" />
        <R x={12} y={43} w={2} f={K.frame} />
        <R x={10} y={33} w={6} h={2} f={K.frame} />
        <R x={12} y={28} w={2} h={5} f="#57503f" />
        <R x={8} y={22} w={10} h={6} c="ct-shade" />
        <R x={9} y={22} w={8} f="#fff3d1" c="ct-shade-hi" />

        {/* Cama */}
        <R x={24} y={26} w={4} h={22} f={K.wood} />
        <R x={88} y={34} w={4} h={14} f={K.wood} />
        <R x={24} y={42} w={68} h={4} f={K.woodDk} />
        <R x={28} y={36} w={60} h={6} f={K.sheet} />
        <R x={29} y={31} w={13} h={5} f={K.pillow} />

        {/* Clawd acostado: asoma la cabeza, ojos cerrados, una pinza afuera. */}
        <g className="ct-sleeper">
          <g className="ct-breath">
            <R x={31} y={29} w={12} h={5} f={K.coral} />
            <R x={32} y={29} w={10} f={K.light} />
            <R x={33} y={31} w={2} f={K.eye} />
            <R x={38} y={31} w={2} f={K.eye} />
          </g>
          <R x={46} y={32} w={3} f={K.coral} />
        </g>

        {/* Frazada (tapa a Clawd del cuello para abajo) */}
        <R x={34} y={33} w={54} h={9} f={K.blanket} />
        <R x={34} y={33} w={54} f={K.blanketHi} />
        <R x={34} y={37} w={54} f={K.blanketHi} />
        <g className="ct-sleeper">
          <R x={45} y={33} w={5} f={K.coral} />
        </g>
      </svg>
      <Pixel pose="idle" className="ct-walker" />
      <span className="ct-z">z</span>
      <span className="ct-z ct-z--2">z</span>
    </div>
  );
}

export function Contact() {
  const rows = 2 + LINKS.length;
  return (
    <section className="cl-sec ct" id="contacto" aria-labelledby="contacto-t">
      <SectionHead
        id="contacto"
        title="Hablemos"
        prompt="clawd, conseguime clientes"
        reply="Hago lo que puedo: te dejo todo prendido."
      />

      <div className="ct-room" data-reveal="custom" style={{ "--n": rows } as CSSVars}>
        <div className="ct-rows">
          <p className="ct-lead">
            Si estás construyendo algo con IA y necesitás a alguien que piense
            la estructura además del código, escribile. Yo le paso el mensaje.
          </p>
          <ul className="ct-list">
            <Row i={0}>
              <span className="ct-k">Mail</span>
              <span className="ct-v">
                <a href={`mailto:${MAIL}`}>{MAIL}</a>
                <button type="button" className="ct-copy" data-copy={MAIL}>
                  <span data-copy-label>Copiar mail</span>
                </button>
              </span>
            </Row>
            {LINKS.map((l, i) => (
              <Row key={l.label} i={i + 1}>
                <span className="ct-k">{l.label}</span>
                <span className="ct-v">
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.href.replace(/^https:\/\/(www\.)?/, "")} ↗
                  </a>
                </span>
              </Row>
            ))}
            <Row i={rows - 1}>
              <span className="ct-k">Agencia</span>
              <span className="ct-v">
                <a href={AGENCY} target="_blank" rel="noreferrer">
                  campuzano.studio ↗
                </a>
              </span>
            </Row>
          </ul>

          {/* El foco: la lámpara queda colgada sobre el CTA. */}
          <div className="ct-final">
            <Pixel pose="lamp" className="ct-visit ct-visit--cta" />
            <span className="ct-bulb" aria-hidden="true" />
            <a className="cl-cta ct-cta" href={`mailto:${MAIL}`}>
              Contactame
              <span className="cl-cta__arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>

        <Bedroom />
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="ft">
      <p className="ft-mark" aria-hidden="true">
        dc/
      </p>
      <p className="ft-line">
        Diseñado y construido por Daniel Campuzano, con agentes de IA y
        bastante criterio.
      </p>
      <div className="ft-credits">
        <p>
          © 2026 Daniel Campuzano · Barcelona · También en{" "}
          <a href={AGENCY} target="_blank" rel="noreferrer">
            campuzano.studio
          </a>
        </p>
        <p>Clawd es un homenaje de fan a la mascota de Claude Code.</p>
      </div>
    </footer>
  );
}
