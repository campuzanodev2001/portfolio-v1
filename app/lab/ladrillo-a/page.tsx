import type { CSSProperties } from "react";
import Image from "next/image";
import { BOOT_INLINE } from "./_components/boot";
import { EMAIL, GITHUB, LINKEDIN, PROJECTS, STACK } from "./_components/data";
import Enhance from "./_components/Enhance";
import { serif } from "./_components/fonts";
import s from "./ladrillo.module.css";

const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Ancho estimado (en em) de una palabra, para el ajuste CSS antes de que llegue el JS. */
const em = (t: string, k: number) => (t.length * k).toFixed(2);

/* ------------------------------------------------------------------ pared */

type Brick = {
  t: string; // palabra (vacía = ladrillo de peligro)
  g: number; // flex-grow: cuánto lugar le toca en la hilada
  k: number; // orden de caída (de abajo para arriba)
  tone?: "gold" | "ink";
  hazard?: boolean;
};

/** La pared del hero. Se levanta de abajo para arriba: k = orden de caída. */
const WALL: { h: "a" | "b" | "c"; bricks: Brick[] }[] = [
  {
    h: "a",
    bricks: [
      { t: "DANIEL", g: 5, k: 6 },
      { t: "", g: 1, k: 7, hazard: true },
    ],
  },
  { h: "a", bricks: [{ t: "CAMPUZANO", g: 1, k: 5, tone: "ink" }] },
  {
    h: "b",
    bricks: [
      { t: "FRONTEND", g: 1, k: 3 },
      { t: "ENGINEER", g: 1, k: 4, tone: "gold" },
    ],
  },
  {
    h: "c",
    bricks: [
      { t: "BUENOS AIRES", g: 3, k: 0, tone: "ink" },
      { t: "5+ AÑOS", g: 2, k: 1 },
      { t: "REACT · NEXT · TS", g: 3, k: 2 },
    ],
  },
];
const BRICK_COUNT = WALL.reduce((n, r) => n + r.bricks.length, 0);

/** Rajadura (se ve con data-crack) y su parche de cinta. */
function Crack() {
  return (
    <>
      <svg className={s.crack} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="44,0 52,22 41,38 58,57 47,74 55,100" />
      </svg>
      <span className={s.patch} aria-hidden="true" />
    </>
  );
}

/* ---------------------------------------------------------------- hiladas */

/** Hilada: dos tiras de ladrillos en traba, con palabras apretadas adentro. */
function Hilada({ words, top, bot }: { words: string[]; top: string; bot: string }) {
  const run = [...words, ...words, ...words];
  return (
    <div className={s.hilada} data-top={top} data-bot={bot} aria-hidden="true">
      {[0, 1].map((row) => (
        <div key={row} className={s.course} data-row={row}>
          {run.map((w, i) => (
            <span key={i} className={s.hb} style={v({ "--i": i % 9 })} data-press>
              <span className={`${s.hbw} ${s.v}`} data-fit="800" style={v({ "--em": em(w, 0.6) })}>
                {w}
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// Sin JS el stage nunca sale de "boot": se muestra la pared terminada.
const NOSCRIPT = `<style>#la [data-anim]{opacity:1!important;animation:none!important;translate:none!important}#la .${s.tapa}{display:none!important}#la .${s.countN}{--n:${BRICK_COUNT}!important}</style>`;

export default function LadrilloAPage() {
  return (
    <div
      id="la"
      className={s.root}
      data-stage="boot"
      data-font={serif.style.fontFamily}
      style={v({ "--bricks": BRICK_COUNT })}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: BOOT_INLINE }} />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT }} />
      <a className={s.skip} href="#sobre">
        Saltar al contenido
      </a>

      {/* ============================================================ NAV */}
      <header className={`${s.nav} ${s.fade}`} data-anim style={v({ "--o": 0 })}>
        <a className={s.logo} href="#arriba" aria-label="Daniel Campuzano, volver arriba">
          <svg className={s.mark} viewBox="0 0 54 54" aria-hidden="true">
            <rect x="9" y="9" width="43" height="43" fill="#B8975A" />
            <rect className={s.markBox} x="2" y="2" width="43" height="43" fill="#F4F1EA" stroke="#0E0D0B" strokeWidth="4" />
            <path className={s.markBox} d="M2 23.5H45M23.5 2V23.5M13 23.5V45M34 23.5V45" stroke="#0E0D0B" strokeWidth="3" fill="none" />
          </svg>
          <span className={s.logoWord}>D. Campuzano</span>
        </a>
        <nav className={s.navLinks} aria-label="Secciones">
          <a href="#sobre">Sobre mí</a>
          <a href="#proyectos">Proyectos</a>
        </nav>
        <a className={`${s.btn} ${s.btnSm}`} href="#escribime" data-press>
          Escribime
        </a>
      </header>

      <main>
        {/* =========================================================== HERO */}
        <section className={s.hero} id="arriba" aria-labelledby="la-h1">
          <div className={s.heroTop}>
            <p className={`${s.sticker} ${s.fade}`} data-anim style={v({ "--o": 1 })}>
              Disponible: freelance o remoto
            </p>
            <p className={s.count} aria-hidden="true">
              <span className={s.countLbl}>Ladrillos</span> <span className={s.countN} data-anim />
            </p>
          </div>

          <h1 id="la-h1" className={s.sr}>
            Daniel Campuzano, frontend engineer en Buenos Aires
          </h1>

          <div className={s.wallWrap}>
            <span className={s.plate} data-plate aria-hidden="true">
              <span className={s.plateRod} />
            </span>
            <div className={s.wall} data-wall>
              {WALL.map((row, ri) => (
                <div key={ri} className={s.row} data-h={row.h} data-row>
                  {row.bricks.map((b) => (
                    <span key={b.k} className={s.slot} data-slot style={v({ "--fg": b.g, "--k": b.k })}>
                      {b.hazard ? (
                        <button
                          type="button"
                          className={`${s.brick} ${s.hazard}`}
                          data-anim
                          data-brick
                          data-prensa-btn
                          aria-label="No apretar"
                        >
                          <span className={s.noTouch} aria-hidden="true">
                            <span className={s.noShort}>¡No!</span>
                            <span className={s.noLong}>No apretar</span>
                          </span>
                        </button>
                      ) : (
                        <span className={s.brick} data-anim data-brick data-tone={b.tone} aria-hidden="true">
                          <span className={`${s.word} ${s.v}`} data-fit data-word style={v({ "--em": em(b.t, 0.7) })}>
                            {b.t}
                          </span>
                          <Crack />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={s.heroFoot}>
            <p className={`${s.lede} ${s.fade}`} data-anim style={v({ "--o": 2 })}>
              Hace más de cinco años que hago que las cosas entren: un diseño en una pantalla de 360, catorce mil
              productos en un catálogo, una idea en un plazo corto. Lo que no entra, lo aprieto hasta que entra.
            </p>
            <div className={`${s.ctas} ${s.fade}`} data-anim style={v({ "--o": 3 })}>
              <a className={s.btn} href="#proyectos" data-press>
                Ver proyectos <span className={s.arr} aria-hidden="true">↓</span>
              </a>
              <a className={`${s.btn} ${s.btnPaper}`} href="#escribime" data-press>
                Escribime
              </a>
            </div>
            <p className={`${s.note} ${s.fade}`} data-anim style={v({ "--o": 4 })}>
              <span aria-hidden="true">¹ </span>Los ladrillos se aprietan (probá). Y si te parece que todo está muy en
              su lugar,{" "}
              <button type="button" className={s.inlineBtn} data-shuffle>
                mezclalos
              </button>
              : igual entran.
            </p>
          </div>
        </section>

        {/* hero (paper) -> sobre mí (ink) */}
        <Hilada words={STACK} top="paper" bot="ink" />

        {/* ======================================================= SOBRE MÍ */}
        <section className={`${s.sec} ${s.ink}`} id="sobre" aria-labelledby="sobre-h">
          <div className={s.wrap}>
            <p className={s.kick}>01 — Sobre mí</p>
            <h2 id="sobre-h" className={`${s.h2} ${s.v}`}>
              Hermano mayor. Me las{" "}
              <span className={`${s.blk} ${s.v}`} data-press>
                rebusco
              </span>
              <span className={s.us}>_</span>
            </h2>

            <div className={s.bioGrid}>
              <figure className={s.portrait} data-press>
                <Image
                  className={s.photo}
                  src="/daniel.jpg"
                  alt="Retrato de Daniel Campuzano"
                  width={1080}
                  height={1350}
                  sizes="(min-width: 1100px) 340px, (min-width: 768px) 40vw, 78vw"
                />
                <figcaption className={s.photoTag}>D. Campuzano · Buenos Aires</figcaption>
              </figure>

              <div className={s.bioText}>
                <p className={s.bioLead}>
                  Soy Daniel Campuzano, frontend engineer en Buenos Aires. Hace más de cinco años que hago interfaces
                  con React, Next.js y TypeScript, y soy Técnico en Informática.
                </p>
                <p>
                  Fui el hermano mayor toda la vida, y eso entrena: cuando algo no anda, no hay a quién pasárselo. Lo
                  desarmás, entendés por qué falla y lo hacés andar con lo que haya. Me las tuve que rebuscar
                  siempre; ahora lo hago con interfaces.
                </p>
                <p>
                  Me importa lo que pasa del otro lado de la pantalla: que la letra respire, que el botón conteste
                  cuando lo apretás, que la página cargue aunque la señal venga floja. Uso Tailwind y Framer Motion,
                  y Firebase o Supabase cuando el proyecto pide backend.
                </p>
                <p>
                  Claude Code y Cursor están abiertos todos los días. Esta página no la escribí a mano: la armé a
                  puro prompt, apretando cada ladrillo hasta que entró.
                </p>
              </div>

              <dl className={s.pile}>
                {[
                  ["Oficio", "Frontend Engineer"],
                  ["Experiencia", "5+ años"],
                  ["Base", "Buenos Aires, Argentina"],
                  ["Formación", "Técnico en Informática"],
                  ["Todos los días", "Claude Code y Cursor"],
                  ["Disponible", "Freelance · remoto full-time"],
                ].map(([k, val], i) => (
                  <div key={k} className={s.pb} data-press style={v({ "--r": `${[-1.5, 1, -0.5, 1.5, -1, 0.8][i]}deg` })}>
                    <dt>{k}</dt>
                    <dd>{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* sobre mí (ink) -> proyectos (paper): la morsa aprieta la palabra */}
        <div className={s.morsa} data-morsa>
          <span className={`${s.jaw} ${s.jawL}`} aria-hidden="true" />
          <h2 id="proyectos" className={s.morsaH}>
            <span className={s.sr}>Proyectos</span>
            <span className={`${s.morsaW} ${s.v}`} data-morsa-word aria-hidden="true">
              PROYECTOS
            </span>
          </h2>
          <span className={`${s.jaw} ${s.jawR}`} aria-hidden="true" />
          <span className={s.morsaLbl} aria-hidden="true">
            wdth <b className={s.morsaN} />
          </span>
        </div>

        {/* ====================================================== PROYECTOS */}
        <section className={`${s.sec} ${s.paper} ${s.projSec}`} aria-labelledby="proyectos">
          <div className={s.wrap}>
            <p className={s.kick}>02 — Proyectos</p>
            <p className={s.intro}>
              Siete proyectos, un solo molde: el nombre tiene que entrar en la caja, sea corto o largo. Seis están
              entregados; el último todavía está en la prensa.
            </p>

            <ol className={s.cards}>
              {PROJECTS.map((p, i) => (
                <li key={p.name} className={s.card} data-wip={p.wip ? "" : undefined}>
                  <div className={s.cardHead}>
                    <span className={s.cardN} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className={s.cardName}>
                      <span className={`${s.cardWord} ${s.v}`} data-fit style={v({ "--em": em(p.name, 0.6) })}>
                        {p.name}
                      </span>
                    </h3>
                  </div>
                  <figure className={s.thumb}>
                    {p.img ? (
                      <Image
                        src={p.img.src}
                        alt={p.alt ?? ""}
                        width={p.img.w}
                        height={p.img.h}
                        sizes="(min-width: 900px) 44vw, calc(100vw - 48px)"
                      />
                    ) : (
                      <div className={s.noShot}>
                        <span className={s.noShotTag}>Sin captura todavía</span>
                      </div>
                    )}
                  </figure>
                  <div className={s.cardBody}>
                    <p className={s.cardKind}>{p.kind}</p>
                    <p className={s.cardText}>{p.text}</p>
                    <ul className={s.chips} aria-label="Stack">
                      {p.stack.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                    {(p.live || p.repo) && (
                      <p className={s.cardLinks}>
                        {p.live && (
                          <a className={`${s.btn} ${s.btnSm}`} href={p.live} target="_blank" rel="noopener noreferrer" data-press>
                            Ver el sitio<span className={s.sr}> de {p.name}</span>
                          </a>
                        )}
                        {p.repo && (
                          <a
                            className={`${s.btn} ${s.btnSm} ${s.btnPaper}`}
                            href={p.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-press
                          >
                            Código<span className={s.sr}> de {p.name}</span>
                          </a>
                        )}
                      </p>
                    )}
                    {p.wip && <p className={s.wipNote}>Todavía sin link: cuando salga de la prensa, va acá.</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* proyectos (paper) -> escribime (gold): la cinta que no hay que tocar */}
        <div className={s.tapeEdge}>
          <p className={s.under}>
            Fuera de la pantalla me gusta de todo un poco: vóley, música, juegos, la naturaleza, enseñar y los
            amigos.
          </p>
          <button type="button" className={s.tape} data-tape aria-label="Cinta de peligro. Arrancala.">
            <span className={s.tapeTrack} aria-hidden="true">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i}>
                  No tocar<b /> Frágil<b /> Hecho a presión<b /> No tocar<b /> Este lado arriba<b />
                </span>
              ))}
            </span>
          </button>
        </div>

        {/* ======================================================= CONTACTO */}
        <section className={`${s.sec} ${s.gold} ${s.contact}`} id="escribime" aria-labelledby="escribime-h">
          <div className={s.wrap}>
            <p className={s.kick}>03 — Escribime</p>
            <h2 id="escribime-h" className={s.ctaH} data-kin>
              {[..."Escribime"].map((c, i) => (
                <span key={i} className={`${s.kc} ${s.v}`} style={v({ "--i": i })} aria-hidden="true">
                  {c}
                </span>
              ))}
              <span className={s.sr}>Escribime</span>
            </h2>
            <div className={s.contactGrid}>
              <div>
                <p className={s.contactIntro}>
                  Para un proyecto freelance, un puesto remoto full-time o para saludar. Contesto yo, y rápido.
                </p>
                <nav className={s.elsewhere} aria-label="Otros lugares">
                  <a className={`${s.btn} ${s.btnInk}`} href={GITHUB} target="_blank" rel="me noopener noreferrer" data-press>
                    GitHub
                  </a>
                  <a className={`${s.btn} ${s.btnInk}`} href={LINKEDIN} target="_blank" rel="me noopener noreferrer" data-press>
                    LinkedIn
                  </a>
                  <a className={`${s.btn} ${s.btnPaper}`} href={`mailto:${EMAIL}`} data-press>
                    Mail
                  </a>
                </nav>
              </div>

              <div className={s.launch} data-launch>
                <p className={s.launchLbl} aria-hidden="true">
                  <span>Mail</span>
                  <span data-mail-state>Tocá para copiar</span>
                </p>
                <div className={s.launchBay}>
                  <button type="button" className={s.bigbtn} data-copy={EMAIL}>
                    <span className={s.mailAddr}>{EMAIL}</span>
                    <span className={s.bigArr} aria-hidden="true">
                      →
                    </span>
                  </button>
                  <button type="button" className={s.tapa} data-tapa aria-label="Levantar la tapa del botón del mail">
                    <span>Levantá la tapa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* escribime (gold) -> footer (ink) */}
        <Hilada words={PROJECTS.map((p) => p.name)} top="gold" bot="ink" />
      </main>

      {/* ========================================================= FOOTER */}
      <footer className={s.foot}>
        <div className={s.wrap}>
          <p className={s.footMark} aria-hidden="true">
            <span className={`${s.footWord} ${s.v}`} data-fit>
              {[..."CAMPUZANO"].map((c, i) => (
                <span key={i} className={`${s.fc} ${s.v}`} style={v({ "--i": i })}>
                  {c}
                </span>
              ))}
            </span>
          </p>
          <div className={s.footCols}>
            <p>Daniel Campuzano · Frontend engineer · Buenos Aires, Argentina.</p>
            <p className={s.footMono}>
              Hecha a puro prompt con Claude Code. Prototipo del lab: A presión (neobrutalismo × kinetic).
            </p>
            <p className={s.footMono} data-count-wrap>
              Ladrillos apretados en esta visita: <b data-count>0</b>
              <span className={s.countMsg} data-count-msg />
            </p>
            <a className={`${s.btn} ${s.btnSm}`} href="#arriba" data-press>
              Volver arriba ↑
            </a>
          </div>
        </div>
      </footer>

      <p className={s.toast} data-live aria-live="polite" />
      <span className={s.ruler} data-ruler aria-hidden="true" />
      <Enhance />
    </div>
  );
}
