import styles from "../fileteado.module.css";

const UNITS = Array.from({ length: 13 }, (_, i) => -780 + i * 120);

/**
 * Guarda: el borde de sección. Doble filete arriba y abajo y, en el medio,
 * la unidad generada (rombo + volutas espejadas) repetida. Se pinta de
 * izquierda a derecha al entrar en pantalla (CSS scroll-driven, sin JS).
 */
export default function Guarda({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`${styles.guarda} ${flip ? styles.guardaFlip : ""}`} aria-hidden="true">
      <svg className={styles.guardaSvg} viewBox="-720 0 1440 48" preserveAspectRatio="xMidYMid slice" focusable="false">
        <rect x="-780" y="5" width="1560" height="1.5" fill="#fff1d2" />
        <rect x="-780" y="9.5" width="1560" height="1" fill="#c9322a" />
        <rect x="-780" y="37.5" width="1560" height="1" fill="#c9322a" />
        <rect x="-780" y="41.5" width="1560" height="1.5" fill="#fff1d2" />
        {UNITS.map((x) => (
          <use key={x} href="#fil-unit" x={x} />
        ))}
        {UNITS.map((x) => (
          <circle key={x} cx={x} cy="24" r="2.2" fill="#fff1d2" />
        ))}
      </svg>
    </div>
  );
}
