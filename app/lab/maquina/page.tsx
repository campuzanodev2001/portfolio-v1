import type { CSSProperties } from "react";
import MachineSvg from "./_components/MachineSvg";
import Mount from "./_components/Mount";
import { BOOT_SCRIPT } from "./_components/boot";
import { DOT_R_EM } from "./_components/geometry";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function Letters({ text, from }: { text: string; from: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span key={i} className="mq-l" style={d(from + i * 40)}>
          {ch}
        </span>
      ))}
    </>
  );
}

function Ball({ n }: { n: 1 | 2 }) {
  return (
    <button
      type="button"
      className="mq-ball"
      data-ball={n}
      data-two={n === 2 ? "" : undefined}
      aria-label={n === 1 ? "Pelota (el punto de la i). Tocala." : "Segunda pelota. Tocala."}
    >
      <svg viewBox="-24 -24 48 48" aria-hidden="true">
        <circle r="21" className="mq-ball-a" />
        <path className="mq-ball-b" d="M-4 -21C8 -12 10 6 -1 21L-11 18C0 5 -2 -9 -14 -16Z" />
        <path className="mq-ball-b" d="M21 4C9 -2 -9 2 -20 10L-17 16C-6 9 9 6 19 12Z" />
        <circle r="21" className="mq-ball-o" />
      </svg>
    </button>
  );
}

export default function MaquinaPage() {
  return (
    <main
      className="mq"
      data-mq-root=""
      style={{ "--dot-r": `${DOT_R_EM}em` } as CSSProperties}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />

      <section className="mq-hero" aria-labelledby="mq-name">
        <header className="mq-top mq-fade" style={d(0)}>
          <span>Daniel Campuzano</span>
          <span>Patente pendiente</span>
        </header>

        <figure className="mq-fig">
          <figcaption className="mq-cap mq-fade" style={d(150)}>
            Fig. 1 — Máquina para ponerle el punto a la i
          </figcaption>
          <div className="mq-frame">
            <MachineSvg />
          </div>
          <div className="mq-ctrl mq-fade" style={d(1100)}>
            <button type="button" className="mq-run" data-run="">
              <span aria-hidden="true" className="mq-run-dot" />
              Probar la máquina
            </button>
            <p className="mq-status" data-status="" role="status">
              Máquina lista.
            </p>
          </div>
          <p id="mq-hint" className="mq-hint mq-fade" style={d(1150)}>
            Tocá una pieza. Dos toques y se cae: si la máquina se traba, la arreglás vos.
          </p>
          <ol className="mq-legend" aria-label="Piezas">
            <li>teclado</li>
            <li>joystick</li>
            <li>regla + púa</li>
            <li>cuerda de guitarra</li>
            <li>maceta</li>
            <li>libro</li>
            <li>subibaja</li>
            <li>parlante</li>
          </ol>
        </figure>

        <div className="mq-copy">
          <p className="mq-kicker mq-fade" style={d(500)}>
            Frontend Engineer · Buenos Aires
          </p>
          <h1 id="mq-name" className="mq-name" data-name="">
            <span className="mq-sr">Daniel Campuzano</span>
            <span aria-hidden="true">
              <span className="mq-w">
                <Letters text="dan" from={420} />
                <span className="mq-l mq-i" data-i="" style={d(540)}>
                  ı
                  <i className="mq-base">
                    <b className="mq-ex" data-anchor="i" />
                  </i>
                </span>
                <Letters text="el" from={580} />
              </span>
              <span className="mq-w">
                <Letters text="campuzano" from={540} />
                <span className="mq-period">
                  <i className="mq-base">
                    <b className="mq-exp" data-anchor="p" />
                  </i>
                </span>
              </span>
            </span>
          </h1>
          <p className="mq-line mq-fade" style={d(850)}>
            Si algo no te anda, me la rebusco con lo que haya a mano hasta que ande.
          </p>
          <p className="mq-meta mq-fade" style={d(950)}>
            5+ años · React · Next.js · TypeScript · Claude Code todos los días
          </p>
          <ul className="mq-links mq-fade" style={d(1050)}>
            <li>
              <a href="mailto:danicampu56@gmail.com">danicampu56@gmail.com</a>
            </li>
            <li>
              <a href="https://github.com/TioDanx" target="_blank" rel="noopener noreferrer">
                github.com/TioDanx
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/daniel-campuzano-7149552b7" target="_blank" rel="noopener noreferrer">
                linkedin
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className="mq-next" data-next="" aria-label="Próxima sección">
        <p className="mq-cap">§ 2 — La pelota sigue por acá</p>
        <p className="mq-next-t">Próxima pieza de la máquina: proyectos.</p>
      </section>

      <Ball n={1} />
      <Ball n={2} />
      <p className="mq-toast" data-toast="" aria-live="polite" />
      <Mount />
    </main>
  );
}
