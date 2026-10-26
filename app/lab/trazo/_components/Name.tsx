import type { CSSProperties } from "react";

const WORDS = ["Daniel", "Campuzano"] as const;

/**
 * El nombre es texto real (lo lee el lector de pantalla de una vez); la
 * versión visible está partida en letras para una ola lentísima: cada letra
 * sube apenas y se aclara un poco, desfasada de la anterior. Solo transform +
 * opacity → corre en el compositor.
 */
export function Name() {
  return (
    <h1 className="tz-name" id="tz-name">
      <span className="tz-sr">Daniel Campuzano</span>
      <span className="tz-name__vis" aria-hidden="true">
        {WORDS.map((w, wi) => (
          <span key={w} className={`tz-word tz-word--${wi}`}>
            {Array.from(w).map((ch, ci) => (
              <span key={ci} className="tz-ch" style={{ "--i": wi * WORDS[0].length + ci } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        ))}
      </span>
    </h1>
  );
}
