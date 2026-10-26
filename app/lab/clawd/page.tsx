import { About } from "./_components/About";
import { ClawdStage } from "./_components/ClawdStage";
import { AGENCY, LINKS, MAIL, NAV, NOTES } from "./_components/data";
import { Enhance } from "./_components/Enhance";
import { Pixel } from "./_components/Pixel";
import { Projects } from "./_components/Projects";
import { SectionHead } from "./_components/SectionHead";

// Onda del track de salida de Proyectos: alturas deterministas (0.2–1).
const WAVE = Array.from({ length: 96 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 0.9) * 0.6 + Math.sin(i * 0.23) * 0.4);
  return Math.round((0.2 + v * 0.8) * 100) / 100;
});

export default function ClawdPage() {
  return (
    <div className="cl">
      <Enhance />
      <a className="cl-skip" href="#sobre-mi">
        Saltar al contenido
      </a>

      <header className="cl-top">
        <a className="cl-top__mark" href="#top" aria-label="Inicio">
          dc/
        </a>
        <nav aria-label="Secciones">
          <ul className="cl-nav">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="cl-top__cta" href={`mailto:${MAIL}`}>
          Contactame
        </a>
      </header>

      <main id="top">
        <section className="cl-hero" data-clawd-hero aria-labelledby="hero-t">
          <div className="cl-copy">
            <h1 className="cl-name" id="hero-t">
              Daniel Campuzano
            </h1>
            <p className="cl-role">
              Fullstack Developer <span className="cl-role__ai">· construyo con IA</span>
            </p>
            <p className="cl-lede">La IA escribe el código; yo decido qué se construye y cómo.</p>
            <p className="cl-sub">5+ años. Accenture, Globant y hoy freelance desde Barcelona.</p>
            <div className="cl-actions">
              <a className="cl-cta" href={`mailto:${MAIL}`} data-clawd-point>
                Contactame
                <span className="cl-cta__arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <a className="cl-ghost" href="#proyectos">
                Ver proyectos
              </a>
            </div>
          </div>

          <ClawdStage />
        </section>

        <About />

        {/* ------------------------------------------------------------ proyectos */}
        <section className="cl-sec pj-sec" id="proyectos" aria-labelledby="proyectos-t">
          <SectionHead id="proyectos" title="Proyectos" prompt="tendé las vías" />
          <p className="cl-intro">
            La IA corre; yo pongo las vías. En cada proyecto, tocá la aguja: aparecen las decisiones que tomé yo, y
            recién ahí Clawd entra con lo que hace la IA.
          </p>
          <Projects />
          {/* Salida: el riel se vuelve la onda de un track (sigue Fuera del código). */}
          <div className="pj-wave" data-scrub="1" data-span="0.7" aria-hidden="true">
            {WAVE.map((h, i) => (
              <i key={i} style={{ "--h": h } as React.CSSProperties} />
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ hobbies */}
        <section className="cl-sec" id="hobbies" aria-labelledby="hobbies-t">
          <SectionHead id="hobbies" title="Fuera del código" prompt="¿y fuera del código?" pose="idle" />
          <p className="cl-intro">Lo que hago cuando no estoy programando.</p>
          <ul className="cl-hobbies">
            <li className="cl-hobby">
              <figure>
                <div className="cl-photo" role="img" aria-label="Daniel Campuzano pasando música en una consola de DJ">
                  <span className="cl-pending">pendiente: foto DJ</span>
                  <Pixel pose="dj" className="cl-photo__clawd" />
                </div>
                <figcaption>
                  <strong>DJ.</strong> Armar un set tiene algo parecido a programar: leer qué está pasando y decidir
                  qué viene después.
                </figcaption>
              </figure>
            </li>
            <li className="cl-hobby">
              <figure>
                <div className="cl-photo" role="img" aria-label="Daniel Campuzano jugando al vóley">
                  <span className="cl-pending">pendiente: foto vóley</span>
                  <Pixel pose="volley" className="cl-photo__clawd" />
                </div>
                <figcaption>
                  <strong>Vóley.</strong> Es de los pocos lugares donde no pienso en código.
                </figcaption>
              </figure>
            </li>
          </ul>
        </section>

        {/* ------------------------------------------------------------ notas */}
        <section className="cl-sec" id="notas" aria-labelledby="notas-t">
          <SectionHead id="notas" title="Notas" prompt="¿qué estás escribiendo?" pose="write" />
          <p className="cl-intro">
            Lo que voy aprendiendo sobre desarrollo con agentes, escrito para ordenar las ideas. Todavía no hay notas
            publicadas; estas son las primeras que tengo en mente.
          </p>
          <ol className="cl-notes">
            {NOTES.map((n, i) => (
              <li key={n.title} data-reveal style={{ "--i": i } as React.CSSProperties}>
                <span className="cl-notes__n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{n.title}</h3>
                <p>{n.text}</p>
                <span className="cl-notes__soon">Próximamente</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------------------------------------ contacto */}
        <section className="cl-sec cl-contact" id="contacto" aria-labelledby="contacto-t">
          <SectionHead id="contacto" title="Hablemos" prompt="pasales mi mail" pose="mail" />
          <p className="cl-big">
            Si estás construyendo algo con IA y necesitás a alguien que piense la estructura además de escribir el
            código, escribime.
          </p>
          <div className="cl-actions">
            <a className="cl-cta" href={`mailto:${MAIL}`}>
              Contactame
              <span className="cl-cta__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <button type="button" className="cl-ghost" data-copy={MAIL}>
              <span data-copy-label>Copiar mail</span>
            </button>
          </div>
          <ul className="cl-links">
            <li>
              <a href={`mailto:${MAIL}`}>{MAIL}</a>
            </li>
            {LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="cl-foot">
        <p>Diseñado y construido por Daniel Campuzano, con agentes de IA y bastante criterio.</p>
        <p className="cl-foot__small">
          © 2026 Daniel Campuzano · Barcelona · También en{" "}
          <a href={AGENCY} target="_blank" rel="noreferrer">
            campuzano.studio
          </a>
        </p>
        <p className="cl-foot__small">Clawd es un homenaje de fan a la mascota de Claude Code.</p>
      </footer>
    </div>
  );
}
