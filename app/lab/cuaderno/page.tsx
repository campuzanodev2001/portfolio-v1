import { BOOT_SCRIPT } from "./_components/boot";
import { Authorship } from "./_components/Authorship";
import { DanielEs } from "./_components/DanielEs";
import { Doodles } from "./_components/Doodles";
import { Eraser } from "./_components/Eraser";
import { Circle, Pencil, Spiral } from "./_components/Marks";

const LINKS = [
  { k: "mail", href: "mailto:danicampu56@gmail.com", label: "danicampu56@gmail.com" },
  { k: "github", href: "https://github.com/TioDanx", label: "github.com/TioDanx" },
  {
    k: "linkedin",
    href: "https://www.linkedin.com/in/daniel-campuzano-7149552b7",
    label: "linkedin.com/in/daniel-campuzano-7149552b7",
  },
];

export default function CuadernoPage() {
  return (
    <div className="cq" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      <div className="cq-grain" aria-hidden="true" />

      <header className="cq-head">
        <span>Cuaderno Nº 1 — D. Campuzano</span>
        <span className="cq-head__right">
          <span className="cq-head__sheet">Hoja 01 · Bs. As.</span>
          <Authorship />
        </span>
      </header>

      <div className="cq-sheet">
        <main className="cq-hero" id="contenido">
          <div data-who="daniel" data-who-label="D.">
            <Eraser />
            <h1 className="cq-name">
              <span className="cq-name__ink">Daniel Campuzano</span>
              <svg className="cq-uline" viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true">
                <path className="cq-uline__a" pathLength={1} d="M2 8 C 90 4, 210 10, 396 5" />
                <path className="cq-uline__b" pathLength={1} d="M10 19 C 120 15, 260 21, 360 16" />
              </svg>
              <Pencil />
            </h1>
          </div>

          <div className="cq-claim" data-who="both" data-who-label="D.+C.">
            <svg className="cq-arrow" viewBox="0 0 64 64" aria-hidden="true">
              <path pathLength={1} d="M12 2 C 6 22, 10 40, 52 46" />
              <path className="cq-arrow__head" pathLength={1} d="M40 36 L 53 46 L 39 55" />
            </svg>
            <p className="cq-claim__text">
              Me las rebusco.
              <br />Y después te explico cómo.
            </p>
          </div>

          <div className="cq-after">
            <p className="cq-lede" data-who="both" data-who-label="D.+C.">
              Frontend Engineer en Buenos Aires. Hace{" "}
              <span className="cq-circled">
                más de 5 años
                <Circle className="cq-circled__mark" />
              </span>{" "}
              que construyo interfaces con React, Next.js y TypeScript: agarro el problema, lo desarmo y
              lo resuelvo con lo que haya a mano. Uso Claude Code todos los días.
            </p>

            <dl className="cq-data" data-who="daniel" data-who-label="D.">
              <dt>Datos</dt>
              {LINKS.map((l) => (
                <dd key={l.k}>
                  <span className="cq-data__k">{l.k}</span>
                  <a href={l.href} className="cq-link" {...(l.k === "mail" ? {} : { target: "_blank", rel: "noreferrer" })}>
                    {l.label}
                  </a>
                </dd>
              ))}
            </dl>
          </div>
        </main>

        <aside className="cq-margin" aria-label="Margen">
          <p className="cq-note cq-note--1" data-who="claude" data-who-label="C.">
            <b>C:</b> “rebuscárselas” no tiene traducción al inglés. Por suerte acá no hace falta.
          </p>
          <Doodles />
          <p className="cq-note cq-note--2" data-who="claude" data-who-label="C.">
            <b>C:</b> le pregunté si iba a listar hobbies. Me dijo que no: van al margen. Tocalos.
          </p>
          <DanielEs />
        </aside>
      </div>

      <section className="cq-authors" id="cq-authors" aria-label="Quién escribió qué">
        <p>
          <b className="cq-who-d">D.</b> Daniel: el nombre, la historia de hermano mayor, los datos y los
          links. <b className="cq-who-c">C.</b> Claude (Claude Code): el diseño, el código, las notas en
          tipografía azul y la redacción de las frases, a partir de lo que contó Daniel.{" "}
          <b className="cq-who-b">D.+C.</b> escrito a cuatro manos.
        </p>
      </section>

      <section className="cq-next" aria-labelledby="cq-p01">
        <Spiral />
        <div className="cq-next__page">
          <h2 id="cq-p01" className="cq-next__title">
            <span className="cq-next__num">Problema 01</span> Un portfolio que no sea una lista.
          </h2>
          <dl className="cq-ex">
            <dt>Datos</dt>
            <dd>un nombre · 5+ años de frontend · un cuaderno.</dd>
            <dt>Intentos</dt>
            <dd>
              <s>grilla de cards con hobbies</s> <s>“desarrollador apasionado por…”</s>
            </dd>
            <dt>Resolución</dt>
            <dd className="cq-ex__fade">sigue en la próxima hoja…</dd>
          </dl>
        </div>
      </section>

      <p className="cq-skip" aria-hidden="true">
        tocá para saltear
      </p>
    </div>
  );
}
