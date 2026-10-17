import type { CSSProperties } from "react";
import Image from "next/image";
import Clock from "./Clock";
import Order from "./Order";
import { RegMark, WipScene, WorkerStrip } from "./Pixel";
import { EMAIL, GITHUB, LINKEDIN, POSTS, PROJECTS, STACK } from "./data";
import { mesaPolygon, notchPolygon, rampTile, stairPolygon } from "./print";

const v = (o: Record<string, string | number>) => o as CSSProperties;

type Ink = "paper" | "pink" | "blue" | "violet";

/* ======================================================================
   Section borders. Only two shapes on the whole page:
   el ESCALÓN (pixel stairs, in multiples of --u) and el PUNTO (halftone
   dot, punched hole, period). Every border is made of one of them.
   ====================================================================== */

const RAMP = rampTile(12, 7);
export const MESA = { steps: 4, sw: 8, sh: 4 };
export const STAIRS = { steps: 8, sh: 3 };

export function Edge({
  kind,
  from,
  to,
  walker,
}: {
  kind: "mesa" | "stairs" | "ramp" | "perf";
  from: Ink;
  to: Ink;
  walker?: number;
}) {
  const style = v({
    "--from": `var(--${from})`,
    "--to": `var(--${to})`,
    ...(kind === "ramp" ? { "--ramp": RAMP.url } : {}),
  });
  const clip =
    kind === "mesa"
      ? mesaPolygon(MESA.steps, MESA.sw, MESA.sh)
      : kind === "stairs"
        ? stairPolygon(STAIRS.steps, STAIRS.sh)
        : undefined;
  return (
    <div className={`imp-edge imp-edge--${kind}`} style={style} aria-hidden="true">
      <div className="imp-edge__fill" style={clip ? { clipPath: clip } : undefined} />
      {walker !== undefined && (
        <span className="imp-walker" data-walker="" data-nostamp="">
          <span className="imp-walker__hop">
            <span className="imp-walker__win">
              <WorkerStrip frames={["walkA", "walkB"]} crew={walker} className="imp-walker__strip" />
            </span>
          </span>
        </span>
      )}
    </div>
  );
}

/** Giant word (Specimen's section heading), with the pink plate misregistered. */
function Giant({
  id,
  word,
  mod,
  extra,
}: {
  id: string;
  word: string;
  mod: string;
  extra?: string;
}) {
  return (
    <h2 id={id} className={`imp-giant imp-giant--${mod}`}>
      <span className="imp-gw" data-c={word}>
        {word}
      </span>
      <span className="imp-gdot" aria-hidden="true">
        .
      </span>
      {extra && <span className="imp-sr"> {extra}</span>}
    </h2>
  );
}

function Marg({ n, label }: { n: string; label: string }) {
  return (
    <p className="imp-marg">
      <span>Hoja {n}/06</span>
      <span>{label}</span>
    </p>
  );
}

const Stamps = () => <div className="imp-stamps" data-stamps="" aria-hidden="true" />;

/* ================================================================== BIO */

export function Bio() {
  return (
    <section id="hola" className="imp-sec imp-bio" data-paper="pink" aria-labelledby="imp-bio-h">
      <div className="imp-wrap">
        <Marg n="02" label="El cajista" />
        <Giant id="imp-bio-h" word="Hola" mod="hola" extra="Quién soy" />

        <div className="imp-bio__grid">
          <figure className="imp-portrait">
            <div className="imp-portrait__frame" style={{ clipPath: notchPolygon(3, 4) }}>
              <div className="imp-portrait__screen">
                <Image
                  src="/daniel.jpg"
                  alt="Daniel Campuzano, impreso en semitono"
                  width={600}
                  height={600}
                  sizes="(min-width: 900px) 380px, 72vw"
                />
              </div>
              <span className="imp-portrait__tint" />
            </div>
            <figcaption>Tinta azul sobre papel rosa. Sale violeta.</figcaption>
          </figure>

          <div className="imp-bio__text">
            <p className="imp-bio__lead">
              Soy Daniel Campuzano, frontend engineer en Buenos Aires. Hace más de cinco años que
              armo interfaces: desde una landing que tiene que vender autos hasta un SaaS que lee
              currículums.
            </p>
            <p>
              Trabajo con React, Next.js y TypeScript. Tailwind para el estilo, Framer Motion
              cuando algo se tiene que mover con intención, y Firebase o Supabase cuando hace falta
              backend. Soy Técnico en Informática.
            </p>
            <p>
              Uso Claude Code y Cursor todos los días, y este sitio es el experimento: lo diseñé
              dándole instrucciones a agentes de IA, sin escribir el código a mano, para ver hasta
              dónde se estira. La cuadrilla, la tinta rosa y las letras que se caen salieron de ahí.
            </p>
          </div>

          <dl className="imp-ficha">
            <div>
              <dt>Oficio</dt>
              <dd>Frontend engineer</dd>
            </div>
            <div>
              <dt>Taller</dt>
              <dd>Buenos Aires, Argentina</dd>
            </div>
            <div>
              <dt>En esto</dt>
              <dd>Más de cinco años</dd>
            </div>
            <div>
              <dt>Título</dt>
              <dd>Técnico en Informática</dd>
            </div>
            <div>
              <dt>A mano</dt>
              <dd>Claude Code y Cursor, todos los días</dd>
            </div>
            <div>
              <dt>Disponible</dt>
              <dd>Freelance y full-time remoto</dd>
            </div>
          </dl>

          <div className="imp-caja">
            <p className="imp-caja__h">Caja de tipos</p>
            <ul aria-label="Stack">
              {STACK.map((s) => (
                <li key={s.t} style={v({ "--w": s.w, "--d": s.d, clipPath: notchPolygon(1, 2) })}>
                  {s.t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Stamps />
    </section>
  );
}

/* ============================================================ PROYECTOS */

export function Projects() {
  return (
    <section
      id="proyectos"
      className="imp-sec imp-proj"
      data-paper="paper"
      aria-labelledby="imp-proj-h"
    >
      <div className="imp-wrap">
        <Marg n="03" label="Pliegos" />
        <Giant id="imp-proj-h" word="Proyectos" mod="proy" />
        <p className="imp-intro">
          Siete trabajos. Cada nombre está compuesto en su propia variante de la misma fuente, como
          en un muestrario; pasales por encima y vuelven al estilo de la casa.
        </p>

        <ol className="imp-pliegos">
          {PROJECTS.map((p, i) => (
            <li key={p.slug} className="imp-pliego" data-side={i % 2 ? "r" : "l"}>
              <article aria-labelledby={`imp-p-${p.slug}`}>
                <p className="imp-pliego__meta">
                  <span>{String(i + 1).padStart(2, "0")}/07</span>
                  <span>{p.kind}</span>
                  {p.wip && <span className="imp-flag">En obra</span>}
                </p>
                <h3
                  id={`imp-p-${p.slug}`}
                  className="imp-pliego__name"
                  lang="es"
                  style={v({ "--w": p.w, "--d": p.d, "--sk": `${p.sk ?? 0}deg` })}
                >
                  <span className="imp-gw" data-c={p.name}>
                    {p.name}
                  </span>
                </h3>
                <p className="imp-pliego__inst" aria-hidden="true">
                  {p.style} · wght {p.w} · wdth {p.d}
                </p>

                {p.image ? (
                  <button
                    type="button"
                    className="imp-thumb"
                    data-proof=""
                    aria-pressed="false"
                    style={{ clipPath: notchPolygon(2, 3) }}
                  >
                    <span className="imp-thumb__print">
                      <Image
                        src={p.image.src}
                        alt={`Captura de ${p.name}`}
                        width={p.image.w}
                        height={p.image.h}
                        sizes="(min-width: 900px) 56vw, calc(100vw - 32px)"
                      />
                      <span className="imp-thumb__ink" />
                      <span className="imp-thumb__dots" />
                    </span>
                    <span className="imp-thumb__hint">
                      <span className="imp-off">Ver la prueba de color</span>
                      <span className="imp-on">Volver a la tinta</span>
                    </span>
                  </button>
                ) : (
                  <div
                    className="imp-wip"
                    role="img"
                    aria-label="La cuadrilla en pixel art, clavando y cargando cajas: Moreno Herramientas todavía está en obra."
                    style={{ clipPath: notchPolygon(2, 3) }}
                  >
                    <WipScene />
                    <span className="imp-stamp imp-stamp--p imp-stamp--fixed" aria-hidden="true">
                      En prensa
                    </span>
                  </div>
                )}

                <div className="imp-pliego__body">
                  <p className="imp-pliego__desc">{p.desc}</p>
                  <ul className="imp-pliego__stack" aria-label={`Stack de ${p.name}`}>
                    {p.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  {p.live || p.repo ? (
                    <p className="imp-pliego__links">
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noopener noreferrer">
                          Ver el sitio<span aria-hidden="true"> ↗</span>
                        </a>
                      )}
                      {p.repo && (
                        <a href={p.repo} target="_blank" rel="noopener noreferrer">
                          Código<span aria-hidden="true"> ↗</span>
                        </a>
                      )}
                    </p>
                  ) : (
                    <p className="imp-pliego__links imp-pliego__links--wip">
                      Sin link todavía: se está levantando.
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
      <Stamps />
    </section>
  );
}

/* ================================================================ BLOG */

export function Blog() {
  return (
    <section id="notas" className="imp-sec imp-blog" data-paper="blue" aria-labelledby="imp-blog-h">
      <div className="imp-wrap">
        <Marg n="04" label="Galeras" />
        <Giant id="imp-blog-h" word="En prensa" mod="prensa" extra="Notas del blog" />
        <p className="imp-intro">
          Todavía no publiqué nada. Estas tres notas están en la imprenta: cuando salgan, salen acá.
          Sin fecha, porque no la tienen.
        </p>
        <ol className="imp-galeras">
          {POSTS.map((p, i) => (
            <li key={p.title} className="imp-galera" style={v({ "--i": i })}>
              <article aria-labelledby={`imp-g-${i}`}>
                <p className="imp-galera__meta">
                  <span>
                    Galera {i + 1} de {POSTS.length}
                  </span>
                  <span>Estado: {p.status}</span>
                </p>
                <h3 id={`imp-g-${i}`} className="imp-galera__h">
                  {p.title}
                </h3>
                <p className="imp-galera__p">{p.excerpt}</p>
                <a
                  className="imp-galera__a"
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Avisame cuando salga: ${p.title}`)}`}
                >
                  Avisame cuando salga
                </a>
                <span className="imp-stamp imp-stamp--p imp-stamp--fixed" aria-hidden="true">
                  {p.status}
                </span>
              </article>
            </li>
          ))}
        </ol>
      </div>
      <Stamps />
    </section>
  );
}

/* ============================================================= CONTACTO */

export function Contact() {
  return (
    <section
      id="escribime"
      className="imp-sec imp-contact"
      data-paper="paper"
      aria-labelledby="imp-contact-h"
    >
      <div className="imp-wrap">
        <Marg n="05" label="Cupón" />
        <Giant id="imp-contact-h" word="Escribime" mod="escribime" />
        <p className="imp-intro">
          Freelance o full-time remoto. Si tenés algo para imprimir, la máquina está caliente.
        </p>
        <div className="imp-contact__grid">
          <Order />
          <ul className="imp-direct">
            <li>
              <span className="imp-direct__k">Mail</span>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <span className="imp-direct__k">GitHub</span>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                github.com/TioDanx
              </a>
            </li>
            <li>
              <span className="imp-direct__k">LinkedIn</span>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                Daniel Campuzano
              </a>
            </li>
          </ul>
        </div>
      </div>
      <Stamps />
    </section>
  );
}

/* =============================================================== FOOTER */

export function Colophon() {
  return (
    <footer className="imp-sec imp-colofon" data-paper="violet">
      <div className="imp-wrap">
        <Marg n="06" label="Colofón" />
        <p className="imp-colofon__big" aria-hidden="true">
          Daniel Campuzano<span className="imp-gdot">.</span>
        </p>
        <p className="imp-colofon__text">
          Esta página se compuso en Roboto Flex, con los ejes de peso y ancho, y se imprimió a dos
          tintas, Fluorescent Pink y Federal Blue, sobre papel crema. Bueno, simulado: es una
          pantalla. Donde las dos tintas se pisan sale este violeta. La cuadrilla es de pixeles y
          vino de otra obra. Tambor 3:{" "}
          <button type="button" className="imp-secret" data-yellow-btn="" aria-pressed="false">
            amarillo
          </button>
          <span className="imp-y-off">, cargado, sin usar.</span>
          <span className="imp-y-on">, ¡en uso! Ahora son tres tintas.</span>
        </p>
        <div className="imp-colofon__row">
          <p>
            Buenos Aires · <Clock />
          </p>
          <p className="imp-colofon__links">
            <a href={`mailto:${EMAIL}`}>Mail</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </p>
        </div>
        <div className="imp-lineup" aria-hidden="true">
          {[0, 1, 2, 3].map((c) => (
            <WorkerStrip key={c} frames={[c % 2 ? "up" : "idle"]} crew={c} mirror={c > 1} />
          ))}
        </div>
        <p className="imp-printonly">
          Si estás leyendo esto en papel, lo imprimiste de verdad. Gracias por gastar tinta. Daniel
          Campuzano · {EMAIL} · github.com/TioDanx
        </p>
      </div>
      <button type="button" className="imp-reg imp-reg--br" data-reg="" aria-label="Correr el registro de las tintas">
        <RegMark />
      </button>
      <Stamps />
    </footer>
  );
}
