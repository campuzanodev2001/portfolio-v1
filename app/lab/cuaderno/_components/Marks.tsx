/** Formas recurrentes del cuaderno: el círculo a mano, el lápiz, el espiral. */

/** Círculo de "respuesta correcta": se pasa de largo y no cierra, como uno real. */
export function Circle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <path
        pathLength={1}
        d="M150 8 C 112 0, 30 2, 10 22 C -6 40, 40 58, 104 56 C 168 54, 202 40, 190 20 C 182 8, 150 3, 118 6"
      />
    </svg>
  );
}

export function Pencil() {
  return (
    <svg className="cq-pencil" viewBox="0 0 24 96" aria-hidden="true">
      <g transform="rotate(32 12 92)">
        <path d="M6 8 h12 v66 l-6 18 l-6 -18 z" fill="#e9c46a" stroke="#34363a" strokeWidth="1.2" />
        <path d="M6 74 h12 l-6 18 z" fill="#efe1c4" stroke="#34363a" strokeWidth="1.2" />
        <path d="M10.2 86.6 L12 92 L13.8 86.6 z" fill="#34363a" />
        <path d="M6 2 h12 v8 h-12 z" fill="#c8a2a0" stroke="#34363a" strokeWidth="1.2" />
        <path d="M12 12 v58" stroke="#c9a54c" strokeWidth="1" />
      </g>
    </svg>
  );
}

/** Espiral de cuaderno: agujeros + anillos, en un patrón que pesa ~400 bytes. */
export function Spiral() {
  return (
    <svg className="cq-spiral" width="100%" height="44" aria-hidden="true">
      <defs>
        <pattern id="cq-ring" width="26" height="44" patternUnits="userSpaceOnUse">
          <ellipse cx="13" cy="30" rx="4" ry="4.4" fill="var(--hole)" />
          <path d="M11 30 C 6 22, 7 6, 14 4 C 19 3, 19 14, 15 30" fill="none" stroke="var(--ring)" strokeWidth="2.2" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="44" fill="url(#cq-ring)" />
    </svg>
  );
}
