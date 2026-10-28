"use client";

import { useEffect, useRef } from "react";
import { H, STILL_T, T, W, beatAt, createScene, logAt, promptAt, type DrawOpts } from "./engine";

/**
 * Isla cliente: un <canvas> de 128×84 escalado por un entero (pixel art nítido),
 * un único requestAnimationFrame y el prompt de Daniel como texto del DOM.
 * Se pausa con la pestaña oculta o el hero fuera de pantalla; con
 * prefers-reduced-motion dibuja un solo frame quieto.
 *
 * Si corre la intro (`.cl[data-intro]`), el loop espera quieto en el frame 0
 * hasta que la intro avisa con el evento "clawd:ready".
 */
export function ClawdStage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const promptEl = promptRef.current;
    const btn = btnRef.current;
    const logEl = logRef.current;
    if (!wrap || !canvas || !promptEl || !btn || !logEl) return;
    const logRows = [...logEl.children] as HTMLElement[];
    const g = canvas.getContext("2d", { alpha: false });
    if (!g) return;

    const scene = createScene();
    const hero = wrap.closest<HTMLElement>("[data-clawd-hero]");
    const cta = hero?.querySelector<HTMLElement>("[data-clawd-point]") ?? null;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");

    let reduced = mq.matches;
    let visible = !document.hidden;
    let onscreen = true;
    let t = 0;
    let last = 0;
    let raf = 0;
    let reactAt = -1e9;
    let stillReact: number | null = null;
    let lastPrompt = "";
    let lastBeat = "";
    let lastLog = "";
    const opts: DrawOpts = { point: null, react: 99 };
    const root = wrap.closest<HTMLElement>(".cl");
    // La intro de página completa arma el hero; el loop arranca cuando termina.
    let held = !!root && "intro" in root.dataset && !("introDone" in root.dataset) && !reduced;
    const release = () => {
      held = false;
      t = 0;
      sync();
    };

    const frame = (tt: number, now: number) => {
      opts.react = stillReact ?? (now - reactAt) / 1000;
      scene.draw(g, tt, opts);
      const p = reduced ? "armá el hero  ✓" : held ? "" : promptAt(tt);
      if (p !== lastPrompt) {
        promptEl.textContent = p;
        lastPrompt = p;
      }
      const lines = held ? [] : logAt(reduced ? 15 : tt);
      const key = lines.map((l) => l.kind + l.text + l.live).join("|");
      if (key !== lastLog) {
        lastLog = key;
        logRows.forEach((row, i) => {
          const l = lines[i];
          row.textContent = l ? l.text : "";
          row.className = l ? `cl-log__${l.kind}${l.live ? " is-live" : ""}` : "";
        });
      }
      const b = reduced || held ? "" : beatAt(tt);
      if (hero && b !== lastBeat) {
        hero.dataset.beat = b;
        lastBeat = b;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); // tras una pausa no salta
      last = now;
      t = (t + dt) % T;
      frame(t, now);
      raf = requestAnimationFrame(loop);
    };

    const sync = () => {
      const run = !reduced && !held && visible && onscreen;
      if (run && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (reduced) frame(STILL_T, performance.now());
    };

    // Escala entera: 1 px lógico = k px de pantalla, sin bordes borrosos.
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const avail = wrap.clientWidth;
      const k = Math.max(1, Math.floor((avail * dpr) / W));
      const cssW = Math.min(avail, (k * W) / dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${(cssW * H) / W}px`;
    };

    const aim = () => {
      if (!cta) return;
      const c = canvas.getBoundingClientRect();
      const r = cta.getBoundingClientRect();
      const cx = c.left + c.width / 2;
      const bx = r.left + r.width / 2;
      const dx = Math.abs(bx - cx) < c.width * 0.3 ? 0 : Math.sign(bx - cx);
      const dy = r.top > c.bottom ? 1 : r.bottom < c.top ? -1 : 0;
      opts.point = { dx, dy };
      if (!raf) frame(reduced ? STILL_T : t, performance.now());
    };
    const unaim = () => {
      opts.point = null;
      if (!raf) frame(reduced ? STILL_T : t, performance.now());
    };

    let stillTimer = 0;
    const poke = () => {
      reactAt = performance.now();
      if (raf) return;
      // Sin movimiento: corazón y ojos felices, quietos, durante un segundo.
      stillReact = 0.7;
      frame(reduced ? STILL_T : t, performance.now());
      window.clearTimeout(stillTimer);
      stillTimer = window.setTimeout(() => {
        stillReact = null;
        reactAt = -1e9;
        frame(reduced ? STILL_T : t, performance.now());
      }, 1000);
    };

    const onVis = () => {
      visible = !document.hidden;
      sync();
    };
    const onMq = () => {
      reduced = mq.matches;
      sync();
    };
    const io = new IntersectionObserver(([e]) => {
      onscreen = e.isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(fit);

    fit();
    frame(reduced ? STILL_T : 0, performance.now());
    io.observe(wrap);
    ro.observe(wrap);
    document.addEventListener("visibilitychange", onVis);
    mq.addEventListener("change", onMq);
    btn.addEventListener("click", poke);
    window.addEventListener("clawd:ready", release);
    cta?.addEventListener("pointerenter", aim);
    cta?.addEventListener("pointerleave", unaim);
    cta?.addEventListener("focus", aim);
    cta?.addEventListener("blur", unaim);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(stillTimer);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener("change", onMq);
      btn.removeEventListener("click", poke);
      window.removeEventListener("clawd:ready", release);
      cta?.removeEventListener("pointerenter", aim);
      cta?.removeEventListener("pointerleave", unaim);
      cta?.removeEventListener("focus", aim);
      cta?.removeEventListener("blur", unaim);
      if (hero) delete hero.dataset.beat;
    };
  }, []);

  return (
    <figure className="cl-stage" data-build="stage">
      <div className="cl-stage__screen" ref={wrapRef}>
        <button ref={btnRef} type="button" className="cl-stage__btn" aria-label="Saludar a Clawd">
          <canvas ref={canvasRef} width={W} height={H} className="cl-stage__canvas" aria-hidden="true" />
        </button>
      </div>
      <p className="cl-prompt" aria-hidden="true">
        <span className="cl-prompt__who">daniel</span>
        <span className="cl-prompt__sep">›</span>
        <span ref={promptRef} className="cl-prompt__text" />
        <span className="cl-prompt__caret" />
      </p>
      {/* Lo que responde Clawd: tres renglones fijos (sin saltos de layout). */}
      <ol ref={logRef} className="cl-log" aria-hidden="true">
        <li />
        <li />
        <li />
      </ol>
      <figcaption className="cl-stage__cap">
        <span className="cl-sr">
          Animación en loop: Clawd, un personaje de píxeles, arma una versión en miniatura de esta
          portada siguiendo las indicaciones de Daniel; algo se desacomoda, lo arregla y la publica.
        </span>
        <span aria-hidden="true">Clawd · homenaje de fan a la mascota de Claude Code</span>
      </figcaption>
    </figure>
  );
}
