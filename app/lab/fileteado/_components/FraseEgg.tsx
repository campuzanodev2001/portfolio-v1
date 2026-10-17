"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { nextFrase } from "./frases";
import styles from "../fileteado.module.css";

/**
 * Easter egg: todo filete lleva la firma del fileteador. Tocá la firma
 * (o escribí "filete" en cualquier parte) y sale una frase en su cinta.
 */
export default function FraseEgg() {
  const [frase, setFrase] = useState<string | null>(null);
  const [n, setN] = useState(0);
  const buffer = useRef("");

  const show = () => {
    setFrase((prev) => nextFrase(prev));
    setN((x) => x + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFrase(null);
        return;
      }
      if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, [contenteditable]")) return;
      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-6);
      if (buffer.current === "filete") {
        buffer.current = "";
        setFrase((prev) => nextFrase(prev));
        setN((x) => x + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button type="button" className={`${styles.firma} ${styles.rise}`} style={{ "--r": 4 } as CSSProperties} onClick={show}>
        fileteó D.C.
      </button>
      <div className={styles.fraseWrap} aria-live="polite">
        {frase && (
          <div className={styles.frase} key={n}>
            <span className={`${styles.fraseTail} ${styles.fraseTailL}`} aria-hidden="true" />
            <span className={`${styles.fraseTail} ${styles.fraseTailR}`} aria-hidden="true" />
            <p className={styles.fraseBand}>
              <span className={styles.fraseText}>{frase}</span>
              <span className={styles.fraseSign}>fileteó D.C.</span>
            </p>
            <button type="button" className={styles.fraseClose} onClick={() => setFrase(null)} aria-label="Cerrar la frase">
              ×
            </button>
          </div>
        )}
      </div>
    </>
  );
}
