import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import { BOOT_INLINE } from "./_components/boot";
import Clock from "./_components/Clock";
import Enhance from "./_components/Enhance";
import s from "./specimen.module.css";

// One family. Only wght (default) + wdth axes: latin woff2 ≈ 60 KB.
// slnt would add ~19 KB and opsz ~170 KB; slant is faked with skewX instead.
const flex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-flex",
});

export const metadata: Metadata = {
  title: "Specimen — Daniel Campuzano",
  description:
    "Daniel Campuzano, frontend engineer en Buenos Aires. Prototipo 01: tipografía cinética.",
};

/**
 * Each letter travels to its own extreme of the design space before the
 * word agrees on one setting: the loader is a specimen of the font.
 * xw = wght, xd = wdth, xs = fake slant (skewX) at the midpoint.
 */
const PATH = [
  { c: "D", xw: 1000, xd: 151, xs: "0deg" },
  { c: "A", xw: 100, xd: 151, xs: "-12deg" },
  { c: "N", xw: 1000, xd: 25, xs: "0deg" },
  { c: "I", xw: 1000, xd: 151, xs: "-12deg" },
  { c: "E", xw: 100, xd: 90, xs: "-12deg" },
  { c: "L", xw: 1000, xd: 25, xs: "0deg" },
];

const PROJECTS = [
  { n: "NZ Automotores", t: "Next.js · Firebase · Cloudinary" },
  { n: "Moreno Herramientas", t: "Supabase · Drizzle · MercadoPago — en obra" },
  { n: "Tailor AI", t: "Gemini · Stripe" },
  { n: "Nuestros Planes", t: "PWA para parejas" },
  { n: "Tom Martorello", t: "GSAP · Framer Motion" },
  { n: "The Box", t: "Tiendanube" },
  { n: "Portal Store", t: "E-commerce" },
];

const v = (o: Record<string, string | number>) => o as CSSProperties;

// Without JS the stage never leaves "boot": show the settled hero instead.
const NOSCRIPT = `<style>#specimen .${s.ch},#specimen .${s.fade},#specimen .${s.dot}{opacity:1!important;animation:none!important}#specimen .${s.ch}{font-variation-settings:"wght" 860,"wdth" 100!important}</style>`;

export default function SpecimenPage() {
  return (
    <div
      id="specimen"
      className={`${flex.variable} ${s.root}`}
      data-stage="boot"
      data-font={flex.style.fontFamily}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: BOOT_INLINE }} />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT }} />

      <main>
        <section className={s.hero} data-hero aria-labelledby="sp-name">
          <header className={`${s.top} ${s.fade}`} style={v({ "--o": 0 })}>
            <p>
              Buenos Aires · <Clock />
            </p>
            <p className={s.spec}>Roboto Flex · wght 100–1000 · wdth 25–151</p>
          </header>

          <h1 id="sp-name" className={s.name}>
            <span className={s.sr}>Daniel Campuzano</span>
            <span className={s.word} data-word aria-hidden="true">
              {PATH.map((p, i) => (
                <span
                  key={p.c}
                  className={s.ch}
                  data-ch
                  data-c={p.c}
                  style={v({ "--i": i, "--xw": p.xw, "--xd": p.xd, "--xs": p.xs })}
                >
                  {p.c}
                </span>
              ))}
              <span
                className={`${s.ch} ${s.cur}`}
                data-cur
                style={v({ "--i": 6, "--xw": 100, "--xd": 151, "--xs": "0deg" })}
              >
                _
              </span>
            </span>
            <span className={`${s.last} ${s.fade}`} aria-hidden="true" style={v({ "--o": 1 })}>
              Campuzano<span className={s.sup}>¹</span>
            </span>
          </h1>

          <p
            className={`${s.readout} ${s.fade}`}
            data-readout
            data-c="DANIEL_"
            aria-hidden="true"
            style={v({ "--o": 1 })}
          >
            <span className={s.rw}>wght </span>
            <span className={s.rd}>wdth </span>
          </p>

          <div className={s.body}>
            <p className={`${s.lede} ${s.fade}`} style={v({ "--o": 2 })}>
              Frontend engineer. Hace más de cinco años que hago interfaces con React, Next.js y
              TypeScript, desde Buenos Aires
              <span className={s.dot} data-dot aria-hidden="true">
                .
              </span>
            </p>

            <nav className={`${s.links} ${s.fade}`} aria-label="Contacto" style={v({ "--o": 3 })}>
              <a href="https://github.com/TioDanx" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/daniel-campuzano-7149552b7"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a href="mailto:danicampu56@gmail.com">Escribime</a>
            </nav>

            <p className={`${s.foot} ${s.fade}`} style={v({ "--o": 4 })}>
              <span aria-hidden="true">¹ </span>Las letras no son botones. Igual, tocalas.
            </p>
          </div>

          <p className={s.note} data-note aria-live="polite" />
        </section>

        {/* Section border: a word too big for the page, half in each section. */}
        <section className={s.next} aria-labelledby="sp-projects">
          <div className={s.border}>
            <h2 id="sp-projects" className={s.borderWord}>
              Proyectos<span className={s.borderDot}>.</span>
            </h2>
          </div>

          <div className={s.stub}>
            <p className={s.stubLabel}>Índice provisorio — la sección completa viene después</p>
            <ol className={s.waterfall}>
              {PROJECTS.map((p, i) => (
                <li key={p.n} style={v({ "--k": i })}>
                  <span className={s.pn}>{p.n}</span>
                  <span className={s.pt}>{p.t}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <Enhance />
    </div>
  );
}
