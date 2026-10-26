import { AGENCY, LINKS, MAIL } from "./data";
import { Pixel } from "./Pixel";
import { SectionHead } from "./SectionHead";

/**
 * Contacto + footer: "apagá las luces". La sección se oscurece y Clawd entra
 * con la lámpara que se llevó de la imprenta. Baja por un cable (el riel de
 * Sobre mí, ahora eléctrico) y al pasar por cada fila le sube la llave: se
 * prende. Al llegar a "Contactame" cuelga la lámpara arriba: es el único foco.
 * El footer apaga la pantalla como un CRT (línea, punto) y Clawd se duerme
 * encima del punto. Si volvés a subir, se despierta.
 */

function Row({ children }: { children: React.ReactNode }) {
  return (
    <li className="ct-row" data-step>
      <span className="ct-switch" aria-hidden="true" />
      {children}
    </li>
  );
}

export function Contact() {
  return (
    <section className="cl-sec ct" id="contacto" aria-labelledby="contacto-t">
      <SectionHead id="contacto" title="Hablemos" prompt="cerrá por hoy" />

      <div className="ct-room" data-scrub="0.55">
        <div className="ct-cable" aria-hidden="true">
          <div className="ct-rider">
            <Pixel pose="lamp" className="is-walker ct-with" />
            <Pixel pose="idle" className="is-walker ct-without" />
          </div>
        </div>

        <div className="ct-rows">
          <p className="ct-lead">
            Si estás construyendo algo con IA y necesitás a alguien que piense
            la estructura además de escribir el código, escribime.
          </p>
          <ul className="ct-list">
            <Row>
              <span className="ct-k">Mail</span>
              <span className="ct-v">
                <a href={`mailto:${MAIL}`}>{MAIL}</a>
                <button type="button" className="ct-copy" data-copy={MAIL}>
                  <span data-copy-label>Copiar mail</span>
                </button>
              </span>
            </Row>
            {LINKS.map((l) => (
              <Row key={l.label}>
                <span className="ct-k">{l.label}</span>
                <span className="ct-v">
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.href.replace(/^https:\/\/(www\.)?/, "")} ↗
                  </a>
                </span>
              </Row>
            ))}
            <Row>
              <span className="ct-k">Agencia</span>
              <span className="ct-v">
                <a href={AGENCY} target="_blank" rel="noreferrer">
                  campuzano.studio ↗
                </a>
              </span>
            </Row>
          </ul>

          {/* El foco: la lámpara queda colgada sobre el CTA. */}
          <div className="ct-final" data-step>
            <span className="ct-bulb" aria-hidden="true" />
            <a className="cl-cta ct-cta" href={`mailto:${MAIL}`}>
              Contactame
              <span className="cl-cta__arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="ft" data-scrub="0.5" data-pin>
      <i className="ft-mark" data-step aria-hidden="true" />
      <div className="ft-stage">
        <div className="ft-screen">
          <p className="ft-mark-dc" aria-hidden="true">
            dc/
          </p>
          <p className="ft-line">
            Diseñado y construido por Daniel Campuzano, con agentes de IA y
            bastante criterio.
          </p>
        </div>

        <div className="ft-bed" aria-hidden="true">
          <span className="ft-bang">!</span>
          <span className="ft-z">z</span>
          <span className="ft-z ft-z--2">z</span>
          <Pixel pose="idle" className="ft-clawd" />
        </div>

        <div className="ft-credits">
          <p>
            © 2026 Daniel Campuzano · Barcelona · También en{" "}
            <a href={AGENCY} target="_blank" rel="noreferrer">
              campuzano.studio
            </a>
          </p>
          <p>Clawd es un homenaje de fan a la mascota de Claude Code.</p>
        </div>
      </div>
    </footer>
  );
}
