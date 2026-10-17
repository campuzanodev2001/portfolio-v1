import Image from "next/image";
import { Halftone } from "./Halftone";
import {
  BaClock,
  DateStamp,
  RegMarkButton,
  RegMarkSvg,
  YellowSwitch,
} from "./Press";

type Ink = "p" | "b";

/**
 * One colour separation of the cover. The page renders it twice — once per
 * drum — with identical layout. Each plate only *inks* what belongs to it:
 *   .i-p  → pink only   .i-b → blue only (default)   .i-pb → both (overprint)
 * Everything else is laid out but left uninked, so the two plates stay in
 * register (until they don't, on purpose).
 *
 * The blue plate is the real, accessible document. The pink plate is
 * aria-hidden and uses neutral tags.
 */
export function Cover({ ink }: { ink: Ink }) {
  const real = ink === "b";
  const H1 = real ? "h1" : "div";
  const H2 = real ? "h2" : "div";
  const P = real ? "p" : "div";
  const Ul = real ? "ul" : "div";
  const Li = real ? "li" : "div";

  const link = (href: string, label: string, ext?: boolean) =>
    real ? (
      <a
        className="fz-link"
        href={href}
        {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    ) : (
      <span className="fz-link">{label}</span>
    );

  return (
    <div
      className={`fz-plate fz-plate--${ink}`}
      aria-hidden={real ? undefined : true}
    >
      <div className="fz-drum" />

      {/* registration marks print on every drum — that's how you see the drift */}
      {real ? (
        <>
          <RegMarkButton className="fz-reg--tl" />
          <RegMarkButton className="fz-reg--br" />
        </>
      ) : (
        <>
          <span className="fz-reg fz-reg--tl i-pb">
            <RegMarkSvg />
          </span>
          <span className="fz-reg fz-reg--br i-pb">
            <RegMarkSvg />
          </span>
        </>
      )}

      {ink === "p" && (
        <Halftone
          className="fz-sun fz-sun--p"
          step={12}
          angle={15}
          light={[0.28, 0.22]}
        />
      )}
      {ink === "b" && (
        <Halftone
          className="fz-sun fz-sun--b"
          step={11}
          angle={75}
          light={[0.2, 0.15]}
          near={0.9}
          far={0.05}
        />
      )}

      <div className="fz-cover">
        <header className="fz-mast">
          <span>Fanzine personal · Hoja 01/05</span>
          <span>
            Hora en BA{" "}
            {real ? <BaClock /> : <span className="fz-clock">--:--</span>}
          </span>
        </header>

        <figure className="fz-photo">
          <div className={`fz-photo__screen fz-photo__screen--${ink}`}>
            <Image
              src="/daniel.jpg"
              alt={real ? "Daniel Campuzano, en semitono a dos tintas" : ""}
              width={600}
              height={600}
              sizes="(min-width: 960px) 400px, 60vw"
            />
          </div>
          <span className={`fz-photo__tint fz-photo__tint--${ink}`} />
        </figure>

        <div className="fz-name">
          <P className="fz-kicker">
            Frontend engineer · +5 años · React, Next.js, TypeScript
          </P>
          <H1 className="fz-h1 i-pb">
            <span className="fz-h1__l">
              Daniel
              {real && <DateStamp />}
            </span>
            <span className="fz-h1__l">Campuzano</span>
          </H1>
        </div>

        <P className="fz-statement">
          Hago interfaces rápidas y prolijas, con detalles que aparecen{" "}
          <span className="fz-hl">cuando las tocás</span>.
        </P>

        <div className="fz-lines">
          <H2 className="fz-lines__h i-pb">Adentro</H2>
          <Ul className="fz-lines__ul">
            <Li>
              <b>NZ Automotores</b> — una concesionaria entera en Next.js,
              Firebase y Cloudinary
            </Li>
            <Li>
              <b>Moreno Herramientas</b> — 14.000+ productos con Supabase y
              MercadoPago (en obra)
            </Li>
            <Li>
              <b>Tailor AI</b> — un SaaS que ajusta tu CV con Gemini
            </Li>
            <Li>
              <b>Y además</b> — The Box, Portal Store, Tom Martorello, Nuestros
              Planes
            </Li>
          </Ul>
        </div>

        <P className="fz-contact">
          {link("mailto:danicampu56@gmail.com", "danicampu56@gmail.com")}
          {link("https://github.com/TioDanx", "GitHub", true)}
          {link("https://www.linkedin.com/in/daniel-campuzano-7149552b7", "LinkedIn", true)}
        </P>

        <P className="fz-colophon">
          Colofón: impreso a dos tintas, Fluorescent Pink y Federal Blue, sobre
          papel crema. Bueno, simulado: esto es una pantalla. El papel acepta
          sellos.{" "}
          {real ? <YellowSwitch /> : <>Tambor 3: Yellow, cargado, sin usar.</>}
        </P>
      </div>
    </div>
  );
}
