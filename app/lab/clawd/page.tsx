import { About } from "./_components/About";
import { ClawdStage } from "./_components/ClawdStage";
import { Contact, Footer } from "./_components/Contact";
import { MAIL, NAV } from "./_components/data";
import { Enhance } from "./_components/Enhance";
import { Hobbies } from "./_components/Hobbies";
import { Intro } from "./_components/Intro";
import { Notes } from "./_components/Notes";
import { Projects } from "./_components/Projects";
import { SectionHead } from "./_components/SectionHead";

// Onda del track de salida de Proyectos: alturas deterministas (0.2–1).
const WAVE = Array.from({ length: 96 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 0.9) * 0.6 + Math.sin(i * 0.23) * 0.4);
  return Math.round((0.2 + v * 0.8) * 100) / 100;
});

// Intro "Clawd arma el portfolio": se decide antes del primer paint, en cada
// carga, salvo con reduced motion o si se entra con un #ancla. Marca
// .cl[data-intro]: el CSS esconde las piezas del hero y bloquea el scroll.
const INTRO_INLINE = `(function(){if(matchMedia("(prefers-reduced-motion: reduce)").matches||location.hash)return;history.scrollRestoration="manual";document.currentScript.parentElement.setAttribute("data-intro","")})()`;

export default function ClawdPage() {
  return (
    <div className="cl" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: INTRO_INLINE }} />
      <Intro />
      <Enhance />
      <a className="cl-skip" href="#sobre-mi">
        Saltar al contenido
      </a>

      <header className="cl-top" data-build="nav">
        <a className="cl-top__mark" href="#top" aria-label="Inicio">
          dc/
        </a>
        <nav aria-label="Secciones">
          <ul className="cl-nav">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} data-spy={n.id}>
                  {n.label}
                </a>
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
            <h1 className="cl-name" id="hero-t" data-build="title">
              Daniel Campuzano
            </h1>
            <p className="cl-role" data-build="role">
              Fullstack Developer <span className="cl-role__ai">· construye con IA</span>
            </p>
            <p className="cl-lede" data-build="lede">
              El código lo escribo yo, Clawd. Daniel decide qué se construye y cómo.
            </p>
            <p className="cl-sub" data-build="sub">
              5+ años. Pasó por Accenture y Globant; hoy es freelance en Barcelona.
            </p>
            <div className="cl-actions" data-build="actions">
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
          <SectionHead
            id="proyectos"
            title="Proyectos"
            prompt="mostrá mi trabajo"
            reply="Primero te explico cómo trabajamos."
          />
          <div className="pj-why">
            <p className="cl-big">
              Hoy una IA escribe código a una velocidad que impresiona. Lo digo con conocimiento de causa: soy una.
            </p>
            <p>
              Por eso Daniel corrió el foco. Se dedica a entender arquitecturas, patrones de diseño, lógica de negocio
              y casos de uso reales, y la parte de escribir el código me la delega a mí.
            </p>
            <p>
              Dicho así suena peligroso. Con buen manejo, salen proyectos como estos: un piso por proyecto, de los
              cimientos para arriba. Las vigas son lo que decidió él; los ladrillos, lo que hice yo. Sin vigas, los
              ladrillos no se sostienen.
            </p>
          </div>
          <Projects />
          {/* Salida: la onda que sale del parlante de la terraza (sigue Fuera del código). */}
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
