"use client";

import { useEffect, useRef, useState } from "react";
import { createPenrose, type PenroseController } from "./engine";

export function PenroseMachine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctrl = useRef<PenroseController | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const c = createPenrose(canvas, {
      reducedMotion: mq.matches,
      pauseTarget: canvas.closest<HTMLElement>(".pz"),
      onBroken: setBroken,
    });
    ctrl.current = c;
    const onMq = () => c.setReducedMotion(mq.matches);
    mq.addEventListener("change", onMq);
    return () => {
      mq.removeEventListener("change", onMq);
      c.destroy();
      ctrl.current = null;
    };
  }, []);

  return (
    <figure className="pz-machine" data-broken={broken || undefined}>
      <canvas
        ref={canvasRef}
        className="pz-canvas"
        role="img"
        aria-label="Escalera imposible de Penrose en isométrica: tres paquetes suben sin parar por frontend, API, agente de IA y base de datos, y vuelven al punto de partida."
      />
      <figcaption className="pz-caption">
        <button type="button" className="pz-how" onClick={() => ctrl.current?.reveal()}>
          ¿Cómo funciona?
        </button>
        <span className="pz-caption__text" aria-live="polite">
          {broken
            ? "No cierra: es una espiral de 18 escalones. Solo desde este ángulo exacto el escalón 19 cae encima del primero."
            : "Sube siempre y vuelve al mismo lugar. Arrastrá para girarla."}
        </span>
      </figcaption>
    </figure>
  );
}
