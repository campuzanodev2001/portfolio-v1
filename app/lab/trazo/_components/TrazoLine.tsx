"use client";

import { useEffect, useRef } from "react";
import { CHAPTERS, N, SHAPES, VIEW_W, toPath } from "./shapes";
import { CYCLE, HOLD, MORPH, breathe, edgeFade, morph, repel } from "./morph";

const COUNT = SHAPES.length;
const pad = (n: number) => String(n).padStart(2, "0");
/** Largo de la estela de la birome, en puntos. */
const TAIL = 64;
/** Prueba de "una sola línea": recorrido completo, en ms. */
const PROOF_MS = 3600;
const PROOF_HOLD = 700;

const STORY = CHAPTERS.map((c) => `${c.what} (${c.when})`).join(", ");

/**
 * Una sola línea (un solo <path>) que se rehace en loop infinito.
 * Todo corre en un único requestAnimationFrame, sin re-renders de React:
 * los refs escriben directo en el DOM.
 */
export function TrazoLine() {
  const stageRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGPathElement>(null);
  const tailRef = useRef<SVGPathElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const capRef = useRef<HTMLElement>(null);
  const whenRef = useRef<HTMLSpanElement>(null);
  const whatRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const proofRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const svg = svgRef.current;
    const line = lineRef.current;
    const halo = haloRef.current;
    const tail = tailRef.current;
    const pen = penRef.current;
    const cap = capRef.current;
    const whenEl = whenRef.current;
    const whatEl = whatRef.current;
    const countEl = countRef.current;
    const proofBtn = proofRef.current;
    if (!stage || !svg || !line || !halo || !tail || !pen || !cap || !whenEl || !whatEl || !countEl || !proofBtn) {
      return;
    }

    const pts = new Float32Array(N * 2);
    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    const fineMq = matchMedia("(hover: hover) and (pointer: fine)");

    let story = 0; // tiempo de la historia (ms); solo avanza cuando se ve
    let last = -1;
    let raf = 0;
    let onScreen = true;
    let shownCap = 0;
    let staticIdx = 0;
    // puntero (en unidades del viewBox), suavizado
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    let infl = 0;
    let inflTarget = 0;
    // prueba de una sola línea
    let proofT = -1;

    const setCaption = (i: number) => {
      shownCap = i;
      whenEl.textContent = CHAPTERS[i].when;
      whatEl.textContent = CHAPTERS[i].what;
      countEl.textContent = `${pad(i + 1)} / ${pad(COUNT)}`;
    };

    const hidePen = () => {
      pen.style.opacity = "0";
      tail.setAttribute("d", "");
      halo.setAttribute("d", "");
    };

    const placePen = (f: number) => {
      const idx = Math.min(N - 1, Math.max(0, f * (N - 1)));
      const i0 = Math.floor(idx);
      const i1 = Math.min(N - 1, i0 + 1);
      const k = idx - i0;
      const x = pts[i0 * 2] + (pts[i1 * 2] - pts[i0 * 2]) * k;
      const y = pts[i0 * 2 + 1] + (pts[i1 * 2 + 1] - pts[i0 * 2 + 1]) * k;
      const o = edgeFade(x);
      pen.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      pen.style.opacity = o.toFixed(2);
      const from = Math.max(0, i0 - TAIL);
      const d = i0 > from ? toPath(pts, from, i0 + 1) + `L${x.toFixed(1)} ${y.toFixed(1)}` : "";
      tail.setAttribute("d", d);
      halo.setAttribute("d", d);
      tail.style.opacity = halo.style.opacity = o.toFixed(2);
    };

    const drawStatic = (i: number) => {
      line.setAttribute("d", toPath(SHAPES[i]));
      line.style.strokeDasharray = "";
      hidePen();
      setCaption(i);
      cap.dataset.state = "in";
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last < 0 ? 16 : Math.min(64, now - last);
      last = now;

      // ── prueba: la historia se congela y la birome recorre la línea entera
      if (proofT >= 0) proofT += dt;
      else story += dt;
      if (proofT > PROOF_MS + PROOF_HOLD) {
        proofT = -1;
        line.style.strokeDasharray = "";
        proofBtn.removeAttribute("aria-pressed");
        svg.classList.remove("is-proof");
      }

      const k = Math.floor(story / CYCLE);
      const local = story - k * CYCLE;
      const i = k % COUNT;
      const j = (i + 1) % COUNT;
      const p = local < HOLD ? 0 : (local - HOLD) / MORPH;

      const front = morph(pts, SHAPES[i], SHAPES[j], p, i * 1.7);
      breathe(pts, now, 0.55);

      infl += (inflTarget - infl) * 0.08;
      px += (tx - px) * 0.18;
      py += (ty - py) * 0.18;
      if (infl > 0.01) repel(pts, px, py, 18 * infl);

      line.setAttribute("d", toPath(pts));

      if (proofT >= 0) {
        const f = Math.min(1, proofT / PROOF_MS);
        const e = 1 - Math.pow(1 - f, 2);
        line.style.strokeDasharray = `${e.toFixed(4)} 1`;
        placePen(e);
      } else if (p > 0 && p < 1) {
        placePen(front);
      } else {
        hidePen();
      }

      // pie de foto: se va cuando arranca el morph, vuelve con el dibujo nuevo
      if (p > 0 && p < 0.72) {
        if (cap.dataset.state !== "out") cap.dataset.state = "out";
      } else {
        const want = p >= 0.72 ? j : i;
        if (want !== shownCap) setCaption(want);
        if (cap.dataset.state !== "in") cap.dataset.state = "in";
      }
    };

    const running = () => raf !== 0;
    const start = () => {
      if (running()) return;
      last = -1;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (reduceMq.matches) {
        stop();
        drawStatic(staticIdx);
        return;
      }
      if (onScreen && !document.hidden) start();
      else stop();
    };

    // ── interacción
    const onStage = () => {
      if (reduceMq.matches) {
        staticIdx = (staticIdx + 1) % COUNT;
        drawStatic(staticIdx);
        return;
      }
      // si está quieto, arranca ya el morph al siguiente (sin salto: p=0 es el mismo dibujo)
      const k = Math.floor(story / CYCLE);
      if (story - k * CYCLE < HOLD) story = k * CYCLE + HOLD;
    };
    const toLocal = (e: PointerEvent) => {
      const m = svg.getScreenCTM();
      if (!m) return;
      const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      tx = q.x;
      ty = q.y;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fineMq.matches) return;
      toLocal(e);
      if (inflTarget === 0) {
        px = tx;
        py = ty;
      }
      inflTarget = 1;
    };
    const onLeave = () => {
      inflTarget = 0;
    };
    const onProof = () => {
      if (reduceMq.matches || proofT >= 0) return;
      proofT = 0;
      proofBtn.setAttribute("aria-pressed", "true");
      svg.classList.add("is-proof");
    };

    stage.addEventListener("click", onStage);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    proofBtn.addEventListener("click", onProof);
    document.addEventListener("visibilitychange", sync);
    reduceMq.addEventListener("change", sync);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { rootMargin: "80px" },
    );
    io.observe(stage);
    sync();

    console.info(
      "%c——————————~∿~——————————\n%cUn solo <path>, 900 puntos, sin librerías. La birome nunca se levanta.",
      "color:#ff5a36",
      "color:inherit",
    );

    return () => {
      stop();
      io.disconnect();
      stage.removeEventListener("click", onStage);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      proofBtn.removeEventListener("click", onProof);
      document.removeEventListener("visibilitychange", sync);
      reduceMq.removeEventListener("change", sync);
    };
  }, []);

  return (
    <figure className="tz-fig">
      <button ref={stageRef} type="button" className="tz-stage" aria-label="Pasar al siguiente dibujo">
        <svg
          ref={svgRef}
          className="tz-svg"
          viewBox={`0 34 ${VIEW_W} 292`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="tz-ink" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={VIEW_W} y2="0">
              <stop offset="0" style={{ stopColor: "var(--tz-ink)", stopOpacity: 0 }} />
              <stop offset="0.15" style={{ stopColor: "var(--tz-ink)" }} />
              <stop offset="0.85" style={{ stopColor: "var(--tz-ink)" }} />
              <stop offset="1" style={{ stopColor: "var(--tz-ink)", stopOpacity: 0 }} />
            </linearGradient>
            <radialGradient id="tz-glow">
              <stop offset="0" style={{ stopColor: "var(--tz-accent)", stopOpacity: 0.85 }} />
              <stop offset="0.35" style={{ stopColor: "var(--tz-accent)", stopOpacity: 0.28 }} />
              <stop offset="1" style={{ stopColor: "var(--tz-accent)", stopOpacity: 0 }} />
            </radialGradient>
          </defs>
          <path ref={lineRef} className="tz-line" d={toPath(SHAPES[0])} pathLength={1} />
          <path ref={haloRef} className="tz-halo" d="" />
          <path ref={tailRef} className="tz-tail" d="" />
          <g ref={penRef} className="tz-pen" style={{ opacity: 0 }}>
            <circle r="18" fill="url(#tz-glow)" />
            <circle r="2.4" className="tz-pen__core" />
          </g>
        </svg>
      </button>

      <figcaption ref={capRef} className="tz-cap" data-state="in">
        <span className="tz-cap__count" ref={countRef} aria-hidden="true">
          01 / {pad(COUNT)}
        </span>
        <span className="tz-cap__when" ref={whenRef} aria-hidden="true">
          {CHAPTERS[0].when}
        </span>
        <span className="tz-cap__what" ref={whatRef} aria-hidden="true">
          {CHAPTERS[0].what}
        </span>
        <span className="tz-sr">Una sola línea, sin levantar el trazo, dibuja en loop mi historia: {STORY}.</span>
      </figcaption>

      <button ref={proofRef} type="button" className="tz-proof">
        ¿una sola línea?
      </button>
    </figure>
  );
}
