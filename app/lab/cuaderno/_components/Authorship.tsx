"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Easter egg de autoría honesta: marca qué escribió Daniel (D.) y qué Claude (C.).
 * Disparadores: el botón del encabezado o la tecla "?".
 */
export function Authorship() {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".cq");
    if (!root) return;
    if (on) root.dataset.authorship = "on";
    else delete root.dataset.authorship;
  }, [on]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key === "?") setOn((v) => !v);
      else if (e.key === "Escape") setOn(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className="cq-who-btn"
      aria-pressed={on}
      aria-controls="cq-authors"
      onClick={() => setOn((v) => !v)}
    >
      ¿quién escribió qué?
    </button>
  );
}
