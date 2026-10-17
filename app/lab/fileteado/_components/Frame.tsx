import styles from "../fileteado.module.css";

/**
 * Marco: doble filete (crema + bermellón) que sale de cada esquinero y se
 * cierra en el centro de cada lado, donde lo remata un rombo.
 * Las piezas <use> apuntan a los <defs> que dibuja <Ornaments/>.
 */
export default function Frame() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <span className={`${styles.line} ${styles.lineH} ${styles.topL}`} />
      <span className={`${styles.line} ${styles.lineH} ${styles.topR}`} />
      <span className={`${styles.line} ${styles.lineH} ${styles.botL}`} />
      <span className={`${styles.line} ${styles.lineH} ${styles.botR}`} />
      <span className={`${styles.line} ${styles.lineV} ${styles.leftT}`} />
      <span className={`${styles.line} ${styles.lineV} ${styles.leftB}`} />
      <span className={`${styles.line} ${styles.lineV} ${styles.rightT}`} />
      <span className={`${styles.line} ${styles.lineV} ${styles.rightB}`} />

      <span className={`${styles.crest} ${styles.crestTop}`}>
        <svg className={styles.pop} viewBox="0 0 120 48" focusable="false">
          <use href="#fil-unit" />
        </svg>
      </span>
      <span className={`${styles.crest} ${styles.crestBottom}`}>
        <svg className={styles.pop} viewBox="0 0 120 48" focusable="false">
          <use href="#fil-unit" transform="matrix(1 0 0 -1 0 48)" />
        </svg>
      </span>
      <span className={`${styles.sideGem} ${styles.sideL}`}>
        <svg className={styles.pop} viewBox="-12 -20 24 40" focusable="false">
          <use href="#fil-gem-side" />
        </svg>
      </span>
      <span className={`${styles.sideGem} ${styles.sideR}`}>
        <svg className={styles.pop} viewBox="-12 -20 24 40" focusable="false">
          <use href="#fil-gem-side" />
        </svg>
      </span>
    </div>
  );
}
