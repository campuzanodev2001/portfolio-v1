/**
 * Page-wide print-shop behaviour (Fanzine's gags, rewired):
 *  - the paper accepts rubber stamps (click anywhere that isn't a control);
 *  - 7 stamps in 2.4 s jam the riso: the crew sits down (NO MOLESTAR) until
 *    you open the lid; then the page is printed again;
 *  - registration marks (and the riso itself) re-roll the pink plate's offset;
 *  - the hidden third drum: type "amarillo" or press "amarillo" in the colophon;
 *  - colour proofs on project thumbnails; the border walkers hop when poked.
 * Imperative DOM only: one delegated click listener, no React state.
 */
import { halftoneDisc, rollRegistration } from "./print";

const WORDS = ["Aprobado", "OK", "Visto", "Original", "¡Joya!", "Tírese", "Chequeado", "De acuerdo"];
const MAX_STAMPS = 30;
const JAM_COUNT = 7;
const JAM_WINDOW = 2400;
const SECRET = "amarillo";
const SKIP_GRACE = 450;

export function mountPress(root: HTMLElement): () => void {
  const ac = new AbortController();
  const on = { signal: ac.signal } as const;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const live = root.querySelector<HTMLElement>("[data-live]");
  const jamEl = root.querySelector<HTMLElement>("[data-jam]");
  const jamBtn = jamEl?.querySelector<HTMLButtonElement>("button") ?? null;
  const stamps: HTMLElement[] = [];
  let recent: number[] = [];
  let jammed = false;
  let returnFocus: HTMLElement | null = null;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const say = (msg: string) => {
    if (!live) return;
    live.textContent = "";
    later(() => (live.textContent = msg), 30);
  };

  /* ------------------------------------------------------------ stamps */
  const stamp = (e: MouseEvent, target: Element) => {
    const sheet = target.closest<HTMLElement>("[data-paper]");
    const layer = sheet?.querySelector<HTMLElement>(":scope > [data-stamps]");
    if (!sheet || !layer) return;
    const paper = sheet.dataset.paper;
    const ink = paper === "pink" ? "b" : paper === "paper" ? (Math.random() < 0.6 ? "p" : "b") : "p";
    const box = layer.getBoundingClientRect();
    const el = document.createElement("span");
    el.className = `imp-stamp imp-stamp--${ink}`;
    el.textContent = WORDS[Math.floor(Math.random() * WORDS.length)];
    el.style.left = `${e.clientX - box.left}px`;
    el.style.top = `${e.clientY - box.top}px`;
    el.style.setProperty("--r", `${(Math.random() * 28 - 14).toFixed(1)}deg`);
    el.style.setProperty(
      "--mp",
      `${Math.round(Math.random() * 160)}px ${Math.round(Math.random() * 160)}px`,
    );
    layer.appendChild(el);
    stamps.push(el);
    if (stamps.length > MAX_STAMPS) stamps.shift()?.remove();

    const now = Date.now();
    recent = [...recent.filter((s) => now - s < JAM_WINDOW), now];
    if (recent.length >= JAM_COUNT) {
      recent = [];
      jam();
    }
  };

  /* --------------------------------------------------------------- jam */
  const jam = () => {
    if (jammed || !jamEl) return;
    jammed = true;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.setAttribute("data-jam", "");
    jamEl.hidden = false;
    root.dispatchEvent(new Event("imp:jam"));
    jamBtn?.focus({ preventScroll: true });
  };
  const clearJam = () => {
    if (!jammed || !jamEl) return;
    jammed = false;
    stamps.splice(0).forEach((s) => s.remove());
    jamEl.hidden = true;
    root.removeAttribute("data-jam");
    root.dispatchEvent(new Event("imp:unjam"));
    // the sheet goes through the drums again
    if (!reduce) {
      root.removeAttribute("data-reprint");
      void root.offsetWidth;
      root.setAttribute("data-reprint", "");
      later(() => root.removeAttribute("data-reprint"), 900);
    }
    say("Hoja destrabada. La cuadrilla volvió a laburar.");
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    else root.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
  };
  jamBtn?.addEventListener("click", clearJam, on);
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && jammed) clearJam();
    },
    on,
  );

  /* ------------------------------------------------------ registration */
  const reregister = () => {
    const m = rollRegistration();
    root.style.setProperty("--mx", `${m.x}px`);
    root.style.setProperty("--my", `${m.y}px`);
    root.style.setProperty("--mr", `${m.r}deg`);
  };

  /* ------------------------------------------------------- third drum */
  let sunBuilt = false;
  const buildSun = () => {
    if (sunBuilt) return;
    const host = root.querySelector<HTMLElement>("[data-ysun]");
    if (!host) return;
    sunBuilt = true;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 400 400");
    svg.setAttribute("aria-hidden", "true");
    const grp = document.createElementNS(ns, "g");
    grp.setAttribute("fill", "none");
    grp.setAttribute("stroke", "currentColor");
    grp.setAttribute("stroke-linecap", "round");
    for (const l of halftoneDisc({ step: 13, angle: 0, light: [0.7, 0.25], near: 0.95, far: 0.15 })) {
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", l.d);
      p.setAttribute("stroke-width", String(l.w));
      grp.appendChild(p);
    }
    svg.appendChild(grp);
    host.appendChild(svg);
  };
  const toggleYellow = () => {
    const onNow = !root.hasAttribute("data-yellow");
    if (onNow) buildSun();
    root.toggleAttribute("data-yellow", onNow);
    root
      .querySelectorAll<HTMLElement>("[data-yellow-btn]")
      .forEach((b) => b.setAttribute("aria-pressed", String(onNow)));
    root.dispatchEvent(new Event("imp:ink"));
    say(
      onNow
        ? "Tambor 3 cargado: tinta amarilla. Los cascos vuelven a ser amarillos."
        : "Tambor 3 afuera. Volvemos a dos tintas.",
    );
  };
  let buf = "";
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const tg = e.target as Element | null;
      if (tg?.closest("input, textarea, [contenteditable]")) return;
      buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
      if (buf === SECRET) {
        buf = "";
        toggleYellow();
      }
    },
    on,
  );

  /* ---------------------------------------------------- click routing */
  root.addEventListener(
    "click",
    (e) => {
      const t = e.target as Element | null;
      if (!t) return;
      const btn = t.closest<HTMLElement>("[data-reg], [data-riso], [data-yellow-btn], [data-proof], [data-walker]");
      if (btn) {
        if (btn.matches("[data-reg], [data-riso]")) reregister();
        else if (btn.matches("[data-yellow-btn]")) toggleYellow();
        else if (btn.matches("[data-proof]")) {
          const v = btn.getAttribute("aria-pressed") === "true";
          btn.setAttribute("aria-pressed", String(!v));
        } else if (btn.matches("[data-walker]")) {
          btn.removeAttribute("data-hop");
          void btn.offsetWidth;
          btn.setAttribute("data-hop", "");
        }
        return;
      }
      if (jammed) return;
      const stage = root.getAttribute("data-stage");
      if (stage !== "done") return;
      if (Date.now() - Number(root.getAttribute("data-skipped") ?? 0) < SKIP_GRACE) return;
      if (e.detail === 0) return; // keyboard "click"
      if (t.closest("a, button, input, textarea, select, label, summary, [data-ch], [data-nostamp]")) return;
      stamp(e, t);
    },
    on,
  );

  return () => {
    ac.abort();
    timers.forEach((id) => clearTimeout(id));
  };
}
