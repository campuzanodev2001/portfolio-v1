"use client";

import { useState } from "react";

/**
 * La goma: "Frontend Engineer" está escrito encima de una versión anterior.
 * Al borrar aparece lo que había abajo (y siempre se nota un poco, como en el papel).
 */
export function Eraser() {
  const [erased, setErased] = useState(false);
  const [rub, setRub] = useState(0);

  return (
    <p className="cq-role" data-erased={erased || undefined}>
      <span className="cq-role__stack">
        <span className="cq-role__old">
          hermano mayor, arreglador oficial
        </span>
        <span className="cq-role__now">Frontend Engineer</span>
      </span>
      <button
        type="button"
        className="cq-eraser"
        aria-pressed={erased}
        aria-label={erased ? "Volver a escribir “Frontend Engineer”" : "Borrar y ver la versión anterior"}
        onClick={() => {
          setErased((v) => !v);
          setRub((n) => n + 1);
        }}
      >
        <svg key={rub} className={rub ? "is-rubbing" : undefined} viewBox="0 0 44 22" aria-hidden="true">
          <g transform="rotate(-12 22 11)">
            <rect x="4" y="5" width="36" height="13" rx="2.5" fill="var(--paper)" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4 7.5 h15 v8 h-15" fill="#c9817a" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M19 5 v13" stroke="currentColor" strokeWidth="1" />
          </g>
        </svg>
      </button>
      <span className="cq-sr" aria-live="polite">
        {erased ? "Versión anterior: hermano mayor, arreglador oficial." : ""}
      </span>
    </p>
  );
}
