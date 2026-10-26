import { LOOP_MS } from "./_components/engine";
import { Name } from "./_components/Name";
import { PenroseMachine } from "./_components/PenroseMachine";

const MAIL = "mailto:danicampu56@gmail.com";

export default function PenrosePage() {
  return (
    <div className="pz" style={{ "--pz-loop": `${LOOP_MS}ms` } as React.CSSProperties}>
      <main className="pz-hero" id="contenido">
        <div className="pz-stage">
          <PenroseMachine />
        </div>

        <div className="pz-copy">
          <p className="pz-eyebrow">Barcelona</p>
          <Name text="Daniel Campuzano" />
          <p className="pz-role">
            <strong>Fullstack Developer</strong>
            <span className="pz-role__sep" aria-hidden="true">·</span>
            <span>construyo con IA</span>
          </p>
          <div className="pz-actions">
            <a className="pz-cta" href={MAIL}>
              Contactame
              <svg viewBox="0 0 16 16" aria-hidden="true" className="pz-cta__icon">
                <path d="M3 13 13 3M6 3h7v7" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </a>
            <a className="pz-link" href="https://github.com/TioDanx" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a
              className="pz-link"
              href="https://www.linkedin.com/in/daniel-campuzano-7149552b7"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
