import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { BOOT_INLINE } from "./_components/boot";
import Board from "./_components/Board";
import ReadToggle from "./_components/ReadToggle";
import "./reglas.css";

// Archivo variable con eje wdth: el ancho de las letras es parte de la
// "personalidad" que cambian las reglas (condensada en los bloques, ancha en
// modo música). Mono sólo para la capa de sistema (readout, links, gamer).
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
});

export const metadata: Metadata = {
  title: "Las Reglas — Daniel Campuzano",
  description:
    "Daniel Campuzano, frontend engineer en Buenos Aires. Prototipo: las reglas de la página son bloques de palabras que podés mover.",
};

const d = (n: number) => ({ "--d": n }) as CSSProperties;

const PIXEL_PAD = [
  "..######..",
  ".########.",
  "##.####.##",
  "#...##.#.#",
  "##.####.##",
  "##########",
  "###....###",
  "##......##",
];

export default function ReglasPage() {
  return (
    <div
      id="reglas"
      className={`rg ${archivo.variable} ${mono.variable}`}
      data-persona="solver"
      data-theme="clara"
      data-honest="0"
      data-font={archivo.style.fontFamily}
    >
      <script dangerouslySetInnerHTML={{ __html: BOOT_INLINE }} />

      <header className="rg-top">
        <a className="rg-home rg-fade" style={d(0)} href="/lab">
          <span className="rg-mark" aria-hidden="true">
            DC
          </span>
          <span>lab / reglas</span>
        </a>
        <ReadToggle />
      </header>

      <main>
        <section className="rg-hero" aria-labelledby="rg-name">
          <div className="rg-copy">
            <p className="rg-role rg-fade" style={d(1)}>
              Frontend Engineer · Buenos Aires
            </p>
            <h1 id="rg-name" className="rg-name rg-fade" style={d(1)} tabIndex={-1}>
              <span>Daniel</span> <span>Campuzano</span>
            </h1>
            <p className="rg-lede rg-fade" style={d(2)}>
              Hace más de 5 años que construyo frontends con React, Next.js y
              TypeScript. Si algo no anda, me las rebusco hasta que ande, y
              después te explico cómo.
            </p>

            <div className="rg-persona rg-fade" style={d(3)}>
              <div className="rg-ill" aria-hidden="true">
                <svg data-p="solver" viewBox="0 0 48 48">
                  <rect x="16" y="24" width="16" height="16" className="rg-fill" />
                  <path d="M6 42V14h36v26M36 34l6 6 6-6" />
                </svg>
                <svg data-p="voley" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="17" />
                  <path d="M24 7c-6 8-6 26 0 34M7 24c9-5 22-4 33 7M12 12c10 2 19 11 22 27" />
                </svg>
                <svg data-p="musica" viewBox="0 0 48 48">
                  {[8, 17, 26, 35].map((x, i) => (
                    <rect
                      key={x}
                      className="rg-fill rg-eq"
                      style={d(i)}
                      x={x}
                      y="10"
                      width="6"
                      height="30"
                    />
                  ))}
                </svg>
                <svg data-p="profe" viewBox="0 0 48 48">
                  <rect x="5" y="9" width="38" height="26" />
                  <path d="M12 22h18M25 17l5 5-5 5M17 35v6M31 35v6" />
                </svg>
                <svg data-p="gamer" viewBox="0 0 10 8" shapeRendering="crispEdges">
                  {PIXEL_PAD.flatMap((row, y) =>
                    [...row].map((ch, x) =>
                      ch === "#" ? (
                        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className="rg-fill" />
                      ) : null,
                    ),
                  )}
                </svg>
                <svg data-p="nada" viewBox="0 0 48 48">
                  <rect x="10" y="10" width="28" height="28" strokeDasharray="4 4" />
                </svg>
                <svg data-p="claude" viewBox="0 0 48 48">
                  <path d="M12 19h24M12 29h24M30 10 18 38" />
                </svg>
              </div>
              <p className="rg-pl">
                <span data-p="solver">
                  <b>Modo default.</b> Hermano mayor toda la vida: arreglar con
                  lo que hay a mano y explicárselo a los más chicos.
                </span>
                <span data-p="voley">
                  <b>Modo vóley.</b> El mejor pase es el que hace quedar bien al
                  que remata.
                </span>
                <span data-p="musica">
                  <b>Modo música.</b> Auriculares puestos; el bug sale en el
                  segundo tema.
                </span>
                <span data-p="profe">
                  <b>Modo profe.</b> Si no lo puedo explicar en un pizarrón,
                  todavía no lo entendí.
                </span>
                <span data-p="gamer">
                  <b>Modo gamer.</b> Un nivel trabado es una regla que todavía no
                  moviste.
                </span>
                <span data-p="nada">
                  <b>Sin regla.</b> Daniel no es nada. Volvé a armar la oración.
                </span>
                <span data-p="claude">
                  <b>No.</b> Claude ayuda, pero las decisiones las toma Daniel.
                </span>
              </p>
            </div>

            <nav className="rg-links rg-fade" style={d(4)} aria-label="Contacto">
              <a href="mailto:danicampu56@gmail.com">danicampu56@gmail.com</a>
              <a href="https://github.com/TioDanx" rel="noopener noreferrer" target="_blank">
                github.com/TioDanx<span aria-hidden="true"> ↗</span>
              </a>
              <a
                href="https://www.linkedin.com/in/daniel-campuzano-7149552b7"
                rel="noopener noreferrer"
                target="_blank"
              >
                LinkedIn<span aria-hidden="true"> ↗</span>
              </a>
            </nav>
          </div>

          <Board />
        </section>

        <section className="rg-plain" aria-labelledby="rg-plain-h">
          <h2 id="rg-plain-h" tabIndex={-1}>
            Daniel Campuzano, sin juego
          </h2>
          <p>Frontend Engineer en Buenos Aires.</p>
          <p>
            Hace más de 5 años que construyo frontends con React, Next.js y
            TypeScript. Uso Claude Code todos los días.
          </p>
          <p>
            Fui el hermano mayor toda la vida: arreglar cosas con lo que hubiera
            a mano y explicárselas a los más chicos. Hoy hago lo mismo con
            interfaces. Más que una lista de hobbies, es un verbo:
            rebuscárselas.
          </p>
          <p>
            Fuera de la pantalla: vóley, música, enseñar, la naturaleza, los
            juegos y mis amigos.
          </p>
          <ul>
            <li>
              <a href="mailto:danicampu56@gmail.com">danicampu56@gmail.com</a>
            </li>
            <li>
              <a href="https://github.com/TioDanx">github.com/TioDanx</a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/daniel-campuzano-7149552b7">
                linkedin.com/in/daniel-campuzano-7149552b7
              </a>
            </li>
          </ul>
        </section>

        <section className="rg-next" aria-labelledby="rg-next-h">
          <div className="rg-strip" aria-hidden="true">
            <div className="rg-track">
              {[0, 1].map((k) => (
                <div key={k} className="rg-run">
                  {["PROYECTOS", "ES", "LO QUE SIGUE", "→", "■", "BAJÁ", "→", "■"].map(
                    (w, i) => (
                      <span key={i} className={w === "ES" || w === "→" ? "rg-sb rg-sb-op" : "rg-sb"}>
                        {w}
                      </span>
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
          <h2 id="rg-next-h" className="rg-next-h">
            Proyectos
          </h2>
          <p className="rg-next-p">Próxima sección del prototipo.</p>
        </section>
      </main>

      <footer className="rg-credits">
        <div className="rg-cr-in">
          <p className="rg-cr rg-cr-front">Reglas, diseño y código: Daniel Campuzano.</p>
          <p className="rg-cr rg-cr-back">
            Siendo honestos: este sitio lo armó Daniel prompteando a Claude. Las
            reglas, igual, las puso él.
          </p>
        </div>
      </footer>
    </div>
  );
}
