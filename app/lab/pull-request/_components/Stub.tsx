import type { CSSProperties } from "react";
import { PROJECTS } from "./content";

/**
 * Preview del borde de sección: cada sección es un hunk. El header
 * `@@ -2,0 +7,8 @@` es un <summary> nativo: colapsa/expande sin JS.
 * Numeración: el hero ocupa las líneas 1–6 del archivo nuevo; esta sección
 * arranca en la 7 (título) y suma 8 líneas (título + 7 proyectos).
 */
export function Stub() {
  return (
    <section className="pr-stub" aria-labelledby="pr-projects">
      <details className="pr-hunkwrap" open>
        <summary className="pr-hunk">
          <span className="pr-plus is-toggle" aria-hidden="true" />
          <code>@@ -2,0 +7,8 @@</code>
          <span className="pr-hunk-ctx">&lt;Proyectos /&gt;</span>
          <span className="pr-hunk-rule" aria-hidden="true" />
        </summary>

        <div className="pr-rows pr-rows--static">
          <div className="pr-row" style={{ "--i": 0 } as CSSProperties}>
            <div className="pr-gut" aria-hidden="true">
              <span className="pr-n">7</span>
              <span className="pr-plus" />
            </div>
            <div className="pr-cell">
              <h2 className="pr-h2" id="pr-projects">
                Proyectos
              </h2>
            </div>
          </div>
          {PROJECTS.map((p, i) => (
            <div className="pr-row pr-proj" key={p.name} style={{ "--i": i + 1 } as CSSProperties}>
              <div className="pr-gut" aria-hidden="true">
                <span className="pr-n">{8 + i}</span>
                <span className="pr-plus" />
              </div>
              <div className="pr-cell pr-proj-cell">
                <h3 className="pr-proj-name">{p.name}</h3>
                <p className="pr-proj-what">
                  {p.what}
                  {p.stack && <span className="pr-proj-stack"> · {p.stack}</span>}
                  {p.wip && <span className="pr-proj-wip"> · en curso</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </details>

      <div className="pr-hunk pr-hunk--pending" role="note">
        <span className="pr-plus is-minus" aria-hidden="true" />
        <code>@@ … @@</code>
        <span className="pr-hunk-ctx">bio · blog · contacto: todavía no están en este diff</span>
        <span className="pr-hunk-rule" aria-hidden="true" />
      </div>
    </section>
  );
}
