"use client";

import { useState } from "react";

/** "dejame leer": apaga el juego y muestra el contenido plano. Siempre visible. */
export default function ReadToggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className="rg-read"
      aria-pressed={on}
      onClick={() => {
        const next = !on;
        setOn(next);
        const root = document.getElementById("reglas");
        if (root) root.dataset.read = next ? "1" : "0";
        const target = document.getElementById(next ? "rg-plain-h" : "rg-name");
        target?.focus({ preventScroll: false });
        if (next) window.scrollTo({ top: 0 });
      }}
    >
      {on ? "volver a jugar" : "dejame leer"}
    </button>
  );
}
