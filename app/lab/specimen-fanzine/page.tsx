import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Roboto_Flex } from "next/font/google";
import { BOOT_INLINE, ROOT_ID } from "./_components/boot";
import Clock from "./_components/Clock";
import Enhance from "./_components/Enhance";
import { Disc, DiscDefs, RegMark } from "./_components/Shapes";
import {
  DRAFTS,
  EMAIL,
  GITHUB,
  LETTERS,
  LINKEDIN,
  PROJECTS,
  STACK,
} from "./_components/content";
import s from "./sf.module.css";

// The only web font. wght (default) + wdth axes, latin: one ~60 KB woff2.
// Annotations use the system mono (0 bytes). Slant is faked with skewX.
const flex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-flex",
});

export const metadata: Metadata = {
  title: "Specimen × Fanzine — Daniel Campuzano",
  description:
    "Daniel Campuzano, frontend engineer en Buenos Aires. Un specimen tipográfico impreso en risografía, a dos tintas.",
};

const v = (o: Record<string, string | number>) => o as CSSProperties;
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

// Without JS the stage never leaves "boot": show the settled page instead.
const NOSCRIPT = `<style>#${ROOT_ID} .${s.ch},#${ROOT_ID} .${s.fade},#${ROOT_ID} .${s.dot}{opacity:1!important;animation:none!important;clip-path:none!important}#${ROOT_ID} .${s.ch}{font-variation-settings:"wght" 860,"wdth" 100!important}</style>`;

/** A word printed on both drums. Blue is the real text; pink is a ghost. */
function Plated({
  text,
  cursor,
  className,
}: {
  text: string;
  cursor?: boolean;
  className?: string;
}) {
  return (
    <span className={`${s.plated} ${className ?? ""}`} data-fit>
      <span className={s.pb} data-fit-word>
        {text}
        {cursor && (
          <span className={s.mark} aria-hidden="true">
            <span className={s.markU}>_</span>
            <span className={s.markD}>.</span>
          </span>
        )}
      </span>
      <span className={s.pp} aria-hidden="true">
        {text}
        {cursor && (
          <span className={s.mark}>
            <span className={s.markU}>_</span>
            <span className={s.markD}>.</span>
          </span>
        )}
      </span>
    </span>
  );
}

function RegButton({ className }: { className: string }) {
  return (
    <button
      type="button"
      className={`${s.reg} ${className}`}
      data-reg
      aria-label="Correr el registro de las tintas"
      title="Registro"
    >
      <RegMark />
    </button>
  );
}

export default function SpecimenFanzinePage() {
  return (
    <div
      id={ROOT_ID}
      className={`${flex.variable} ${s.root}`}
      data-stage="boot"
      data-font={flex.style.fontFamily}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: BOOT_INLINE }} />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT }} />
      <DiscDefs />

      <a className={s.skip} href="#proyectos">
        Saltar a proyectos
      </a>

      <main>
        {/* ============================================================ 01 HERO */}
        <section className={`${s.sheet} ${s.hero}`} data-hero data-sheet aria-labelledby="sf-name">
          <Disc className={`${s.sun} ${s.sunHero}`} />
          <Disc className={`${s.yellow} ${s.yHero}`} />
          <RegButton className={s.regTl} />
          <RegButton className={s.regBr} />
          <div className={s.roller} aria-hidden="true" />

          <header className={`${s.top} ${s.fade}`} style={v({ "--o": 0 })}>
            <p>
              Pliego 01/06<span className={s.wide}> · Buenos Aires</span> · <Clock />
            </p>
            <p className={s.spec}>
              Roboto Flex · 2 tintas<span className={s.wide}> · wght 100–1000 · wdth 25–151</span>
            </p>
          </header>

          <h1 id="sf-name" className={s.name}>
            <span className={s.sr}>Daniel Campuzano</span>
            <span className={s.wordbox} data-wordbox aria-hidden="true">
              <span className={`${s.word} ${s.wb}`} data-word>
                {LETTERS.map((l, i) => (
                  <span
                    key={l.c}
                    className={s.ch}
                    data-ch
                    data-c={l.c}
                    style={v({ "--i": i, "--xw": l.b[0], "--xd": l.b[1], "--xs": `${l.b[2]}deg` })}
                  >
                    {l.c}
                  </span>
                ))}
                <span className={`${s.ch} ${s.cur}`} data-cur style={v({ "--i": 6 })}>
                  _
                </span>
              </span>
              <span className={`${s.word} ${s.wp}`} data-wordp>
                {LETTERS.map((l, i) => (
                  <span
                    key={l.c}
                    className={s.ch}
                    style={v({ "--i": i, "--xw": l.p[0], "--xd": l.p[1], "--xs": `${l.p[2]}deg` })}
                  >
                    {l.c}
                  </span>
                ))}
                <span className={`${s.ch} ${s.cur}`} style={v({ "--i": 6 })}>
                  _
                </span>
              </span>
            </span>
            <span className={`${s.last} ${s.fade}`} aria-hidden="true" style={v({ "--o": 1 })}>
              Campuzano<span className={s.sup}>¹</span>
            </span>
          </h1>

          <p className={`${s.readout} ${s.fade}`} data-readout data-c="DANIEL_" aria-hidden="true" style={v({ "--o": 2 })}>
            <span className={s.rw}>wght </span>
            <span className={s.rd}>wdth </span>
            <span className={s.rg} data-reg-readout>
              registro +3 −2
            </span>
          </p>

          <div className={s.body}>
            <p className={`${s.lede} ${s.fade}`} style={v({ "--o": 3 })}>
              Frontend engineer en Buenos Aires. Hago interfaces rápidas y prolijas, con detalles que
              aparecen cuando las tocás
              <span className={s.dot} data-dot aria-hidden="true">
                .
              </span>
            </p>

            <nav className={`${s.links} ${s.fade}`} aria-label="Atajos" style={v({ "--o": 4 })}>
              <a href="#proyectos">Proyectos</a>
              <a href="#contacto">Escribime</a>
              <a href={GITHUB} {...ext}>
                GitHub
              </a>
            </nav>

            <p className={`${s.foot} ${s.fade}`} style={v({ "--o": 5 })}>
              <span aria-hidden="true">¹ </span>Las letras no son botones. Igual, tocalas.
            </p>
          </div>

          <p className={s.note} data-note aria-live="polite" />
        </section>

        {/* border 1: a halftone ramp — the dot grows from cream into pink */}
        <div className={s.ramp} aria-hidden="true" />

        {/* ============================================================ 02 BIO */}
        <section id="bio" className={`${s.sheet} ${s.bio}`} data-sheet aria-labelledby="sf-bio">
          <Disc className={`${s.yellow} ${s.yBio}`} />
          <p className={s.meta}>
            <span>Pliego 02/06</span>
            <span className={s.leader} />
            <span>Presentación</span>
          </p>
          <h2 id="sf-bio" className={s.bioH}>
            Hola, soy Daniel<span className={s.pdot}>.</span>
          </h2>

          <div className={s.bioGrid}>
            <figure className={s.portrait} data-loupe>
              <div className={s.photo}>
                <div className={`${s.plate} ${s.plateB}`}>
                  <div className={s.screen}>
                    <Image
                      src="/daniel.jpg"
                      alt="Daniel Campuzano, retrato en semitono a dos tintas"
                      width={1080}
                      height={1350}
                      sizes="(min-width: 900px) 380px, 70vw"
                    />
                  </div>
                  <span className={s.tint} />
                </div>
                <div className={`${s.plate} ${s.plateP}`} aria-hidden="true">
                  <div className={s.screen}>
                    <Image src="/daniel.jpg" alt="" width={1080} height={1350} sizes="(min-width: 900px) 380px, 70vw" />
                  </div>
                  <span className={s.tint} />
                </div>
              </div>
              <figcaption className={s.caption}>Fig. 1 — Daniel, en semitono. Rosa a 15°, azul a 45°.</figcaption>
            </figure>

            <div className={s.bioText}>
              <p className={s.drop}>
                Hace más de cinco años que hago frontend, y todavía me divierte el momento exacto en
                que una interfaz deja de ser un dibujo y empieza a responderte.
              </p>
              <p>
                Soy Técnico en Informática y vivo en Buenos Aires. Trabajo con React, Next.js y
                TypeScript, y me importa que lo que hago cargue rápido en el celular de cualquiera,
                se pueda usar con teclado y tenga algún detalle que no esperabas.
              </p>
              <p>
                Uso Claude Code y Cursor todos los días. Esta página, de hecho, la armé dándole
                instrucciones a agentes: yo decidí qué se imprime y qué no; ellos manejaron la
                máquina.
              </p>
              <p>
                Estoy abierto a proyectos freelance y a un puesto remoto full-time. Si tenés algo
                entre manos, <a href="#contacto">contame</a>.
              </p>
            </div>
          </div>

          <dl className={s.facts}>
            <div>
              <dt>Haciendo frontend</dt>
              <dd>5+ años</dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>Buenos Aires</dd>
            </div>
            <div>
              <dt>Título</dt>
              <dd>Técnico en Informática</dd>
            </div>
            <div>
              <dt>Disponible para</dt>
              <dd>Freelance y remoto full-time</dd>
            </div>
          </dl>

          <div className={s.styles}>
            <h3 className={s.stylesH}>
              <span>Estilos de la familia</span>
              <span className={s.leader} />
              <span>lo que uso</span>
            </h3>
            <ul className={s.stylesList}>
              {STACK.map((t) => (
                <li key={t.t} style={v({ "--w": t.w, "--d": t.d })}>
                  <span className={s.styleName}>{t.t}</span>
                  <span className={s.styleMeta}>
                    {t.style} · {t.w}/{t.d}
                  </span>
                </li>
              ))}
            </ul>
            <p className={s.stylesFoot}>Y todos los días: Claude Code y Cursor.</p>
          </div>
        </section>

        {/* border 2: a word too big for the page, half in each section */}
        <div className={s.border} data-sheet>
          <h2 id="sf-proj" className={s.borderH}>
            <span className={s.sr}>Proyectos</span>
            <span className={s.bwBox} data-fit aria-hidden="true">
              <span className={`${s.bw} ${s.bwB}`} data-fit-word>
                Proyectos<span className={s.bwDot}>.</span>
              </span>
              <span className={`${s.bw} ${s.bwP}`}>
                Proyectos<span className={s.bwDot}>.</span>
              </span>
            </span>
          </h2>
          <Disc className={s.bwDisc} />
        </div>

        {/* ============================================================ 03 PROYECTOS */}
        <section id="proyectos" className={`${s.sheet} ${s.projects}`} data-sheet aria-labelledby="sf-proj">
          <p className={s.meta}>
            <span>Pliego 03/06</span>
            <span className={s.leader} />
            <span>Siete, uno en obra</span>
          </p>
          <p className={s.projIntro}>
            Cada proyecto está compuesto en un estilo distinto de la misma familia, como en un
            specimen. Las capturas son pruebas a dos tintas: tocalas para verlas a color.
          </p>

          <ol className={s.plist}>
            {PROJECTS.map((p) => (
              <li key={p.n} className={s.proj} style={v({ "--w": p.w, "--d": p.d })}>
                <article className={s.projIn} aria-labelledby={`sf-p${p.n}`}>
                  <p className={s.pmeta}>
                    <span>{p.n}</span>
                    <span>{p.kind}</span>
                    <span className={s.leader} />
                    <span>
                      {p.style} · {p.w}/{p.d}
                    </span>
                  </p>
                  <h3 id={`sf-p${p.n}`} className={s.pname}>
                    {p.name}
                  </h3>
                  <div className={s.pbody}>
                    <p>{p.desc}</p>
                    <ul className={s.pstack} aria-label="Stack">
                      {p.stack.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                    {(p.live || p.repo) && (
                      <p className={s.plinks}>
                        {p.live && (
                          <a href={p.live} {...ext}>
                            Ver en vivo<span className={s.sr}> {p.name} (se abre en otra pestaña)</span>
                          </a>
                        )}
                        {p.repo && (
                          <a href={p.repo} {...ext}>
                            Código<span className={s.sr}> de {p.name} en GitHub (se abre en otra pestaña)</span>
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                  {p.img ? (
                    <button
                      type="button"
                      className={s.thumb}
                      data-thumb
                      aria-pressed="false"
                      aria-label={`Ver la captura de ${p.name} a color`}
                    >
                      <Image
                        src={p.img.src}
                        alt={`Captura de ${p.name}`}
                        width={p.img.w}
                        height={p.img.h}
                        sizes="(min-width: 900px) 40vw, calc(100vw - 32px)"
                      />
                      <span className={s.thumbTint} aria-hidden="true" />
                      <span className={s.thumbTag} aria-hidden="true">
                        Prueba a 2 tintas
                      </span>
                    </button>
                  ) : (
                    <div className={s.thumbWip}>
                      <Disc className={s.wipDisc} />
                      <p>
                        Sin captura todavía:
                        <br />
                        está en obra<span className={s.pdot}>.</span>
                      </p>
                    </div>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </section>

        {/* ============================================================ 04 BLOG */}
        {/* border 3: a perforation — punched dots you can see the blue through */}
        <section id="borradores" className={`${s.sheet} ${s.blog}`} data-sheet aria-labelledby="sf-blog">
          <p className={s.perfLabel} aria-hidden="true">
            Cortar por la línea de puntos
          </p>
          <p className={s.meta}>
            <span>Pliego 04/06</span>
            <span className={s.leader} />
            <span>Blog</span>
          </p>
          <h2 id="sf-blog" className={s.blogH}>
            Borradores<span className={s.pdot}>.</span>
          </h2>
          <p className={s.blogIntro}>
            Todavía no publiqué nada. Estos son los tres textos que estoy escribiendo; cuando salgan,
            van a estar acá. Sin fechas inventadas.
          </p>

          <ol className={s.drafts}>
            {DRAFTS.map((d) => (
              <li key={d.n} className={s.draft}>
                <article aria-labelledby={`sf-d${d.n}`}>
                  <p className={s.dmeta}>
                    <span>Borrador {d.n} de 3</span>
                    <span className={s.leader} />
                    <span>Próximamente</span>
                  </p>
                  <h3 id={`sf-d${d.n}`} className={s.dtitle}>
                    {d.title}
                  </h3>
                  <p className={s.dexcerpt}>{d.excerpt}</p>
                  <a
                    className={s.notify}
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Avisame cuando salga: ${d.title}`)}`}
                  >
                    Avisame cuando salga
                  </a>
                  <span className={s.draftStamp} aria-hidden="true">
                    Borrador
                  </span>
                </article>
              </li>
            ))}
          </ol>
        </section>

        {/* border 4: the cursor becomes the ink bar */}
        <div className={s.bar} aria-hidden="true">
          <span className={s.barIn} />
        </div>

        {/* ============================================================ 05 CONTACTO */}
        <section id="contacto" className={`${s.sheet} ${s.contact}`} data-sheet data-contact aria-labelledby="sf-contact">
          <Disc className={`${s.sun} ${s.sunContact}`} />
          <Disc className={`${s.yellow} ${s.yContact}`} />
          <p className={s.meta}>
            <span>Pliego 05/06</span>
            <span className={s.leader} />
            <span>Contacto</span>
          </p>
          <h2 id="sf-contact" className={s.contactH}>
            <a href={`mailto:${EMAIL}`} className={s.bigMail}>
              <Plated text="Escribime" cursor />
              <span className={s.sr}> a {EMAIL}</span>
            </a>
          </h2>

          <p className={s.mailLine}>
            <span className={s.mailAddr}>{EMAIL}</span>
            <button type="button" className={s.copy} data-copy={EMAIL}>
              Copiar dirección
            </button>
            <span className={s.copied} data-copied aria-live="polite" />
          </p>

          <form
            className={s.coupon}
            action={`mailto:${EMAIL}`}
            method="get"
            encType="text/plain"
            data-coupon
          >
            <p className={s.couponH}>
              <span>Cupón</span>
              <span className={s.leader} />
              <span>completá y mandá</span>
            </p>
            <label className={s.field}>
              <span>Me llamo</span>
              <input name="name" autoComplete="name" required />
            </label>
            <fieldset className={s.choices}>
              <legend>y te escribo por</legend>
              <label>
                <input type="radio" name="subject" value="Un proyecto freelance" defaultChecked />
                <span>un proyecto freelance</span>
              </label>
              <label>
                <input type="radio" name="subject" value="Un puesto remoto full-time" />
                <span>un puesto remoto full-time</span>
              </label>
              <label>
                <input type="radio" name="subject" value="Otra cosa" />
                <span>otra cosa</span>
              </label>
            </fieldset>
            <label className={`${s.field} ${s.fieldArea}`}>
              <span>Contame</span>
              <textarea name="body" rows={3} />
            </label>
            <div className={s.couponFoot}>
              <button type="submit" className={s.send}>
                Mandar
              </button>
              <p className={s.couponNote} data-coupon-note aria-live="polite">
                Abre tu app de mail con todo escrito. No hay servidor en el medio.
              </p>
            </div>
          </form>

          <ul className={s.elsewhere}>
            <li>
              <a href={GITHUB} {...ext}>
                GitHub<span className={s.sr}> (se abre en otra pestaña)</span>
              </a>
              <span className={s.handle}>/TioDanx</span>
            </li>
            <li>
              <a href={LINKEDIN} {...ext}>
                LinkedIn<span className={s.sr}> (se abre en otra pestaña)</span>
              </a>
              <span className={s.handle}>/daniel-campuzano</span>
            </li>
          </ul>
        </section>

        {/* border 5: a cut line made of underscores */}
        <div className={s.cut} aria-hidden="true">
          <span>cortá acá</span>
        </div>
      </main>

      {/* ============================================================ 06 COLOFÓN */}
      <footer className={`${s.sheet} ${s.footer}`} data-sheet>
        <RegButton className={s.regFoot} />
        <p className={s.meta}>
          <span>Pliego 06/06</span>
          <span className={s.leader} />
          <span>Colofón</span>
        </p>
        <p className={s.colophon}>
          Impreso a dos tintas, Federal Blue y Fluorescent Pink, sobre papel crema. Bueno: simulado,
          esto es una pantalla. Tipografía: Roboto Flex, estirada en dos ejes, y la mono de tu
          sistema. Lo armó Daniel Campuzano con Next.js, a puro prompt con Claude Code.{" "}
          <span>
            Tambor 3:{" "}
            <button type="button" className={s.secret} data-yellow-btn aria-pressed="false">
              Yellow
            </button>
            <span data-yellow-status>, cargado, sin usar.</span>
          </span>
        </p>
        <p className={s.hint}>Hay cuatro cosas escondidas en estos pliegos. Ninguna rompe nada.</p>
        <p className={s.footName}>
          <Plated text="Daniel Campuzano" cursor className={s.footPlated} />
        </p>
        <p className={s.footRow}>
          <span>
            Buenos Aires · <Clock />
          </span>
          <a href="#sf-name">Volver arriba</a>
        </p>
      </footer>

      <div className={s.jam} role="alertdialog" aria-labelledby="sf-jam-t" aria-describedby="sf-jam-d" data-jam-dialog hidden>
        <p id="sf-jam-t" className={s.jamT}>
          Atasco de papel
        </p>
        <p id="sf-jam-d" className={s.jamD}>
          Demasiados sellos en muy poco tiempo. La hoja quedó trabada en el tambor.
        </p>
        <button type="button" className={s.jamB} data-unjam>
          Abrir la tapa y sacar la hoja
        </button>
      </div>

      <Enhance />
    </div>
  );
}
