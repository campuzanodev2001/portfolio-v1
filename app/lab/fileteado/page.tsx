import type { CSSProperties } from "react";
import { hashStr } from "./_components/geometry";
import { BOOT_SCRIPT } from "./_components/boot";
import Ornaments from "./_components/Ornaments";
import Frame from "./_components/Frame";
import NameLettering from "./_components/NameLettering";
import Ribbon from "./_components/Ribbon";
import IntroController from "./_components/IntroController";
import BaClock from "./_components/BaClock";
import FraseEgg from "./_components/FraseEgg";
import Guarda from "./_components/Guarda";
import styles from "./fileteado.module.css";

// Un ornamento por día: la página se regenera cada hora y la semilla es la fecha porteña.
export const revalidate = 3600;

const TZ = "America/Argentina/Buenos_Aires";
const r = (n: number) => ({ "--r": n }) as CSSProperties;

export default function FileteadoPage() {
  const now = new Date();
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
  const dayLabel = new Intl.DateTimeFormat("es-AR", { timeZone: TZ, day: "numeric", month: "long" }).format(now);
  const seed = hashStr(`filete:${day}`);

  return (
    <main className={styles.root}>
      <section className={styles.hero} data-fil-hero="" aria-labelledby="fil-nombre" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <Frame />

        <div className={styles.content}>
          <h1 id="fil-nombre" className={styles.name}>
            <span className={styles.srOnly}>Daniel Campuzano</span>
            <NameLettering />
          </h1>
          <p className={styles.ribbonWrap}>
            <span className={styles.srOnly}>Frontend Engineer</span>
            <Ribbon text="FRONTEND ENGINEER" />
          </p>
          <p className={`${styles.statement} ${styles.rise}`} style={r(0)}>
            Hace más de cinco años que armo interfaces con React, Next.js y TypeScript: rápidas, prolijas y
            sin rebarbas.
          </p>
          <ul className={`${styles.links} ${styles.rise}`} style={r(1)}>
            <li>
              <a href="mailto:danicampu56@gmail.com">Escribime</a>
            </li>
            <li aria-hidden="true" className={styles.sep}>
              <svg viewBox="-12 -20 24 40" focusable="false">
                <use href="#fil-gem-side" />
              </svg>
            </li>
            <li>
              <a href="https://github.com/TioDanx" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li aria-hidden="true" className={styles.sep}>
              <svg viewBox="-12 -20 24 40" focusable="false">
                <use href="#fil-gem-side" />
              </svg>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/daniel-campuzano-7149552b7"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
          </ul>
          <p className={`${styles.clock} ${styles.rise}`} style={r(2)}>
            <BaClock />
          </p>
          <FraseEgg />
        </div>

        {/* después del contenido: así el foco pasa primero por los links */}
        <Ornaments seed={seed} />
        <IntroController />
      </section>

      <section className={styles.stub} aria-labelledby="fil-sigue">
        <Guarda />
        <h2 id="fil-sigue" className={styles.stubTitle}>
          Lo que sigue
        </h2>
        <p className={styles.stubText}>
          Acá van los trabajos, cada uno con su guarda: NZ Automotores, The Box, Portal Store, Tom Martorello,
          Tailor AI, Nuestros Planes y Moreno Herramientas, que todavía está en obra.
        </p>
        <p className={styles.stubNote}>
          Los ornamentos no son imágenes: los dibuja el código, con curvas que enroscan cada vez más y espejadas
          como manda el oficio. Cambian todos los días; estos son los del {dayLabel}.
        </p>
        <Guarda flip />
      </section>
    </main>
  );
}
