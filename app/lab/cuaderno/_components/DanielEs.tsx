"use client";

import { useState } from "react";

const OPTIONS = [
  "el que te lo explica",
  "de todo un poco",
  "el hermano mayor",
  "un rebuscado",
  "curioso",
  "frontend (también)",
];

/** Regla escondida en el margen: DANIEL ES ___ . Cada toque prueba otra respuesta. */
export function DanielEs() {
  const [i, setI] = useState(-1);
  const [seen, setSeen] = useState(0);
  const done = seen >= OPTIONS.length;

  return (
    <div className="cq-rule" data-who="daniel" data-who-label="D.">
      <span className="cq-rule__lhs">DANIEL ES</span>
      <button
        type="button"
        className="cq-rule__blank"
        onClick={() => {
          setI((v) => (v + 1) % OPTIONS.length);
          setSeen((s) => s + 1);
        }}
        aria-label={i < 0 ? "Completar: Daniel es…" : `Daniel es ${OPTIONS[i]}. Probar otra respuesta`}
      >
        <span key={i} className="cq-rule__ans">
          {i < 0 ? " " : OPTIONS[i]}
        </span>
      </button>
      {done && (
        <span className="cq-stamp" role="status">
          muy bien
          <small>todas correctas</small>
        </span>
      )}
    </div>
  );
}
