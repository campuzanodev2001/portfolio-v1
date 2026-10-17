/**
 * Comportamiento de toda la página (fuera del hero). Delegación de eventos
 * sobre el root, sin React ni estado: atributos `data-*` que lee el CSS.
 *
 *  Huevos: `claude` (hero), Konami / triple toque en la hora (turno noche),
 *          `plano` / rollito de plano en Proyectos (modo plano), baldosa floja
 *          en la vereda del footer.
 *  Gags:   letras de las palabras-borde que se hunden, sellos EN OBRA que se
 *          vuelven a sellar, retrato con casco, mail que se copia (el `_` se
 *          vuelve `.`), parte de pedido que lleva un laburante.
 */
import { mountHero } from "./hero";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const WORDS = ["claude", "plano"] as const;

const restart = (el: Element, attr: string, value = "1") => {
  el.removeAttribute(attr);
  void (el as HTMLElement).offsetWidth;
  el.setAttribute(attr, value);
};

const baTime = () =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(Date.now());

export function mountPage(root: HTMLElement): () => void {
  const ac = new AbortController();
  const on = { signal: ac.signal } as const;
  const live = root.querySelector<HTMLElement>("[data-live]");
  let liveTimer = 0;
  const say = (m: string) => {
    if (!live) return;
    live.textContent = m;
    if (liveTimer) clearTimeout(liveTimer);
    if (m) liveTimer = window.setTimeout(() => (live.textContent = ""), 6000);
  };

  const hero = mountHero(root, say);

  /* ------------------------------------------------------ turno noche */
  let night = false;
  const toggleNight = () => {
    night = !night;
    root.dataset.night = night ? "1" : "0";
    hero?.setNight(night);
    say(
      night
        ? `Turno noche. La cuadrilla prendió las linternas del casco y te sigue con la luz. En Buenos Aires son las ${baTime()}.`
        : "Volvió el día.",
    );
  };

  /* -------------------------------------------------------- modo plano */
  const planoBtn = root.querySelector<HTMLElement>("[data-plano-btn]");
  const togglePlano = (force?: boolean) => {
    const v = force ?? !root.hasAttribute("data-plano");
    root.toggleAttribute("data-plano", v);
    planoBtn?.setAttribute("aria-pressed", String(v));
    say(v ? "Modo plano: así se ve la página antes de levantarla. Escribí plano o tocá el rollito para volver." : "");
  };

  /* ------------------------------------------------------------ teclas */
  let buf = "";
  let k = 0;
  window.addEventListener(
    "keydown",
    (e) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "Escape") {
        hero?.homeAll();
        if (root.hasAttribute("data-plano")) togglePlano(false);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      // Konami
      if (key === KONAMI[k]) {
        k++;
        if (k === KONAMI.length) {
          k = 0;
          toggleNight();
        }
      } else k = key === KONAMI[0] ? 1 : 0;
      // palabras
      if (key.length !== 1) return;
      buf = (buf + key).slice(-8);
      for (const w of WORDS) {
        if (!buf.endsWith(w)) continue;
        buf = "";
        if (w === "claude") hero?.egg();
        else togglePlano();
      }
    },
    on,
  );

  /* ------------------------------------------------------------ clicks */
  let taps: number[] = [];
  let splashes = 0;
  const SPLASH = [
    "Baldosa floja. Te salpicó, como en cualquier vereda de Buenos Aires.",
    "Otra vez la misma. Ya deberías saber cuál es.",
    "Ya está, la cuadrilla la anotó para el lunes.",
  ];

  root.addEventListener(
    "click",
    (e) => {
      const t = e.target as Element;

      // triple toque en la hora = turno noche (el Konami del celu)
      if (t.closest("[data-clock]")) {
        const now = performance.now();
        taps = taps.filter((x) => now - x < 900);
        taps.push(now);
        if (taps.length >= 3) {
          taps = [];
          toggleNight();
        }
        return;
      }

      if (t.closest("[data-drop]")) {
        hero?.dropRandom();
        return;
      }

      if (t.closest("[data-plano-btn]")) {
        togglePlano();
        return;
      }

      const portrait = t.closest<HTMLElement>("[data-portrait]");
      if (portrait) {
        const v = portrait.getAttribute("aria-pressed") !== "true";
        portrait.setAttribute("aria-pressed", String(v));
        say(v ? "Versión cuadrilla: casco puesto." : "");
        return;
      }

      const sinkCh = t.closest<HTMLElement>("[data-sink] [data-i]");
      if (sinkCh) {
        const word = sinkCh.closest("[data-sink]")!;
        word.querySelectorAll(`[data-i="${sinkCh.dataset.i}"]`).forEach((el) => restart(el, "data-sunk"));
        return;
      }

      const stamp = t.closest<HTMLElement>("[data-stamp]");
      if (stamp) {
        stamp.style.setProperty("--r", `${(Math.random() * 16 - 8).toFixed(1)}deg`);
        restart(stamp, "data-hit");
        return;
      }

      const copy = t.closest<HTMLElement>("[data-copy]");
      if (copy) {
        const mail = copy.dataset.copy ?? "";
        const ok = () => {
          restart(copy, "data-copied");
          say("Mail copiado. Ahora pegalo donde quieras.");
          window.setTimeout(() => copy.removeAttribute("data-copied"), 2600);
        };
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(mail).then(ok, () => (location.href = `mailto:${mail}`));
        else location.href = `mailto:${mail}`;
        return;
      }

      const tile = t.closest<HTMLElement>("[data-baldosa]");
      if (tile) {
        restart(tile, "data-splash");
        say(SPLASH[Math.min(splashes, SPLASH.length - 1)]);
        splashes++;
      }
    },
    on,
  );

  /* ---------------------------------------------- parte de pedido (mail) */
  const form = root.querySelector<HTMLFormElement>("[data-mailform]");
  form?.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const kind = String(fd.get("kind") || "Hola");
      const body = String(fd.get("body") || "").trim();
      const to = form.dataset.mailform ?? "";
      const url = `mailto:${to}?subject=${encodeURIComponent(`${kind} — desde tu portfolio`)}${
        body ? `&body=${encodeURIComponent(body)}` : ""
      }`;
      const runner = root.querySelector("[data-runner]");
      if (runner) restart(runner, "data-run");
      say("Un laburante sale con tu parte. Se abre tu programa de mail.");
      location.href = url;
    },
    on,
  );

  return () => {
    ac.abort();
    if (liveTimer) clearTimeout(liveTimer);
    hero?.destroy();
  };
}
