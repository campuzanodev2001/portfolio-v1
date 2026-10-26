"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Lamina } from "./Lamina";
import { PERIOD_MS, PLATES, START_PHASE, frameAt } from "./timeline";

const RM = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const m = matchMedia(RM);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
const getRM = () => matchMedia(RM).matches;
const getRMServer = () => false;

const mod1 = (x: number) => ((x % 1) + 1) % 1;

interface Ctl {
  setPlaying(v: boolean): void;
  setTilt(v: boolean): void;
}

/**
 * Reloj del despiece. Un solo rAF escribe ~12 custom properties en la figura;
 * todos los niveles del Droste las heredan. Se detiene con la pestaña oculta,
 * con la figura fuera de pantalla, en pausa, o cuando no hay nada que mover.
 */
export function Despiece() {
  const figRef = useRef<HTMLElement>(null);
  const ctl = useRef<Ctl | null>(null);
  const reduced = useSyncExternalStore(subscribeRM, getRM, getRMServer);
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduced;

  useEffect(() => {
    const fig = figRef.current;
    const stage = fig?.querySelector<HTMLElement>(".dz-stage");
    if (!fig || !stage) return;
    const st = fig.style;

    let p = START_PHASE;
    let playingNow = false;
    let tiltOn = false;
    let docVisible = !document.hidden;
    let inView = true;
    let hold = false;
    let drag: { x: number; p0: number; w: number; id: number } | null = null;
    let lastE = 1;
    let raf = 0;
    let last = 0;
    let dirty = true;
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

    const apply = () => {
      const f = frameAt(p);
      st.setProperty("--rot", f.rot.toFixed(4));
      st.setProperty("--e", f.e.toFixed(4));
      st.setProperty("--zs", f.zs.toFixed(5));
      for (let i = 0; i < PLATES; i++) st.setProperty(`--h${i}`, f.h[i].toFixed(3));
      st.setProperty("--tx", `${tilt.x.toFixed(2)}deg`);
      st.setProperty("--ty", `${tilt.y.toFixed(2)}deg`);
      lastE = f.e;
    };

    const loop = (now: number) => {
      raf = 0;
      if (!docVisible || !inView) return;
      const dt = Math.min(now - last, 64);
      last = now;
      const advancing = playingNow && !hold && !drag;
      if (advancing) p = mod1(p + dt / PERIOD_MS);
      const k = 1 - Math.exp(-dt / 160);
      tilt.x += (tilt.tx - tilt.x) * k;
      tilt.y += (tilt.ty - tilt.y) * k;
      const tilting = Math.abs(tilt.tx - tilt.x) + Math.abs(tilt.ty - tilt.y) > 0.02;
      if (advancing || tilting || dirty) {
        apply();
        dirty = false;
      }
      if (advancing || tilting) raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    // --- pausas automáticas
    const onVis = () => {
      docVisible = !document.hidden;
      kick();
    };
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      kick();
    });
    io.observe(stage);

    // --- puntero: inclinar, aislar capa, arrastrar para recorrer el tiempo
    const onMove = (ev: PointerEvent) => {
      if (drag && ev.pointerId === drag.id) {
        p = mod1(drag.p0 - ((ev.clientX - drag.x) / drag.w) * 0.5);
        dirty = true;
        kick();
        return;
      }
      if (ev.pointerType !== "mouse" || !tiltOn) return;
      const r = stage.getBoundingClientRect();
      tilt.tx = ((ev.clientX - r.left) / r.width - 0.5) * 18;
      tilt.ty = -((ev.clientY - r.top) / r.height - 0.5) * 12;
      kick();
    };
    const onLeave = () => {
      tilt.tx = 0;
      tilt.ty = 0;
      hold = false;
      kick();
    };
    const onOver = (ev: PointerEvent) => {
      if (ev.pointerType !== "mouse") return;
      // Los niveles internos no reciben puntero: cualquier capa bajo el cursor es del nivel 1.
      // Solo congela si está despiezado (de frente, pasar el mouse no debe frenar el loop).
      hold = lastE > 0.6 && Boolean((ev.target as Element).closest?.("[data-plate]"));
      kick();
    };
    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      drag = { x: ev.clientX, p0: p, w: stage.getBoundingClientRect().width, id: ev.pointerId };
      stage.setPointerCapture(ev.pointerId);
    };
    const onUp = (ev: PointerEvent) => {
      if (!drag || ev.pointerId !== drag.id) return;
      drag = null;
      kick();
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointerover", onOver);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    ctl.current = {
      setPlaying(v) {
        playingNow = v;
        kick();
      },
      setTilt(v) {
        tiltOn = v;
        if (!v) {
          tilt.tx = 0;
          tilt.ty = 0;
        }
        kick();
      },
    };
    apply();

    console.info(
      "%cDespiece%c La pantalla muestra la lámina que la contiene. Escala 1:2,5 — hoja 1/∞.",
      "font-weight:600",
      "",
    );

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerover", onOver);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      ctl.current = null;
    };
  }, []);

  useEffect(() => {
    ctl.current?.setPlaying(playing);
  }, [playing]);

  useEffect(() => {
    ctl.current?.setTilt(!reduced);
  }, [reduced]);

  return (
    <figure className="dz-fig" ref={figRef}>
      <div
        className="dz-fig__stage"
        role="img"
        aria-label="Animación: un teléfono que muestra esta misma lámina se despieza en capas — interfaz, componentes, lógica, red, datos, silicio y bits — y vuelve a armarse. Después la cámara entra en su pantalla y el ciclo empieza de nuevo."
      >
        <Lamina level={1} />
      </div>
      <figcaption className="dz-cap">
        <span>
          Fig. 1 — La pantalla muestra esta misma lámina.{" "}
          <span className="dz-cap__hint">Arrastrá para recorrer el despiece; pasá el cursor por una capa para aislarla.</span>
        </span>
        <button type="button" className="dz-btn" aria-pressed={!playing} onClick={() => setChoice(!playing)}>
          {playing ? "Pausar" : "Reproducir"}
        </button>
      </figcaption>
    </figure>
  );
}
