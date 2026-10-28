"use client";

import { useEffect } from "react";

/**
 * Comportamiento de toda la página, montado una vez y sin markup propio:
 * - [data-reveal] entra al viewport → data-in (los prompts de sección se tipean).
 * - [data-hop] (cada Clawd chico) → saltito y corazón al tocarlo.
 * - [data-copy] → copia el mail y avisa "Copiado".
 * - Escribir "clawd" → todos los Clawd de la página festejan.
 * Sin JS, todo se ve completo y quieto (el CSS solo oculta con data-js).
 */
export function Enhance() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".cl");
    if (!root) return;
    root.dataset.js = "";

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const onClick = async (ev: MouseEvent) => {
      const target = ev.target as Element;
      const hop = target.closest<HTMLElement>("[data-hop]");
      if (hop && !hop.classList.contains("is-hop")) {
        hop.classList.add("is-hop");
        later(() => hop.classList.remove("is-hop"), 900);
      }
      const copy = target.closest<HTMLButtonElement>("[data-copy]");
      if (copy) {
        const label = copy.querySelector<HTMLElement>("[data-copy-label]");
        try {
          await navigator.clipboard.writeText(copy.dataset.copy ?? "");
          if (label) label.textContent = "Copiado";
        } catch {
          window.location.href = `mailto:${copy.dataset.copy}`;
          return;
        }
        later(() => {
          if (label) label.textContent = "Copiar mail";
        }, 2000);
      }
    };

    let typed = "";
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (ev.key.length !== 1) return;
      typed = (typed + ev.key.toLowerCase()).slice(-5);
      if (typed === "clawd") {
        root.dataset.party = "";
        later(() => delete root.dataset.party, 2400);
      }
    };

    // Scroll: cada [data-scrub] recibe --p (0→1) según cuánto de él pasó por
    // la línea de lectura (data-scrub = fracción del viewport, 0.5 por defecto),
    // o según el recorrido pineado si tiene data-pin. Sus [data-step] que ya
    // cruzaron la línea quedan con data-on, y el último cruzado es data-at.
    // Mientras se scrollea, data-scrolling en la raíz: los Clawd caminan.
    const scrubs = [...root.querySelectorAll<HTMLElement>("[data-scrub]")].map((el) => ({
      el,
      steps: [...el.querySelectorAll<HTMLElement>("[data-step]")],
    }));
    // Scrollspy: el link de la sección que cruzó el 40 % del viewport.
    const spies = [...root.querySelectorAll<HTMLElement>("[data-spy]")]
      .map((a) => ({ a, sec: document.getElementById(a.dataset.spy ?? "") }))
      .filter((x): x is { a: HTMLElement; sec: HTMLElement } => !!x.sec);
    let raf = 0;
    let still = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      let cur: HTMLElement | null = null;
      for (const { a, sec } of spies) if (sec.getBoundingClientRect().top < vh * 0.4) cur = a;
      for (const { a } of spies) {
        if (a === cur) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      }
      for (const { el, steps } of scrubs) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > 2 * vh) continue;
        const line = (Number(el.dataset.scrub) || 0.5) * vh;
        // data-span: recorrido en fracciones del viewport (si no, el alto propio).
        const span = el.dataset.span ? Number(el.dataset.span) * vh : r.height;
        const raw = "pin" in el.dataset ? -r.top / Math.max(1, r.height - vh) : (line - r.top) / span;
        el.style.setProperty("--p", Math.min(1, Math.max(0, raw)).toFixed(4));
        let at = -1;
        steps.forEach((s, i) => {
          const on = s.getBoundingClientRect().top < line;
          if (on !== s.hasAttribute("data-on")) s.toggleAttribute("data-on", on);
          if (on) at = i;
        });
        // data-prev: el estado anterior, para transiciones que dependen del
        // sentido (p. ej. Clawd se despierta al volver a subir).
        if (el.dataset.at !== String(at)) {
          if (el.dataset.at !== undefined) el.dataset.prev = el.dataset.at;
          el.dataset.at = String(at);
          el.style.setProperty("--at", String(at));
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
      if (!("scrolling" in root.dataset)) root.dataset.scrolling = "";
      clearTimeout(still);
      still = window.setTimeout(() => delete root.dataset.scrolling, 160);
    };
    update();

    root.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    console.info("%c▚ Clawd", "color:#d97757;font-weight:bold", "— escribí «clawd» en cualquier parte de la página.");

    return () => {
      io.disconnect();
      root.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(still);
      timers.forEach(clearTimeout);
    };
  }, []);

  return null;
}
