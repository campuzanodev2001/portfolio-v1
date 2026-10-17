import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import { BOOT_INLINE, DATE_INLINE } from "./_components/boot";
import Clock from "./_components/Clock";
import Enhance from "./_components/Enhance";
import { Halftone, RegMark, Riso, WorkerStrip } from "./_components/Pixel";
import { Bio, Blog, Colophon, Contact, Edge, Projects } from "./_components/Sections";
import { GITHUB, LINKEDIN } from "./_components/data";
import "./imprenta.css";

// One web family for the whole page: Roboto Flex, wght + wdth only (~60 KB
// latin woff2). Annotations use the system mono (0 bytes).
const flex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-flex",
});

export const metadata: Metadata = {
  title: "Imprenta Campuzano — Daniel Campuzano",
  description:
    "Daniel Campuzano, frontend engineer en Buenos Aires. Un portfolio que se imprime a dos tintas, compuesto por una cuadrilla de pixeles.",
};

/**
 * Each letter travels to its own extreme of the design space before the
 * word agrees on one setting (Specimen's loader). xw = wght, xd = wdth,
 * xs = fake slant (skewX) at the midpoint.
 */
const PATH = [
  { c: "D", xw: 1000, xd: 151, xs: "0deg" },
  { c: "A", xw: 100, xd: 151, xs: "-12deg" },
  { c: "N", xw: 1000, xd: 25, xs: "0deg" },
  { c: "I", xw: 1000, xd: 151, xs: "-12deg" },
  { c: "E", xw: 100, xd: 90, xs: "-12deg" },
  { c: "L", xw: 1000, xd: 25, xs: "0deg" },
];

const v = (o: Record<string, string | number>) => o as CSSProperties;

// Without JS the stage never leaves "boot": show the printed hero instead.
const NOSCRIPT = `<style>#imprenta .imp-ch,#imprenta .imp-row,#imprenta .imp-sun,#imprenta .imp-stampd{opacity:1!important;animation:none!important}#imprenta .imp-ch{font-variation-settings:"wght" 860,"wdth" 100!important}#imprenta .imp-feed{display:none!important}</style>`;

export default function ImprentaPage() {
  return (
    <div
      id="imprenta"
      className={`${flex.variable} imp`}
      data-stage="boot"
      data-font={flex.style.fontFamily}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: BOOT_INLINE }} />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT }} />
      <a className="imp-skip" href="#proyectos">
        Saltar a los proyectos
      </a>

      <main tabIndex={-1}>
        {/* ============================================================ HERO */}
        <section className="imp-hero" data-hero="" data-paper="paper" aria-labelledby="imp-name">
          <div className="imp-drum imp-drum--p" aria-hidden="true" />
          <div className="imp-drum imp-drum--b" aria-hidden="true" />

          <div className="imp-sheet">
            <div className="imp-sun" aria-hidden="true">
              <Halftone step={12} angle={15} light={[0.3, 0.22]} />
            </div>
            <div className="imp-ysun" data-ysun="" aria-hidden="true" />

            <header className="imp-top imp-row" style={v({ "--row": 0 })}>
              <p>
                Imprenta Campuzano · Buenos Aires <Clock />
              </p>
              <p>Hoja 01/06</p>
            </header>

            <h1 id="imp-name" className="imp-name">
              <span className="imp-sr">Daniel Campuzano</span>
              <span className="imp-wordbox">
                <span className="imp-word" data-word="" aria-hidden="true">
                  {PATH.map((p, i) => (
                    <span
                      key={p.c}
                      className="imp-ch"
                      data-ch=""
                      data-c={p.c}
                      style={v({ "--i": i, "--xw": p.xw, "--xd": p.xd, "--xs": p.xs })}
                    >
                      {p.c}
                    </span>
                  ))}
                  <span
                    className="imp-ch imp-cur"
                    data-cur=""
                    style={v({ "--i": 6, "--xw": 100, "--xd": 151, "--xs": "0deg" })}
                  >
                    _
                  </span>
                </span>
              </span>
              <span className="imp-last imp-row" aria-hidden="true" style={v({ "--row": 2 })}>
                Campuzano<span className="imp-sup">¹</span>
              </span>
            </h1>

            <span className="imp-stampd" aria-hidden="true" suppressHydrationWarning>
              <b>Impreso</b>
            </span>
            <script dangerouslySetInnerHTML={{ __html: DATE_INLINE }} />

            <div className="imp-body">
              <p className="imp-lede imp-row" style={v({ "--row": 3 })}>
                Frontend engineer. Hace más de cinco años que compongo interfaces con React,
                Next.js y TypeScript, desde Buenos Aires<span className="imp-dot">.</span>
              </p>
              <nav className="imp-links imp-row" aria-label="Atajos" style={v({ "--row": 4 })}>
                <a href="#proyectos">Proyectos</a>
                <a href="#escribime">Escribime</a>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </nav>
              <p className="imp-foot imp-row" style={v({ "--row": 5 })}>
                <span aria-hidden="true">¹ </span>Las letras no son botones. Igual, tocalas: la
                cuadrilla las vuelve a poner.
              </p>
            </div>
            <p className="imp-note" data-note="" aria-live="polite" />
          </div>

          <div className="imp-yard imp-row" data-yard="" style={v({ "--row": 6 })}>
            <button
              type="button"
              className="imp-risobtn"
              data-riso=""
              aria-label="La riso: correr el registro de las tintas"
            >
              <Riso className="imp-riso" />
            </button>
            <canvas className="imp-crew" data-crew="" aria-hidden="true" />
            <div className="imp-nomolestar" data-sign="" data-show="0" aria-hidden="true">
              <span>
                <b>No molestar</b>
                <small>se trabó la riso</small>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="imp-reg imp-reg--tl"
            data-reg=""
            aria-label="Correr el registro de las tintas"
          >
            <RegMark />
          </button>
          <div className="imp-stamps" data-stamps="" aria-hidden="true" />
        </section>

        <Edge kind="mesa" from="paper" to="pink" walker={2} />
        <Bio />
        <Edge kind="ramp" from="pink" to="paper" />
        <Projects />
        <Edge kind="stairs" from="paper" to="blue" walker={0} />
        <Blog />
        <Edge kind="perf" from="blue" to="paper" />
        <Contact />
        <Edge kind="ramp" from="paper" to="violet" />
      </main>

      <Colophon />

      <div
        className="imp-jam"
        data-jam=""
        role="alertdialog"
        aria-labelledby="imp-jam-t"
        aria-describedby="imp-jam-d"
        data-nostamp=""
        hidden
      >
        <div className="imp-jam__crew" aria-hidden="true">
          <WorkerStrip frames={["sit"]} crew={1} />
          <span className="imp-jam__sign">No molestar</span>
          <WorkerStrip frames={["sit"]} crew={3} mirror />
        </div>
        <p id="imp-jam-t" className="imp-jam__t">
          Atasco de papel
        </p>
        <p id="imp-jam-d" className="imp-jam__d">
          Demasiados sellos en muy poco tiempo. La hoja quedó trabada en el tambor y la cuadrilla se
          sentó a esperar.
        </p>
        <button type="button" className="imp-jam__b">
          Abrir la tapa y sacar la hoja
        </button>
      </div>

      <p className="imp-feed" data-feed="" aria-hidden="true">
        <span className="imp-feed__a">Pasada 1/2 · Fluorescent Pink</span>
        <span className="imp-feed__b">Pasada 2/2 · Federal Blue</span>
        <span className="imp-feed__skip">tocá para saltear</span>
      </p>
      <div className="imp-reprint" aria-hidden="true">
        <i />
        <i />
      </div>
      <p className="imp-sr" data-live="" aria-live="polite" />
      <Enhance />
    </div>
  );
}
