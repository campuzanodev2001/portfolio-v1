import { CELL, DAY, NAME_H, NAME_W, STEPS, STEP_H, STEP_W, nameSlots } from "./_components/art";
import { BARRIO, barrioSvg } from "./_components/iso";
import Clock from "./_components/Clock";
import Obra from "./_components/Obra";
import s from "./obra.module.css";

/*
 * Antes de pintar: ¿loader completo, entrada corta o versión calma?
 * Corre en el parse del HTML (sin esperar a React) para que no haya flash.
 */
const BOOT = `(function(){var r=document.currentScript&&document.currentScript.parentElement;if(!r)return;var m="entrance";try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)m="calm";else if(sessionStorage.getItem("lab-la-obra-booted")!=="1")m="build"}catch(e){}r.setAttribute("data-boot",m);r.setAttribute("data-t0",String(Math.round(performance.now())))})()`;

/** El nombre en bloques, como SVG servido: se ve antes (y sin) JavaScript. */
function nameSvg() {
  const slots = nameSlots();
  const solid = DAY.brick.map(() => ({ face: "", hi: "", lo: "" }));
  let plan = "";
  for (const { c, r, v } of slots) {
    const x = c * CELL;
    const y = r * CELL;
    solid[v].face += `M${x} ${y}h3v3h-3z`;
    solid[v].hi += `M${x} ${y}h2v1h-1v1h-1z`;
    solid[v].lo += `M${x + 1} ${y + 2}h2v1h-2z`;
    plan += `M${x + 1} ${y + 1}h1v1h-1z`;
  }
  return { solid, plan };
}

/** Borde escalonado: clip-path en múltiplos de --u (el mismo pixel del canvas). */
function steppedTop() {
  const u = (n: number) => `calc(var(--u) * ${n})`;
  const pts: string[] = [`0 ${u(STEPS * STEP_H)}`];
  for (let i = 0; i < STEPS; i++) {
    pts.push(`${u((i + 1) * STEP_W)} ${u((STEPS - i) * STEP_H)}`);
    pts.push(`${u((i + 1) * STEP_W)} ${u((STEPS - i - 1) * STEP_H)}`);
  }
  for (let i = STEPS - 1; i >= 0; i--) {
    pts.push(`calc(100% - ${u((i + 1) * STEP_W)}) ${u((STEPS - i - 1) * STEP_H)}`);
    pts.push(`calc(100% - ${u((i + 1) * STEP_W)}) ${u((STEPS - i) * STEP_H)}`);
  }
  pts.push(`100% ${u(STEPS * STEP_H)}`, "100% 100%", "0 100%");
  return `polygon(${pts.join(", ")})`;
}

export default function LaObraPage() {
  const name = nameSvg();
  const barrio = barrioSvg();

  return (
    <div className={s.root} data-obra-root="" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />

      <section className={s.hero} aria-labelledby="obra-name">
        <Obra />

        <header className={s.top}>
          <p className={s.status}>
            <span className={s.block} aria-hidden="true" />
            <span className={s.dayOnly}>Obra en curso</span>
            <span className={s.nightOnly}>Turno noche</span>
          </p>
          <p className={s.clock}>
            <span className={s.skip}>Tocá para saltear</span>
            <span className={s.when}>
              Buenos Aires <Clock />
            </span>
          </p>
        </header>

        <div className={s.grid}>
          <div className={s.stage} data-obra="stage">
            <h1 id="obra-name" className={s.name}>
              <span className={s.sr}>Daniel Campuzano</span>
              <svg
                className={s.nameSvg}
                viewBox={`0 0 ${NAME_W} ${NAME_H}`}
                shapeRendering="crispEdges"
                aria-hidden="true"
                focusable="false"
              >
                <g className={s.solid}>
                  {name.solid.map((p, i) => (
                    <g key={i}>
                      <path d={p.face} fill={DAY.brick[i][0]} />
                      <path d={p.hi} fill={DAY.brick[i][1]} />
                      <path d={p.lo} fill={DAY.brick[i][2]} />
                    </g>
                  ))}
                </g>
                <path className={s.plan} d={name.plan} fill={DAY.plan} />
              </svg>
            </h1>
          </div>

          <p className={`${s.lede} ${s.reveal}`} data-obra="lede">
            Frontend engineer. Hace más de cinco años que levanto interfaces con React, Next.js y
            TypeScript, desde Buenos Aires.
          </p>

          <aside className={s.cartel} data-obra="cartel" aria-label="Cartel de obra">
            <div className={s.panel}>
              <p className={s.band}>Cartel de obra</p>
              <dl className={s.rows}>
                <div>
                  <dt>Obra</dt>
                  <dd>Portfolio personal, a la vista</dd>
                </div>
                <div>
                  <dt>Dirección</dt>
                  <dd>Daniel Campuzano, Técnico en Informática</dd>
                </div>
                <div>
                  <dt>Rubro</dt>
                  <dd>Frontend · 5+ años</dd>
                </div>
                <div>
                  <dt>Materiales</dt>
                  <dd>React, Next.js, TypeScript, Tailwind, Framer Motion, Firebase, Supabase</dd>
                </div>
                <div>
                  <dt>Herramientas</dt>
                  <dd>Claude Code y Cursor, todos los días</dd>
                </div>
                <div>
                  <dt>Consultas</dt>
                  <dd className={s.links}>
                    <a href="mailto:danicampu56@gmail.com">danicampu56@gmail.com</a>
                    <a href="https://github.com/TioDanx" rel="me noopener" target="_blank">
                      GitHub
                    </a>
                    <a
                      href="https://www.linkedin.com/in/daniel-campuzano-7149552b7"
                      rel="me noopener"
                      target="_blank"
                    >
                      LinkedIn
                    </a>
                  </dd>
                </div>
              </dl>
              <p className={s.fine}>Si rompés algo, la cuadrilla lo arregla.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className={s.next} style={{ clipPath: steppedTop() }} aria-labelledby="obra-barrio">
        <p className={s.kicker}>Próxima etapa</p>
        <h2 id="obra-barrio" className={s.h2}>
          El barrio
        </h2>
        <p className={s.copy}>
          Cada proyecto va a ser un edificio, con su historia adentro. Por ahora está el plano.
        </p>
        <div className={s.barrio}>
          <svg
            viewBox={`0 0 ${barrio.w} ${barrio.h}`}
            style={{ width: `calc(var(--u) * ${barrio.w})`, height: `calc(var(--u) * ${barrio.h})` }}
            shapeRendering="crispEdges"
            aria-hidden="true"
            focusable="false"
          >
            {barrio.paths.map((p) => (
              <path key={p.fill} d={p.d} fill={p.fill} />
            ))}
          </svg>
        </div>
        <ol className={s.lots}>
          {BARRIO.map((b) => (
            <li key={b.name}>
              {b.name}
              {b.built !== undefined && <span> — en obra, 14.000+ productos</span>}
            </li>
          ))}
        </ol>
        <p className={s.night}>
          Hay turno noche. Se pide con el código de siempre (en el celu, deslizando y después dos
          toques).
        </p>
      </section>
    </div>
  );
}
