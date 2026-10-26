"use client";

import { useEffect, useRef, useState } from "react";
import type { Engine } from "./engine";

/**
 * Canvas a sangre (detrás de todo el hero) + el "escenario" que reserva lugar
 * en el layout. El motor lee la caja del escenario para saber dónde dibujar la
 * grilla de 40×22 celdas; el CSS decide el layout, el motor solo lo sigue.
 */
export function TokenField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !stage || !host) return;
    let cancelled = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // el motor va en un chunk aparte: el HTML del hero pinta sin esperarlo
    import("./engine").then(({ createEngine }) => {
      if (cancelled) return;
      engineRef.current = createEngine(canvas, stage, host, reduced);
    });
    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    engineRef.current?.setPaused(next);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="tk-canvas"
        role="img"
        aria-label="Animación en bucle: un prompt se escribe, se parte en tokens, se convierte en una interfaz y la interfaz vuelve a ser código."
      />
      <div ref={stageRef} className="tk-stage">
        <button
          type="button"
          className="tk-pause"
          aria-pressed={paused}
          aria-label={paused ? "Reanudar animación" : "Pausar animación"}
          onClick={toggle}
        >
          {paused ? "▶ seguir" : "❚❚ pausa"}
        </button>
      </div>
    </>
  );
}
