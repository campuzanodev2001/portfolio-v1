import { AGENCY, NEXT, STORY, VALUES } from "./data";
import { Pixel } from "./Pixel";
import { SectionHead } from "./SectionHead";

/**
 * Sobre mí como `git log --reverse`. Un riel vertical (el piso del hero puesto
 * de pie) baja por la historia; Clawd va sticky sobre el riel y los commits que
 * ya pasó quedan firmes. Después del HEAD el riel sigue punteado (lo que todavía
 * no se commiteó: valores y TODOs) y dobla como la rama campuzano.studio, que
 * se vuelve la vía de Proyectos.
 */

// Hash corto determinista (FNV-1a): mismo commit, mismo hash en cada render.
function hash(s: string) {
  let h = 0x811c9dc5;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

const KALI = 3;
const LANGS = 4;
const LANG_LIST = ["C", "C++", "C#", "Pascal", "ASM", "Java", "JS"];

function Subject({ commit, index }: { commit: string; index: number }) {
  const [type, ...rest] = commit.split(": ");
  const text = rest.join(": ");
  return (
    <span className="ab-subject">
      <span className="ab-type">{type}:</span> {text}
      {index === LANGS && (
        <>
          {" "}
          <span className="cl-sr">{LANG_LIST.join(", ")}</span>
          <span className="ab-langs" aria-hidden="true">
            <span className="ab-langs__reel">
              {LANG_LIST.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
          </span>
        </>
      )}
    </span>
  );
}

export function About() {
  const last = STORY.length - 1;
  return (
    <section className="cl-sec ab" id="sobre-mi" aria-labelledby="sobre-mi-t">
      <SectionHead
        id="sobre-mi"
        title="Sobre mí"
        prompt="contá quién soy"
        reply="Va. Te lo cuento desde el principio."
      />

      <div className="ab-body">
        <div className="ab-intro">
          <p className="cl-big">
            Él es Daniel, desarrollador fullstack. Nació en Argentina en 2001 y
            hoy vive en Barcelona.
          </p>
          <p>
            Trabajamos juntos todos los días: yo y otros agentes escribimos
            buena parte del código, y su trabajo es que ese código tenga
            sentido. Elegir la arquitectura, aplicar patrones de diseño cuando
            hacen falta (y no cuando no), sostener principios como SOLID y
            armarme el contexto para que haga lo correcto.
          </p>
        </div>

        <div className="ab-repo">
          <p className="ab-cmd" aria-hidden="true">
            <span>$</span> git log --reverse
          </p>
          <h3 className="cl-sr">Cómo llegó</h3>
          <div className="ab-graph" data-scrub="0.55" data-reveal="custom">
            <div className="ab-rail" aria-hidden="true">
              <div className="ab-rider">
                <Pixel pose="idle" hood className="is-walker" />
              </div>
            </div>
            <ol className="ab-log">
              {STORY.map((s, i) => (
                <li key={s.when} className="ab-commit" data-step>
                  <p className="ab-line">
                    <span className="ab-hash">{hash(s.commit)}</span>
                    <Subject commit={s.commit} index={i} />
                    {i === KALI && (
                      <span className="ab-wifi" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    )}
                    {i === last && <span className="ab-head">HEAD → main</span>}
                  </p>
                  <p className="ab-when">{s.when}</p>
                  <p className="ab-text">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="ab-tree">
            <p className="ab-cmd" aria-hidden="true">
              <span>$</span> git config --list
            </p>
            <h3 className="cl-sr">Lo que sostiene</h3>
            <dl className="ab-config">
              {VALUES.map((v, i) => (
                <div
                  key={v.key}
                  data-reveal
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <dt>
                    <span className="ab-key">{v.key}</span> ={" "}
                    <span className="ab-true">true</span>
                    <span className="cl-sr">: {v.title}</span>
                  </dt>
                  <dd>{v.text}</dd>
                </div>
              ))}
            </dl>

            <p className="ab-cmd" aria-hidden="true">
              <span>$</span> grep -r TODO
            </p>
            <h3 className="cl-sr">Qué busca</h3>
            <ul className="ab-todo">
              {NEXT.map((t, i) => (
                <li
                  key={t}
                  data-reveal
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="ab-todo__k" aria-hidden="true">
                    TODO
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* La salida: la rama que sale del riel y se vuelve la vía de Proyectos. */}
      <div className="ab-branch" data-scrub="0.95" data-span="0.55">
        <span className="ab-branch__line" aria-hidden="true" />
        <div className="ab-walker" aria-hidden="true">
          <Pixel pose="idle" className="is-walker" />
        </div>
        <a
          className="ab-branch__link"
          href={AGENCY}
          target="_blank"
          rel="noreferrer"
        >
          <span className="ab-branch__cmd">git switch campuzano.studio ↗</span>
          <span className="ab-branch__d">
            Su agencia: webs a medida para pequeñas empresas y profesionales.
          </span>
        </a>
      </div>
    </section>
  );
}
