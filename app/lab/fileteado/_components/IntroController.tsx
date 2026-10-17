"use client";

import { useEffect, useRef } from "react";
import { BOOT_KEY } from "./boot";

/**
 * La intro es CSS puro (arranca sin esperar a JS). Este componente solo:
 *  - la saltea con cualquier click/tap/tecla,
 *  - marca la sesión cuando termina o se saltea,
 *  - en desktop, mueve el brillo de la laca siguiendo al puntero.
 */
let hinted = false;

export default function IntroController() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = ref.current?.closest<HTMLElement>("[data-fil-hero]");
    if (!hero) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(BOOT_KEY) === "1";
    } catch {}

    const cleanups: (() => void)[] = [];

    if (!hinted) {
      hinted = true;
      console.info(
        "%c¿Leés la consola? Escribí «filete» en la página.  — fileteó D.C.",
        "font: 600 14px serif; color: #e0a02e; background: #0c0a09; padding: 6px 10px;",
      );
    }

    if (seen) {
      // navegación del lado del cliente: el script en línea no corrió
      if (!hero.dataset.state) hero.dataset.state = "calm";
    } else if (hero.dataset.state !== "done") {
      let over = false;
      const finish = () => {
        if (over) return;
        over = true;
        hero.dataset.state = "done";
        try {
          sessionStorage.setItem(BOOT_KEY, "1");
        } catch {}
        off();
      };
      const off = () => {
        window.removeEventListener("pointerdown", finish);
        window.removeEventListener("keydown", finish);
        window.clearTimeout(timer);
      };
      window.addEventListener("pointerdown", finish);
      window.addEventListener("keydown", finish);
      // la intro dura ~1.45s; si JS llegó tarde, las animaciones ya terminaron
      const running = hero.getAnimations?.({ subtree: true }) ?? [];
      const timer = window.setTimeout(finish, running.length ? 1900 : 0);
      Promise.all(running.map((a) => a.finished)).then(finish, () => {});
      cleanups.push(off);
    }

    // brillo de laca: solo con puntero fino y sin reduced-motion
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const name = hero.querySelector<SVGSVGElement>("[data-fil-name]");
    if (fine && !calm && name) {
      let raf = 0;
      const move = (e: PointerEvent) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = name.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          const near = x > -0.15 && x < 1.15 && y > -0.6 && y < 1.6;
          hero.style.setProperty("--sx", x.toFixed(3));
          if (near) hero.dataset.sheen = "";
          else delete hero.dataset.sheen;
        });
      };
      const leave = () => delete hero.dataset.sheen;
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        hero.removeEventListener("pointermove", move);
        hero.removeEventListener("pointerleave", leave);
      });
    }

    return () => cleanups.forEach((c) => c());
  }, []);

  return <span ref={ref} hidden />;
}
