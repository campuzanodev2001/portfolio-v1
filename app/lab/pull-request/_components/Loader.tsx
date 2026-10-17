import type { CSSProperties } from "react";
import { FILE, NAME, REMOVED, STATEMENT } from "./content";
import { vt } from "./vt";

type Props = {
  /** Los nombres de view-transition sólo existen mientras el loader está activo. */
  named: boolean;
  time: string | null;
};

/* Tiempos (ms desde el primer paint). Ver BRIEF.md → timeline. */
const T = { hunk: 90, del: [260, 330], add: [430, 495, 560, 625, 690, 755], caret: 860 };

const d = (ms: number, steps = 18) => ({ "--d": `${ms}ms`, "--steps": steps }) as CSSProperties;

/**
 * El diff que se escribe solo. Todo es CSS (corre antes de que llegue el JS);
 * React sólo lo desmonta cuando el diff "se aplica" y se vuelve el hero.
 */
export function Loader({ named, time }: Props) {
  return (
    <div className="pr-loader" aria-hidden="true">
      <div className="pr-l-head" style={vt("pr-bar", named)}>
        <span>{FILE}</span>
        <span className="pr-stat">
          <span className="pr-stat-add">+6</span> <span className="pr-stat-del">−2</span>
        </span>
      </div>

      <div className="pr-l-code">
        <div className="pr-l-hunk pr-l-typed" style={d(T.hunk, 30)}>
          <b>@@ -1,2 +1,6 @@</b> export default function Hero()
        </div>

        {REMOVED.map((line, i) => (
          <div key={line} className="pr-l-row is-del pr-l-typed" style={d(T.del[i], 14)}>
            <span className="pr-l-n">{i + 1}</span>
            <span className="pr-l-n" />
            <span className="pr-l-s">−</span>
            <span className="pr-l-src">
              <span className="pr-l-strike">{line}</span>
            </span>
          </div>
        ))}

        <Add n={1} at={T.add[0]} named={named}>
          <span className="pr-tok">&lt;h1&gt;</span>
          <span className="pr-l-v" style={vt("pr-first", named)}>
            {NAME.first}
          </span>{" "}
          <span className="pr-l-v" style={vt("pr-last", named)}>
            {NAME.last}
          </span>
          <span className="pr-tok">&lt;/h1&gt;</span>
        </Add>

        <Add n={2} at={T.add[1]} named={named}>
          <span className="pr-tok">&lt;p&gt;</span>
          <span className="pr-l-v pr-l-block" style={vt("pr-statement", named)}>
            {STATEMENT}
          </span>
          <span className="pr-tok">&lt;/p&gt;</span>
        </Add>

        <Add n={3} at={T.add[2]} named={named}>
          <span className="pr-tok">&lt;Here&gt;</span>
          <span className="pr-l-v" style={vt("pr-place", named)}>
            Buenos Aires · {time ?? "--:--"}
          </span>
          <span className="pr-tok">&lt;/Here&gt;</span>
        </Add>

        <Add n={4} at={T.add[3]} named={named}>
          <span className="pr-l-v" style={vt("pr-coauthor", named)}>
            Co-authored-by: Claude
          </span>
        </Add>

        <Add n={5} at={T.add[4]} named={named}>
          <span className="pr-tok">&lt;Links&gt;</span>
          <span className="pr-l-v" style={vt("pr-links", named)}>
            GitHub · LinkedIn · Mail
          </span>
          <span className="pr-tok">&lt;/Links&gt;</span>
        </Add>

        <Add n={6} at={T.add[5]} named={named}>
          <span className="pr-tok">&lt;Review&gt;</span>
          <span className="pr-l-v" style={vt("pr-q", named)}>
            ¿Lo aceptás?
          </span>
          <span className="pr-tok">&lt;/Review&gt;</span>
          <span className="pr-l-caret" style={d(T.caret)} />
        </Add>
      </div>
    </div>
  );
}

function Add({
  n,
  at,
  named,
  children,
}: {
  n: number;
  at: number;
  named: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="pr-l-row is-add pr-l-typed" style={d(at)}>
      <span className="pr-l-n" />
      <span className="pr-l-n" style={vt(`pr-n${n}`, named)}>
        {n}
      </span>
      <span className="pr-l-s" style={vt(`pr-s${n}`, named)}>
        +
      </span>
      <span className="pr-l-src">{children}</span>
    </div>
  );
}
