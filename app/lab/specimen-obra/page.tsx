import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Roboto_Flex } from "next/font/google";
import { BOOT_INLINE } from "./_components/boot";
import Clock from "./_components/Clock";
import Enhance from "./_components/Enhance";
import Sprite from "./_components/Sprite";
import { EMAIL, GITHUB, LINKEDIN, POSTS, PROJECTS } from "./_components/data";
import { obraSvg } from "./_components/iso";
import { helmetPaths, tileDataUri } from "./_components/sprites";
import s from "./so.module.css";

// Una sola familia web: Roboto Flex, sólo wght + wdth (latin ≈ 60 KB).
// La segunda voz es la mono del sistema (0 bytes) para las anotaciones.
const flex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-flex",
});

export const metadata: Metadata = {
  title: "Specimen × La Obra — Daniel Campuzano",
  description:
    "Daniel Campuzano, frontend engineer en Buenos Aires. Una cuadrilla en pixel art levanta, ajusta y repara letras variables gigantes.",
};

const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Cada letra viaja a su extremo del espacio de diseño antes de asentarse. */
const PATH = [
  { c: "D", xw: 1000, xd: 151, xs: "0deg" },
  { c: "A", xw: 100, xd: 151, xs: "-12deg" },
  { c: "N", xw: 1000, xd: 25, xs: "0deg" },
  { c: "I", xw: 1000, xd: 151, xs: "-12deg" },
  { c: "E", xw: 100, xd: 90, xs: "-12deg" },
  { c: "L", xw: 1000, xd: 25, xs: "0deg" },
];

// Sin JS el stage nunca sale de "boot": se muestra la obra terminada.
const NOSCRIPT = `<style>#so .${s.ch},#so .${s.fade}{opacity:1!important;animation:none!important;clip-path:none!important}#so .${s.ch}{font-variation-settings:"wght" 860,"wdth" var(--fit)!important}#so .${s.cur}{translate:none!important;animation:none!important}#so .${s.cable}{display:none}</style>`;

/* ------------------------------------------------------------------ bordes */

const N = 6;
/** Borde escalonado: el corte de la sección de abajo es una escalera de N pasos. */
function stairClip(dir: "up" | "down") {
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const k = dir === "up" ? i + 1 : N - i;
    const y = `calc(var(--sh) * (${N} - ${k} * var(--rise)))`;
    pts.push(`${((i * 100) / N).toFixed(3)}% ${y}`, `${(((i + 1) * 100) / N).toFixed(3)}% ${y}`);
  }
  pts.push("100% 100%", "0% 100%");
  return `polygon(${pts.join(", ")})`;
}

function Stairs({
  dir,
  from,
  to,
  build = false,
  children,
}: {
  dir: "up" | "down";
  from: "a" | "b";
  to: "a" | "b";
  build?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={s.stairs} data-from={from} data-to={to} data-dir={dir} data-build={build ? "" : undefined} aria-hidden="true">
      <div className={s.stairFill} style={{ clipPath: stairClip(dir) }} />
      {children}
    </div>
  );
}

/** Palabra-borde: demasiado grande para la página, mitad en cada sección. */
function BorderWord({ id, text, from, to }: { id: string; text: string; from: "a" | "b"; to: "a" | "b" }) {
  const letters = (k: string) => (
    <span className={s.bwLayer} data-layer={k}>
      {[...text].map((c, i) => (
        <span key={i} className={s.bwCh} data-i={i}>
          {c}
        </span>
      ))}
      <span className={s.bwUs} data-i={text.length}>
        _
      </span>
    </span>
  );
  return (
    <div className={s.bw} data-from={from} data-to={to}>
      <h2 id={id} className={s.bwH}>
        <span className={s.sr}>{text}</span>
        <span className={s.bwRun} data-sink aria-hidden="true">
          {letters("1")}
          {letters("2")}
        </span>
      </h2>
    </div>
  );
}

export default function SpecimenObraPage() {
  const obra = obraSvg();
  const helmet = helmetPaths();

  return (
    <div
      id="so"
      className={`${flex.variable} ${s.root}`}
      data-stage="boot"
      data-font={flex.style.fontFamily}
      style={v({ "--tile-day": tileDataUri(true), "--tile-night": tileDataUri(false) })}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: BOOT_INLINE }} />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT }} />
      <a className={s.skipLink} href="#sobre">
        Saltar al contenido
      </a>

      <main>
        {/* ============================================================ HERO */}
        <section className={s.hero} data-hero aria-labelledby="so-name" id="arriba">
          <canvas className={s.crew} data-crew aria-hidden="true" />

          <header className={`${s.top} ${s.fade}`} style={v({ "--o": 0 })}>
            <p className={s.clock} data-clock>
              Buenos Aires · <Clock /> · <span className={s.dayOnly}>obra en curso</span>
              <span className={s.nightOnly}>turno noche</span>
            </p>
            <p className={s.spec}>Roboto Flex · wght 100–1000 · wdth 25–151</p>
          </header>

          <h1 className={s.name}>
            <span className={s.sr}>Daniel Campuzano</span>
            <span className={s.stage}>
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
                <span className={`${s.ch} ${s.cur}`} data-cur style={v({ "--i": 6 })}>
                  _<span className={s.cable} />
                </span>
                <span className={s.base} data-base />
              </span>
              <span className={s.vereda} data-vereda aria-hidden="true" />
            </span>
            <span className={`${s.last} ${s.fade}`} aria-hidden="true" style={v({ "--o": 1 })}>
              Campuzano<span className={s.sup}>¹</span>
            </span>
          </h1>

          <p className={`${s.readout} ${s.fade}`} data-readout data-c="DANIEL_" aria-hidden="true" style={v({ "--o": 1 })}>
            <span className={s.rw}>wght </span>
            <span className={s.rd}>wdth </span>
          </p>

          <div className={s.heroBody}>
            <p className={`${s.lede} ${s.fade}`} style={v({ "--o": 2 })}>
              Frontend engineer. Hace más de cinco años que levanto interfaces con React, Next.js y TypeScript, desde
              Buenos Aires
              <span className={s.dot} aria-hidden="true">
                .
              </span>
            </p>
            <nav className={`${s.index} ${s.fade}`} aria-label="Secciones" style={v({ "--o": 3 })}>
              <a href="#sobre">Sobre mí</a>
              <a href="#proyectos">Proyectos</a>
              <a href="#notas">Notas</a>
              <a href="#escribime">Escribime</a>
            </nav>
            <p className={`${s.foot} ${s.fade}`} style={v({ "--o": 4 })}>
              <span aria-hidden="true">¹ </span>Las letras no son botones. Igual,{" "}
              <button type="button" className={s.inlineBtn} data-drop>
                tocalas
              </button>
              : la cuadrilla las levanta.
            </p>
          </div>

          <div className={s.sign} data-sign data-show="0" aria-hidden="true">
            <span className={s.signBoard}>
              <b>No molestar</b>
              <small>volvemos en un toque</small>
            </span>
          </div>
        </section>

        {/* hero (a) -> sobre mí (b): la escalera se levanta con el scroll */}
        <Stairs dir="up" from="a" to="b" build>
          <span className={s.beam} />
          <Sprite frames={["sit"]} crew={1} flip className={s.sitter} />
        </Stairs>

        {/* ======================================================== SOBRE MÍ */}
        <section className={`${s.sec} ${s.secB} ${s.bio}`} id="sobre" aria-labelledby="sobre-h">
          <p className={s.kicker}>
            <span className={s.sq} aria-hidden="true" />
            01 — Sobre mí
          </p>
          <h2 id="sobre-h" className={s.bioH}>
            Quién dirige la obra<span className={s.us}>_</span>
          </h2>

          <div className={s.bioGrid}>
            <button
              type="button"
              className={s.portrait}
              data-portrait
              aria-pressed="false"
              aria-label="Retrato de Daniel Campuzano. Tocá para la versión cuadrilla, con casco."
            >
              <Image
                className={s.photo}
                src="/daniel.jpg"
                alt=""
                width={1080}
                height={1350}
                sizes="(min-width: 1024px) 360px, 62vw"
              />
              <Image className={s.pixel} src="/daniel.jpg" alt="" width={32} height={40} sizes="32px" />
              <svg
                className={s.helmet}
                viewBox={`0 0 ${helmet.w} ${helmet.h}`}
                shapeRendering="crispEdges"
                aria-hidden="true"
              >
                {helmet.paths.map((p) => (
                  <path key={p.fill} d={p.d} fill={p.fill} />
                ))}
              </svg>
              <span className={s.portraitTag} aria-hidden="true">
                <span className={s.tagDay}>D. Campuzano · dirección</span>
                <span className={s.tagPx}>versión cuadrilla</span>
              </span>
            </button>

            <div className={s.bioText}>
              <p className={s.bioLead}>
                Soy Daniel Campuzano, frontend engineer en Buenos Aires. Hace más de cinco años que hago interfaces
                con React, Next.js y TypeScript, y soy Técnico en Informática.
              </p>
              <p>
                Me importa lo que pasa del otro lado de la pantalla: que la letra respire, que el botón conteste, que
                la página cargue aunque la señal venga floja. Para eso uso Tailwind y Framer Motion, y Firebase o
                Supabase cuando el proyecto pide backend.
              </p>
              <p>
                Claude Code y Cursor están abiertos todos los días en mi máquina. Esta página es la prueba: no escribí
                el código a mano, la dirigí a puro prompt, como un director de obra con una cuadrilla que no se cansa
                (bueno, a veces se ofende).
              </p>
              <p className={s.avail}>
                Estoy disponible para <strong>freelance</strong> y para un puesto <strong>remoto full-time</strong>
                <span className={s.dotR} aria-hidden="true">
                  .
                </span>
              </p>
            </div>

            <div className={s.cartel}>
              <p className={s.cartelBand}>Cartel de obra</p>
              <dl>
              <div>
                <dt>Oficio</dt>
                <dd>Frontend Engineer</dd>
              </div>
              <div>
                <dt>Experiencia</dt>
                <dd>5+ años</dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>Buenos Aires, Argentina</dd>
              </div>
              <div>
                <dt>Formación</dt>
                <dd>Técnico en Informática</dd>
              </div>
              <div>
                <dt>Materiales</dt>
                <dd className={s.mats}>
                  {["React", "Next.js", "TypeScript", "Tailwind", "Framer Motion", "Firebase", "Supabase"].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Herramientas</dt>
                <dd>Claude Code y Cursor, todos los días</dd>
              </div>
              <div>
                <dt>Disponible</dt>
                <dd>Freelance · remoto full-time</dd>
              </div>
              </dl>
            </div>
          </div>
        </section>

        {/* sobre mí (b) -> proyectos (a): la palabra-borde */}
        <BorderWord id="proyectos" text="Proyectos" from="b" to="a" />

        {/* ======================================================= PROYECTOS */}
        <section className={`${s.sec} ${s.secA} ${s.projects}`} aria-labelledby="proyectos">
          <p className={s.kicker}>
            <span className={s.sq} aria-hidden="true" />
            02 — Proyectos
          </p>
          <p className={s.projIntro}>
            Siete obras. Seis entregadas y una con el andamio puesto. Cada nombre está compuesto en su propia instancia
            de la familia, como en un specimen.
          </p>

          <ol className={s.projList}>
            {PROJECTS.map((p, i) => (
              <li key={p.name} className={s.proj} data-wip={p.wip ? "" : undefined} style={v({ "--w": p.w, "--d": p.d })}>
                <p className={s.projMeta} aria-hidden="true">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {p.instance} · wght {p.w} · wdth {p.d}
                  </span>
                </p>
                <h3 className={s.projName}>
                  {p.name}
                  {p.wip && <span className={s.sr}> (en obra)</span>}
                </h3>

                <figure className={s.thumb}>
                  {p.img ? (
                    <Image
                      src={p.img.src}
                      alt={p.alt ?? ""}
                      width={p.img.w}
                      height={p.img.h}
                      sizes="(min-width: 1024px) 46vw, calc(100vw - 32px)"
                    />
                  ) : (
                    <div className={s.isoWrap}>
                      <svg
                        className={s.iso}
                        viewBox={`0 0 ${obra.w} ${obra.h}`}
                        style={v({ "--iw": obra.w, "--ih": obra.h })}
                        shapeRendering="crispEdges"
                        role="img"
                        aria-label="Dibujo de un edificio a medio construir, con andamio."
                      >
                        {obra.paths.map((q) => (
                          <path key={q.fill} d={q.d} fill={q.fill} />
                        ))}
                      </svg>
                      <Sprite frames={["hamUp", "hamDown"]} crew={2} className={s.isoWorker} />
                      <figcaption className={s.isoCap}>Todavía no hay captura: está en obra.</figcaption>
                    </div>
                  )}
                </figure>

                <div className={s.projBody}>
                  <p className={s.projText}>{p.text}</p>
                  <p className={s.projStack}>{p.stack.join(" · ")}</p>
                  {(p.live || p.repo) && (
                    <p className={s.projLinks}>
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noopener noreferrer">
                          Ver el sitio<span className={s.sr}> de {p.name}</span>
                        </a>
                      )}
                      {p.repo && (
                        <a href={p.repo} target="_blank" rel="noopener noreferrer">
                          Código<span className={s.sr}> de {p.name}</span>
                        </a>
                      )}
                    </p>
                  )}
                  {p.wip && (
                    <p className={s.wipNote}>
                      <span className={s.stampMini} aria-hidden="true">
                        En obra
                      </span>
                      Todavía sin link: cuando se inaugure, va acá.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <p className={s.planoNote}>
            <button type="button" className={s.planoBtn} data-plano-btn aria-pressed="false" aria-label="Ver el plano de la página">
              <svg viewBox="0 0 12 8" shapeRendering="crispEdges" aria-hidden="true">
                <path d="M2 1h8v6h-8z" fill="#2B49C4" />
                <path d="M1 2h1v4h-1zM10 2h1v4h-1z" fill="#1d3590" />
                <path d="M3 3h1v1h-1zM5 3h1v1h-1zM7 3h1v1h-1zM3 5h5v1h-5z" fill="#EAF0FF" />
              </svg>
            </button>
            <span>Los planos de la obra quedaron por acá.</span>
          </p>
        </section>

        {/* proyectos (a) -> notas (b): escalera que baja, con un laburante que la baja con vos */}
        <Stairs dir="down" from="a" to="b">
          <span className={s.beamDown} />
          <Sprite frames={["walkA", "walkB"]} crew={0} className={s.walker} />
        </Stairs>

        {/* =========================================================== NOTAS */}
        <section className={`${s.sec} ${s.secB} ${s.notes}`} id="notas" aria-labelledby="notas-h">
          <p className={s.kicker}>
            <span className={s.sq} aria-hidden="true" />
            03 — Notas
          </p>
          <h2 id="notas-h" className={s.notesH}>
            Libro de obra<span className={s.us}>_</span>
          </h2>
          <p className={s.notesIntro}>
            Todavía no publiqué nada. Estas tres están en obra: los títulos todavía son estructura, sin peso. Cuando
            estén, van acá.
          </p>
          <ol className={s.posts}>
            {POSTS.map((p, i) => (
              <li key={p.title} className={s.post} tabIndex={0}>
                <p className={s.postMeta}>
                  <span>{p.tag}</span>
                  <span>Borrador · sin fecha</span>
                </p>
                <h3 className={s.postTitle}>{p.title}</h3>
                <p className={s.postText}>{p.excerpt}</p>
                <span className={s.stamp} data-stamp style={v({ "--r": `${[-6, 4, -3][i]}deg` })} aria-hidden="true">
                  En obra
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* notas (b) -> escribime (a) */}
        <BorderWord id="escribime" text="Escribime" from="b" to="a" />

        {/* ======================================================== CONTACTO */}
        <section className={`${s.sec} ${s.secA} ${s.contact}`} aria-labelledby="escribime">
          <p className={s.kicker}>
            <span className={s.sq} aria-hidden="true" />
            04 — Escribime
          </p>
          <p className={s.contactIntro}>
            Para un proyecto freelance, un puesto remoto full-time o para decir hola. Contesto yo, no la cuadrilla.
          </p>

          <button type="button" className={s.mail} data-copy={EMAIL}>
            <span className={s.mailAddr}>{EMAIL}</span>
            <span className={s.mailEnd} aria-hidden="true" />
            <span className={s.mailHint}>
              <span className={s.hintIdle}>Tocá para copiar</span>
              <span className={s.hintDone}>Copiado</span>
            </span>
          </button>

          <div className={s.contactGrid}>
            <form className={s.parte} data-mailform={EMAIL} action={`mailto:${EMAIL}`} method="get" encType="text/plain">
              <fieldset className={s.kinds}>
                <legend>Parte de pedido</legend>
                {["Freelance", "Remoto full-time", "Sólo saludar"].map((k, i) => (
                  <label key={k} className={s.kind}>
                    <input type="radio" name="kind" value={k} defaultChecked={i === 0} />
                    <span>{k}</span>
                  </label>
                ))}
              </fieldset>
              <label className={s.bodyLabel} htmlFor="so-body">
                Contame la obra
              </label>
              <textarea id="so-body" name="body" rows={4} className={s.bodyField} placeholder="Qué querés hacer, para cuándo, con qué…" />
              <div className={s.sendRow}>
                <button type="submit" className={s.send}>
                  Mandar el parte
                </button>
                <span className={s.sendNote}>Abre tu programa de mail. Sin backend, sin formularios que se pierden.</span>
              </div>
              <span className={s.runnerTrack} aria-hidden="true">
                <span className={s.runner} data-runner>
                  <Sprite frames={["carta"]} crew={3} />
                </span>
              </span>
            </form>

            <nav className={s.elsewhere} aria-label="Otros lugares">
              <a href={GITHUB} target="_blank" rel="me noopener noreferrer">
                GitHub
              </a>
              <a href={LINKEDIN} target="_blank" rel="me noopener noreferrer">
                LinkedIn
              </a>
              <a href={`mailto:${EMAIL}`}>Mail</a>
            </nav>
          </div>
        </section>
      </main>

      {/* ========================================================= FOOTER */}
      <footer className={s.footer}>
        <div className={s.footVereda}>
          <button type="button" className={s.baldosa} data-baldosa aria-label="Una baldosa de la vereda">
            <span className={s.drop} />
            <span className={s.drop} />
            <span className={s.drop} />
            <span className={s.drop} />
            <span className={s.drop} />
          </button>
          <Sprite frames={["mate"]} crew={1} className={s.mateGuy} />
        </div>
        <div className={s.footBody}>
          <p className={s.footName}>
            Daniel Campuzano<span className={s.us}>_</span>
          </p>
          <p>Frontend engineer · Buenos Aires, Argentina.</p>
          <p className={s.footMono}>
            Obra levantada a puro prompt con Claude Code. Prototipo del lab: Specimen × La Obra. Ninguna letra salió
            herida (todas volvieron a su lugar).
          </p>
          <a className={s.up} href="#arriba">
            Volver arriba
          </a>
        </div>
      </footer>

      <p className={s.toast} data-live aria-live="polite" />
      <Enhance />
    </div>
  );
}
