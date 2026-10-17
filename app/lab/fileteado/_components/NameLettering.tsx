import type { CSSProperties, SVGProps } from "react";
import styles from "../fileteado.module.css";

/*
 * Letra fileteada en capas, como se pinta a mano:
 *   1. sombra proyectada (bordó, corrida abajo a la derecha)
 *   2. contorno crema  ← es el trazo que se "pinta" letra por letra en la intro
 *   3. calle negra que separa contorno y letra
 *   4. relleno partido en dos tonos (truco de letrista: luz arriba, sombra abajo)
 *   5. filete de luz interior arriba-izquierda (+ brillo que sigue al puntero)
 * El texto real del <h1> va aparte, para lectores de pantalla.
 */

const LINES = [
  { text: "Daniel", y: 76, size: 74, cls: styles.gotica, fill: "url(#fil-celeste)", from: 0 },
  { text: "Campuzano", y: 196, size: 92, cls: styles.romana, fill: "url(#fil-gold)", from: 6 },
] as const;

function Lines({ trace = false, ...props }: SVGProps<SVGTextElement> & { trace?: boolean }) {
  return (
    <>
      {LINES.map((l) => (
        <text
          key={l.text}
          x="320"
          y={l.y}
          fontSize={l.size}
          textAnchor="middle"
          className={l.cls}
          {...props}
        >
          {trace
            ? [...l.text].map((ch, i) => (
                <tspan
                  key={i}
                  className={styles.trace}
                  style={{ "--i": l.from + i } as CSSProperties}
                >
                  {ch}
                </tspan>
              ))
            : l.text}
        </text>
      ))}
    </>
  );
}

export default function NameLettering() {
  return (
    <svg
      className={styles.nameSvg}
      viewBox="0 0 640 232"
      aria-hidden="true"
      focusable="false"
      data-fil-name=""
    >
      <defs>
        <linearGradient id="fil-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe6a3" />
          <stop offset="0.5" stopColor="#f2b440" />
          <stop offset="0.5" stopColor="#d9861d" />
          <stop offset="1" stopColor="#a8541a" />
        </linearGradient>
        <linearGradient id="fil-celeste" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4f4ff" />
          <stop offset="0.52" stopColor="#9fd2f5" />
          <stop offset="0.52" stopColor="#57a4dc" />
          <stop offset="1" stopColor="#2a6ea6" />
        </linearGradient>
        <linearGradient id="fil-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="fil-name-clip">
          <Lines />
        </clipPath>
        <mask id="fil-name-paint" maskUnits="userSpaceOnUse" x="-40" y="-20" width="720" height="280">
          <rect className={styles.paint} x="-40" y="-20" width="720" height="280" fill="#fff" />
        </mask>
      </defs>

      <g className={styles.nameShadow}>
        <g transform="translate(5 6)" fill="#4d0f0a" stroke="#4d0f0a" strokeWidth="9" strokeLinejoin="round">
          <Lines />
        </g>
      </g>

      {/* firuletes del nombre de pila: filete fino rematado en rombo */}
      <g className={styles.flourish} fill="none" stroke="#fff1d2" strokeWidth="1.6" strokeLinecap="round">
        <path pathLength={1} d="M204 50 C184 50 172 44 150 44 S122 52 113 50" />
        <path pathLength={1} d="M436 50 C456 50 468 44 490 44 S518 52 527 50" />
      </g>
      <g className={styles.flourishGem} fill="#c9322a" stroke="#fff1d2" strokeWidth="1.2">
        <path d="M104 50 l8 -6 l8 6 l-8 6 z" />
        <path d="M520 50 l8 -6 l8 6 l-8 6 z" />
      </g>

      <g fill="none" stroke="#fff1d2" strokeWidth="8" strokeLinejoin="round">
        <Lines trace />
      </g>

      <g mask="url(#fil-name-paint)">
        <g fill="none" stroke="#0c0a09" strokeWidth="4.6" strokeLinejoin="round">
          <Lines />
        </g>
        <g>
          {LINES.map((l) => (
            <text key={l.text} x="320" y={l.y} fontSize={l.size} textAnchor="middle" className={l.cls} fill={l.fill}>
              {l.text}
            </text>
          ))}
        </g>
        <g clipPath="url(#fil-name-clip)">
          <g transform="translate(1.6 1.9)" fill="none" stroke="#fff8e6" strokeWidth="1.5" opacity="0.9">
            <Lines />
          </g>
          <rect className={styles.sheen} x="-110" y="0" width="220" height="232" fill="url(#fil-sheen)" />
        </g>
      </g>
    </svg>
  );
}
