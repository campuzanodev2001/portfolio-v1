import styles from "../fileteado.module.css";

/**
 * Banderín celeste y blanco con colas en cola de golondrina, arqueado como
 * las cintas de los letreros. El texto va sobre un textPath.
 */
export default function Ribbon({ text }: { text: string }) {
  const tail = (
    <>
      <path d="M74 40 L14 42 L32 60 L14 78 L74 74 Z" fill="#2c6a9c" stroke="#fff1d2" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M74 66 L74 74 L60 68 Z" fill="#163a58" />
    </>
  );
  return (
    <svg className={styles.ribbon} viewBox="0 0 440 92" aria-hidden="true" focusable="false">
      <defs>
        <path id="fil-ribbon-arc" d="M84 57 Q220 35 356 57" />
      </defs>
      {tail}
      <g transform="matrix(-1 0 0 1 440 0)">{tail}</g>
      <path d="M70 32 Q220 10 370 32 L370 68 Q220 46 70 68 Z" fill="#57a4dc" stroke="#fff1d2" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M70 40 Q220 18 370 40 L370 60 Q220 38 70 60 Z" fill="#fbf6ea" />
      <text className={styles.ribbonText} fontSize="17" fill="#13233f" letterSpacing="3.2" textAnchor="middle">
        <textPath href="#fil-ribbon-arc" startOffset="50%">
          {text}
        </textPath>
      </text>
    </svg>
  );
}
