import { About } from "./_components/About";
import { ClawdStage } from "./_components/ClawdStage";
import { Contact, Footer } from "./_components/Contact";
import { MAIL, NAV } from "./_components/data";
import { Enhance } from "./_components/Enhance";
import { Hobbies } from "./_components/Hobbies";
import { Notes } from "./_components/Notes";
import { Projects } from "./_components/Projects";
import { SectionHead } from "./_components/SectionHead";

// Onda del track de salida de Proyectos: alturas deterministas (0.2–1).
const WAVE = Array.from({ length: 96 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 0.9) * 0.6 + Math.sin(i * 0.23) * 0.4);
  return Math.round((0.2 + v * 0.8) * 100) / 100;
});

// Loader "Buen día, Clawd": corre antes del primer paint, en cada carga, salvo
// con reduced motion; marca .cl[data-intro] y el CSS prende la pantalla como
// un CRT mientras el canvas despierta a Clawd.
const INTRO_INLINE = `(function(){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.currentScript.parentElement.setAttribute("data-intro","")})()`;

export default function ClawdPage() {
  return (
    <div className="cl" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: INTRO_INLINE }} />
      <div className="cl-crt" aria-hidden="true">
        <i className="cl-crt__top" />
        <i className="cl-crt__bottom" />
        <i className="cl-crt__beam" />
      </div>
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

        <Hobbies />

        <Notes />

        <Contact />
      </main>
      <Footer />
    </div>
  );
}
