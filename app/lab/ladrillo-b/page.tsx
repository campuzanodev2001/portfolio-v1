import { Fragment, type CSSProperties } from "react";
import Image from "next/image";
import { BOOT_INLINE } from "./_components/boot";
import Enhance from "./_components/Enhance";
import { EMAIL, GITHUB, INTERESTS, LINKEDIN, PROJECTS, STACK } from "./_components/data";
import { serif } from "./_components/fonts";

/*
 * QUE ENTRE — Ladrillo B (kinetic × neobrutalismo).
 * El marco no cede: cajas de tinta de 3 px con sombra dura. Las letras sí:
 * se comprimen, se estiran, se parten y se justifican hasta entrar.
 * Dos formas en toda la página:
 *   1. el LADRILLO — rectángulo con borde de tinta y sombra dura. Cada caja,
 *      cada botón, cada hilada que separa secciones.
 *   2. la CUÑA — el triángulo a 45°: la cinta de peligro, las esquinas de
 *      los sellos, el ▶ de las etiquetas. Es lo que se mete cuando algo no entra.
 */

const v = (o: Record<string, string | number>) => o as CSSProperties;

// Sin JS el stage nunca sale de "boot": se muestra todo armado.
const NOSCRIPT = `<style>#lb .ch,#lb .fade,#lb .stamp-ok{opacity:1!important;animation:none!important;translate:none!important}#lb .frame-b{translate:none!important;animation:none!important;opacity:1!important}#lb .frame-a{box-shadow:var(--sh) var(--sh) 0 var(--ink)!important}#lb .frame-a::after{display:none!important}</style>`;

type FitProps = {
  text: string;
  className?: string;
  /** El puntero cambia el wght letra por letra (y el resto se reacomoda). */
  lens?: boolean;
  /** Entra apretándose con el scroll (wdth 150 → ajuste). */
  sq?: boolean;
  /** Índice donde se parte la palabra cuando ya no hay forma de que entre. */
  breakAt?: number;
  /** Para el lector de pantalla; si es false, el texto queda sólo visual. */
  sr?: boolean;
  extra?: Record<string, string>;
};

/** Una palabra que se ajusta sola al ancho de su caja (wdth medido por JS). */
function Fit({ text, className = "", lens, sq, breakAt, sr = true, extra }: FitProps) {
  const chars = Array.from(text);
  return (
    <span
      className={`fit ${className}`}
      data-fit=""
      data-lens={lens ? "" : undefined}
      data-sq={sq ? "" : undefined}
      style={v({ "--n": chars.length })}
      {...extra}
    >
      {sr && <span className="sr">{text}</span>}
      <span className="fit-in" aria-hidden="true">
        {chars.map((c, i) => (
          <Fragment key={i}>
            {breakAt === i && <span className="brk" />}
            <span className={c === " " ? "ch sp" : "ch"} style={v({ "--i": i })}>
              {c === " " ? "\u00a0" : c}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}

/** Ancho determinístico (en px "base") de cada ladrillo: unos aprietan, otros sobran. */
const brickW = (word: string, i: number) => {
  const f = [1.25, 0.72, 1.05, 0.62, 1.4, 0.9, 0.68, 1.15][i % 8];
  return Math.round(Math.max(64, word.length * 15 * f + 26));
};

/** Borde de sección: dos hiladas de ladrillos con palabras que entran como pueden. */
function Hilada({ words, tone }: { words: string[]; tone: "paper" | "ink" | "gold" }) {
  const rows = [words, [...words.slice(Math.ceil(words.length / 2)), ...words.slice(0, Math.ceil(words.length / 2))]];
  return (
    <div className={`hilada hilada-${tone}`} aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="row" data-row={r ? -1 : 1}>
          <div className="row-in">
            {[0, 1].map((copy) =>
              row.map((w, i) => (
                <span key={`${copy}-${i}`} className="brick" style={v({ "--bw": brickW(w, i + r * 3) })}>
                  <Fit text={w} sr={false} className="fit-brick" />
                </span>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tapes() {
  const a = ["Que entre", "Frontend engineer", "Buenos Aires", "React · Next.js · TypeScript", "Si no entra, lo hago entrar"];
  const b = ["Tocá las letras", "Achicá la caja", "Escribime", "Hecho a puro prompt", "Mirá los proyectos"];
  const track = (items: string[]) =>
    [0, 1].map((k) => (
      <span key={k} className="tape-set">
        {items.map((t) => (
          <span key={t}>
            {t}
            <b />
          </span>
        ))}
      </span>
    ));
  return (
    <div className="tapes fade" aria-hidden="true" style={v({ "--o": 5 })}>
      <div className="tape tape-a">
        <div className="tape-track" data-tape>
          {track(a)}
        </div>
      </div>
      <div className="tape tape-b">
        <div className="tape-track" data-tape>
          {track(b)}
        </div>
      </div>
    </div>
  );
}

export default function LadrilloBPage() {
  const techs = Array.from(new Set(PROJECTS.flatMap((p) => p.stack)));
  const count = (t: string) => PROJECTS.filter((p) => p.stack.includes(t)).length;

  return (
    <div id="lb" className="lb" data-stage="boot" data-font={serif.style.fontFamily} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: BOOT_INLINE }} />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT }} />
      <a className="skip" href="#sobre">
        Saltar al contenido
      </a>

      {/* ================================================================ NAV */}
      <header className="nav fade" style={v({ "--o": 0 })}>
        <a className="logo" href="#arriba" data-logo aria-label="Daniel Campuzano, volver arriba">
          <span className="logo-box" aria-hidden="true">
            DC
          </span>
          <span className="logo-word">Campuzano</span>
        </a>
        <nav className="nav-links" aria-label="Secciones">
          <a href="#sobre">Sobre mí</a>
          <a href="#proyectos">Proyectos</a>
        </nav>
        <a className="btn btn-sm" href="#escribime">
          Escribime
        </a>
      </header>

      <main>
        {/* =============================================================== HERO */}
        <section className="hero" id="arriba" aria-labelledby="lb-name">
          <p className="hero-top fade" style={v({ "--o": 1 })}>
            <span className="sticker">Frontend engineer · Buenos Aires</span>
            <span className="clock" aria-label="Hora en Buenos Aires">
              BA <span data-clock>--:--</span>
            </span>
          </p>

          <h1 className="hero-name" id="lb-name" data-hero>
            <span className="sr">Daniel Campuzano</span>
            <span className="frame frame-a" data-box style={v({ "--box": 100 })}>
              <Fit text="DANIEL" className="w-daniel fit--free" lens breakAt={4} sr={false} />
              <span className="wedge" aria-hidden="true" />
              <span className="stamp stamp-no" aria-hidden="true">
                No entra
              </span>
              <button type="button" className="stamp stamp-ok" data-restamp aria-label="Sello: entró. Tocalo para volver a sellar.">
                Entró
              </button>
            </span>
            <span className="frame frame-b">
              <Fit text="CAMPUZANO" className="w-campu" lens sr={false} />
            </span>
          </h1>

          <div className="hero-body">
            <p className="lede fade" style={v({ "--o": 2 })}>
              Hace más de cinco años que hago interfaces con React, Next.js y TypeScript. Vos traés la caja; yo me las
              rebusco para que entre<span className="gold">.</span>
            </p>
            <div className="ctas fade" style={v({ "--o": 3 })}>
              <a className="btn" href="#proyectos">
                Mirá lo que hice <span className="arr" aria-hidden="true">↓</span>
              </a>
              <a className="btn btn-ink" href="#escribime">
                Escribime <span className="arr" aria-hidden="true">→</span>
              </a>
            </div>
            <p className="boxctl fade" style={v({ "--o": 4 })}>
              <button type="button" className="btn btn-paper btn-sm" data-shrink>
                <span data-shrink-label>Achicá la caja</span>
              </button>
              <span className="readout" data-readout aria-hidden="true">
                caja 100% · wdth —
              </span>
            </p>
          </div>

          <Tapes />
        </section>

        {/* =========================================================== SOBRE MÍ */}
        <section className="sec s-paper" id="sobre" aria-labelledby="sobre-h">
          <div className="wrap">
            <p className="kick">01 — Sobre mí</p>
            <h2 id="sobre-h" className="title-brick">
              <span className="sr">Sobre mí: rebusque</span>
              <Fit text="REBUSQUE" className="w-title" lens sq sr={false} />
            </h2>

            <div className="bio">
              <div className="bio-text">
                <p className="big-p">
                  Fui el hermano mayor toda la vida. Eso quiere decir que, cuando algo no andaba, no había a quién
                  pasárselo: había que <em>rebuscársela</em>. Probar, romper, volver a probar. Ingeniárselas con lo que
                  hubiera a mano.
                </p>
                <p>
                  Sigo igual. Ahora lo que no anda suele ser una interfaz: un diseño que no entra en un celular, un
                  catálogo de 14.000 productos, una idea que todavía no tiene forma. Lo resuelvo con React, Next.js y
                  TypeScript, cuidando que lo que se ve sea fiel al diseño y rápido de verdad.
                </p>
                <p>
                  Laburo con Claude y Cursor al lado. Este sitio, sin ir más lejos, está armado a puro prompt.
                </p>

                <dl className="ficha">
                  <div>
                    <dt>Base</dt>
                    <dd>Buenos Aires</dd>
                  </div>
                  <div>
                    <dt>Oficio</dt>
                    <dd>Frontend engineer</dd>
                  </div>
                  <div>
                    <dt>Hace</dt>
                    <dd>más de 5 años</dd>
                  </div>
                  <div>
                    <dt>Herramientas</dt>
                    <dd>React · Next.js · TypeScript · Tailwind</dd>
                  </div>
                  <div>
                    <dt>Al lado</dt>
                    <dd>Claude · Cursor</dd>
                  </div>
                </dl>
              </div>

              <div className="bio-side">
                <button
                  type="button"
                  className="portrait"
                  data-portrait
                  aria-label="Retrato de Daniel Campuzano. Tocalo: intentá achicarlo."
                >
                  <Image
                    className="photo"
                    src="/daniel.jpg"
                    alt=""
                    width={1080}
                    height={1350}
                    sizes="(min-width: 900px) 360px, 72vw"
                  />
                  <span className="stamp stamp-photo" data-photo-stamp>
                    Entra justo
                  </span>
                </button>

                <div className="wall-wrap">
                  <p className="wall-h">
                    Fuera de la pantalla, de todo un poco <span className="hint">(tocalos)</span>
                  </p>
                  <ul className="wall" aria-label="Lo que me gusta">
                    {INTERESTS.map((w, i) => (
                      <li key={w} className={`wb wb-${i % 4}`}>
                        <button
                          type="button"
                          className="wbtn"
                          data-knock
                          data-loose={w === "juegos" ? "" : undefined}
                          aria-label={w}
                        >
                          <Fit text={w} sr={false} className="fit-wall" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="hole" data-hole aria-live="polite" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Hilada words={STACK} tone="paper" />

        {/* ========================================================== PROYECTOS */}
        <section className="sec s-ink" id="proyectos" aria-labelledby="proy-h">
          <div className="wrap">
            <p className="kick">02 — Proyectos</p>
            <h2 id="proy-h" className="title-brick title-brick-ink">
              <span className="sr">Proyectos: lo que entró</span>
              <Fit text="LO QUE ENTRÓ" className="w-title" lens sq sr={false} />
            </h2>
            <p className="intro">
              Cada proyecto vino con su caja: una plataforma que no se podía cambiar, un sistema que el cliente ya
              usaba, un celular de pantalla chica. Esto es lo que hice entrar.
            </p>

            <div className="filter" data-filterbar>
              <p className="filter-h">Filtrá por herramienta:</p>
              <ul className="chips">
                {techs.map((t) => (
                  <li key={t}>
                    <button type="button" className="chip" data-tech={t} aria-pressed="false">
                      {t} <span className="chip-n">{count(t)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <ol className="projs" data-projs>
              {PROJECTS.map((p, i) => (
                <li
                  key={p.name}
                  className={`proj${p.wip ? " proj-wip" : ""}`}
                  data-stack={p.stack.join("|")}
                  aria-labelledby={`proj-${i}`}
                >
                  <div className="proj-head">
                    <span className="proj-n">
                      {String(i + 1).padStart(2, "0")}/{String(PROJECTS.length).padStart(2, "0")}
                    </span>
                    {p.wip && <span className="sticker sticker-ink">En obra</span>}
                  </div>
                  <h3 id={`proj-${i}`} className="proj-name">
                    <span className="sr">{p.name}</span>
                    <Fit text={p.name} className="w-proj" lens sq sr={false} extra={p.wip ? { "data-wip": "" } : undefined} />
                  </h3>
                  {p.wip && (
                    <div className="proj-hazard" aria-hidden="true">
                      <span>Todavía no entra · todavía no entra · todavía no entra · todavía no entra</span>
                    </div>
                  )}
                  <div className="proj-body">
                    {p.img ? (
                      <div className="win">
                        <div className="win-bar" aria-hidden="true">
                          <i />
                          <i />
                          <span className="win-url">{p.host}</span>
                        </div>
                        <Image
                          className="win-img"
                          src={p.img.src}
                          alt={p.alt ?? ""}
                          width={p.img.w}
                          height={p.img.h}
                          sizes="(min-width: 900px) 600px, 90vw"
                        />
                      </div>
                    ) : (
                      <div className="win win-empty" aria-hidden="true">
                        <div className="win-bar">
                          <i />
                          <i />
                          <span className="win-url">{p.host}</span>
                        </div>
                        <div className="win-blank">
                          <span>Sin captura: está en obra.</span>
                        </div>
                      </div>
                    )}
                    <div className="proj-copy">
                      <p>{p.text}</p>
                      <ul className="stack" aria-label="Herramientas">
                        {p.stack.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                      {(p.live || p.repo) && (
                        <p className="proj-links">
                          {p.live && (
                            <a className="btn btn-sm" href={p.live} target="_blank" rel="noreferrer">
                              Ver en vivo <span className="arr" aria-hidden="true">↗</span>
                            </a>
                          )}
                          {p.repo && (
                            <a className="btn btn-sm btn-paper" href={p.repo} target="_blank" rel="noreferrer">
                              Código <span className="arr" aria-hidden="true">↗</span>
                            </a>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <Hilada words={["Mar del Plata", "Buenos Aires", ...INTERESTS.slice(0, 4), "a puro prompt", "rebusque"]} tone="ink" />

        {/* ========================================================== CONTACTO */}
        <section className="sec s-gold" id="escribime" aria-labelledby="mail-h">
          <div className="wrap">
            <p className="kick kick-ink">03 — Contacto</p>
            <h2 id="mail-h" className="title-brick title-brick-gold">
              <span className="sr">Escribime</span>
              <Fit text="ESCRIBIME" className="w-title" lens sq sr={false} />
            </h2>
            <p className="intro intro-ink">
              ¿Tenés algo que no entra en ningún lado? Contámelo. Si todavía no sé cómo se resuelve, lo averiguo.
            </p>

            <div className="mail">
              <a className="mail-btn" href={`mailto:${EMAIL}`} data-mail={EMAIL}>
                <Fit text={EMAIL} className="w-mail" sr={false} />
                <span className="sr">Escribime a {EMAIL}</span>
              </a>
              <p className="mail-note" data-mail-note>
                Tocalo y se copia. Tocalo otra vez y se abre tu correo.
              </p>
            </div>

            <ul className="links">
              <li>
                <a className="btn btn-ink" href={GITHUB} target="_blank" rel="noreferrer">
                  GitHub <span className="arr" aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a className="btn btn-paper" href={LINKEDIN} target="_blank" rel="noreferrer">
                  LinkedIn <span className="arr" aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* ============================================================= FOOTER */}
      <footer className="foot s-ink">
        <div className="hazard" aria-hidden="true" />
        <div className="wrap">
          <p className="foot-mark-wrap">
            <Fit text="CAMPUZANO" className="w-foot" extra={{ "data-wave": "" }} />
          </p>
          <div className="foot-row">
            <p>© 2026 Daniel Campuzano · Buenos Aires</p>
            <p className="foot-hint">Pista: hay palabras que se tipean. Probá con «caja».</p>
            <a className="btn btn-sm btn-gold-sh" href="#arriba">
              Arriba <span className="arr" aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </footer>

      <p className="toast" data-live role="status" aria-live="polite" />
      <p className="speed" data-speed aria-hidden="true">
        ¡Despacio, que no entra!
      </p>
      <Enhance />
    </div>
  );
}

