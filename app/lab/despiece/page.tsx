import { Despiece } from "./_components/Despiece";

const MAIL = "mailto:danicampu56@gmail.com";

export default function DespiecePage() {
  return (
    <div className="dz">
      <header className="dz-top">
        <span>Lámina 01 / Despiece</span>
        <span>Barcelona</span>
      </header>

      <main className="dz-hero" id="contenido">
        <div className="dz-copy">
          <p className="dz-kicker">
            <b>●</b> Fig. 0 — Portfolio
          </p>
          <h1 className="dz-name">
            <span className="dz-name__ink">Daniel</span> <span className="dz-name__ink">Campuzano</span>
          </h1>
          <span className="dz-cota" aria-hidden="true">
            <span className="dz-cota__end" />
            <span className="dz-cota__cursor" />
            <span className="dz-cota__end" />
          </span>

          <p className="dz-role">
            Fullstack Developer <span>· construyo con IA</span>
          </p>
          <p className="dz-lede">
            La IA escribe buena parte del código; el diseño, la arquitectura y las decisiones las pongo yo.
          </p>

          <div className="dz-actions">
            <a className="dz-cta" href={MAIL}>
              Contactame <span aria-hidden="true">→</span>
            </a>
            <nav className="dz-links" aria-label="Perfiles">
              <a href="https://github.com/TioDanx" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/daniel-campuzano-7149552b7" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </nav>
          </div>
        </div>

        <Despiece />
      </main>
    </div>
  );
}
