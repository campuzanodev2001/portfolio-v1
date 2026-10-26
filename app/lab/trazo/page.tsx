import { Name } from "./_components/Name";
import { TrazoLine } from "./_components/TrazoLine";

const EMAIL = "danicampu56@gmail.com";

export default function TrazoPage() {
  return (
    <main className="tz">
      <header className="tz-top">
        <span>Barcelona</span>
        <a href="https://campuzano.studio" className="tz-top__link" target="_blank" rel="noreferrer">
          campuzano.studio
        </a>
      </header>

      <section className="tz-hero" aria-labelledby="tz-name">
        <TrazoLine />

        <div className="tz-copy">
          <Name />
          <p className="tz-role">
            Fullstack Developer <span className="tz-role__sep" aria-hidden="true">·</span>{" "}
            <span className="tz-role__ai">construyo con IA</span>
          </p>
          <div className="tz-cta">
            <a href={`mailto:${EMAIL}`} className="tz-btn">
              Contactame
              <svg viewBox="0 0 24 12" aria-hidden="true" focusable="false">
                <path d="M0 6h22M17 1l5 5-5 5" />
              </svg>
            </a>
            <a href="https://github.com/TioDanx" className="tz-link" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/daniel-campuzano-7149552b7"
              className="tz-link"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
