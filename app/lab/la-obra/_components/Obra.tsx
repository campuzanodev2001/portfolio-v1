"use client";

import { useEffect, useRef } from "react";
import { startObra } from "./engine";
import s from "../obra.module.css";

/**
 * Capa viva del hero: el canvas de la cuadrilla, el cartel de NO MOLESTAR
 * y la región aria-live. Todo lo demás es HTML servido por el server.
 */
export default function Obra() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    return startObra(c);
  }, []);

  return (
    <>
      <canvas ref={ref} className={s.canvas} aria-hidden="true" />
      <div className={s.sign} data-obra="sign" data-show="0" aria-hidden="true">
        <span className={s.signBoard}>
          <b>NO MOLESTAR</b>
          <small>volvemos en un toque</small>
        </span>
      </div>
      <p className={s.sr} data-obra="live" aria-live="polite" />
    </>
  );
}
