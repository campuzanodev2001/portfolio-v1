"use client";

import { useEffect, useRef } from "react";
import { H, STILL_T, T, W, WAKE, beatAt, createScene, promptAt, wakePromptAt, type DrawOpts } from "./engine";

/**
 * Isla cliente: un <canvas> de 128×84 escalado por un entero (pixel art nítido),
 * un único requestAnimationFrame y el prompt de Daniel como texto del DOM.
 * Se pausa con la pestaña oculta o el hero fuera de pantalla; con
 * prefers-reduced-motion dibuja un solo frame quieto.
 *
 * Loader: si el script inline de page.tsx marcó `.cl[data-intro]` (cada carga,
 * salvo reduced motion), antes del loop corre el despertar de Clawd (WAKE s).
 * Termina en el frame 0, así que el loop sigue sin corte. Tap o tecla: salta.
 */
export function ClawdStage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const promptEl = promptRef.current;
    const btn = btnRef.current;
    if (!wrap || !canvas || !promptEl || !btn) return;
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
    const opts: DrawOpts = { point: null, react: 99 };
    const root = wrap.closest<HTMLElement>(".cl");
    // < 0: sin despertar (ya se vio, reduced motion o sin el script).
    let wake = root && "intro" in root.dataset && !reduced ? 0 : -1;

    const endWake = (skipped: boolean) => {
      if (wake < 0) return;
      wake = -1;
      t = 0;
      if (root && skipped) root.dataset.introSkip = "";
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
    function skip() {
      endWake(true);
      if (!raf) frame(0, performance.now());
    }

    const frame = (tt: number, now: number) => {
      opts.react = stillReact ?? (now - reactAt) / 1000;
      const waking = wake >= 0;
      scene.draw(g, tt, opts, waking ? wake : undefined);
      const p = reduced ? "armá el hero  ✓" : waking ? wakePromptAt(wake) : promptAt(tt);
      if (p !== lastPrompt) {
        promptEl.textContent = p;
        lastPrompt = p;
      }
      const b = reduced || waking ? "" : beatAt(tt);
      if (hero && b !== lastBeat) {
        hero.dataset.beat = b;
        lastBeat = b;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); // tras una pausa no salta
      last = now;
      if (wake >= 0) {
        wake += dt;
        if (wake >= WAKE) endWake(false);
      } else {
        t = (t + dt) % T;
      }
      frame(t, now);
      raf = requestAnimationFrame(loop);
    };

    const sync = () => {
      const run = !reduced && visible && onscreen;
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
    if (wake >= 0) {
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
    }
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
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      cta?.removeEventListener("pointerenter", aim);
      cta?.removeEventListener("pointerleave", unaim);
      cta?.removeEventListener("focus", aim);
      cta?.removeEventListener("blur", unaim);
      if (hero) delete hero.dataset.beat;
    };
  }, []);

  return (
    <figure className="cl-stage">
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
