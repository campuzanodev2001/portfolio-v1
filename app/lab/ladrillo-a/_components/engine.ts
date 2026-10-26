/*
 * Motor de "A presión". Sin librerías. Engancha comportamiento al HTML del
 * server (delegación sobre #la) y devuelve una función de limpieza.
 *
 *  - Ajuste: cada [data-fit] se aprieta (wdth 50–150) hasta llenar su caja.
 *    Si ni con 150 llena, abre el tracking; si ni con 50 entra, scaleX.
 *  - Prensado: todo [data-press]/[data-brick] se hunde en su sombra.
 *  - Empujón: en desktop, el ladrillo bajo el puntero se agranda y empuja a
 *    los vecinos; las palabras se re-aprietan en cada frame de la transición.
 *  - Huevos: rajadura + cinta, mezclar ("rebusque"), prensa (Konami o el
 *    ladrillo de peligro), cinta que se arranca, tapa del mail, contador.
 */
import { BOOT_BY_ID } from "./boot";

const KONAMI = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";
const PRESS_KEY = "lab-ladrillo-a-presses";
const MILESTONES: Record<number, string> = {
  25: "Ya da para una medianera.",
  60: "Con esto ya te hacés un quincho.",
  120: "¿No tenés nada que hacer? Yo tampoco. Escribime.",
};

type FitInfo = { w50: number; w150: number; n: number; fs: number };

export function mountPage(root: HTMLElement): () => void {
  const ac = new AbortController();
  const on = { signal: ac.signal } as const;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel);
  const $$ = <T extends HTMLElement = HTMLElement>(sel: string, ctx: ParentNode = root) =>
    Array.from(ctx.querySelectorAll<T>(sel));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Navegación cliente: el <script> inline no corrió, se inyecta.
  if (!root.getAttribute("data-b")) {
    const sc = document.createElement("script");
    sc.textContent = BOOT_BY_ID;
    document.body.appendChild(sc);
    sc.remove();
  }

  /* ---------------------------------------------------------------- toast */
  const live = $("[data-live]");
  let toastT = 0;
  const say = (msg: string) => {
    if (!live) return;
    live.textContent = msg;
    window.clearTimeout(toastT);
    toastT = later(() => (live.textContent = ""), 5200);
  };

  /* ---------------------------------------------------------------- ajuste */
  const ruler = $("[data-ruler]");
  const widths = new Map<string, number>();
  const infos = new WeakMap<HTMLElement, FitInfo>();

  function measure(text: string, fs: number, wght: number, wdth: number) {
    const key = `${text}|${fs}|${wght}|${wdth}`;
    const hit = widths.get(key);
    if (hit !== undefined) return hit;
    if (!ruler) return 0;
    ruler.style.fontSize = `${fs}px`;
    ruler.style.fontVariationSettings = `"wght" ${wght}, "wdth" ${wdth}, "GRAD" 0`;
    ruler.textContent = text;
    const w = ruler.getBoundingClientRect().width;
    widths.set(key, w);
    return w;
  }

  function avail(el: HTMLElement) {
    const p = el.parentElement;
    if (!p) return 0;
    const cs = getComputedStyle(p);
    return p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }

  /** Resuelve wdth para un ancho disponible usando las dos medidas extremas. */
  function apply(el: HTMLElement, info: FitInfo, room: number) {
    if (room <= 0 || info.w150 <= info.w50) return;
    let wd = 50 + (100 * (room - info.w50)) / (info.w150 - info.w50);
    let ls = 0;
    let sx = 1;
    if (wd > 150) {
      ls = Math.min((room - info.w150) / info.n, info.fs * 0.3);
      wd = 150;
    } else if (wd < 50) {
      sx = room / info.w50;
      wd = 50;
    }
    el.style.setProperty("--fit", wd.toFixed(1));
    el.style.setProperty("--ls", `${ls.toFixed(2)}px`);
    el.style.setProperty("--sx", sx.toFixed(4));
  }

  function fit(el: HTMLElement) {
    const text = el.textContent ?? "";
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (!text || !fs) return;
    const wght = Number(el.dataset.fit) || 900;
    const info: FitInfo = {
      w50: measure(text, fs, wght, 50),
      w150: measure(text, fs, wght, 150),
      n: [...text].length,
      fs,
    };
    infos.set(el, info);
    apply(el, info, avail(el) - 1);
  }

  /** Re-ajuste barato (sólo cambió el ancho de la caja). */
  function refit(el: HTMLElement) {
    const info = infos.get(el);
    if (info) apply(el, info, avail(el) - 1);
    else fit(el);
  }

  function fitMorsa() {
    const m = $("[data-morsa]");
    const w = $("[data-morsa-word]");
    if (!m || !w) return;
    const g = parseFloat(getComputedStyle(m).getPropertyValue("--g")) || 18;
    const inner = m.clientWidth - 2 * g;
    const text = w.textContent ?? "";
    const a = measure(text, 100, 300, 150);
    const b = measure(text, 100, 900, 50);
    if (!a || !b) return;
    const fs = Math.min((inner * 100) / a, 380);
    const closed = Math.max(0, (inner - (b * fs) / 100) / 2 + 2);
    m.style.setProperty("--mfs", `${fs.toFixed(1)}px`);
    m.style.setProperty("--closed", `${closed.toFixed(1)}px`);
  }

  function fitAll() {
    root.setAttribute("data-fit", "");
    $$("[data-fit]").forEach(fit);
    fitMorsa();
  }

  fitAll();
  document.fonts?.ready.then(() => {
    if (ac.signal.aborted) return;
    widths.clear();
    fitAll();
  });

  let resizeRaf = 0;
  window.addEventListener(
    "resize",
    () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(fitAll);
    },
    on,
  );

  /* -------------------------------------------- empujón (pared del hero) */
  const wall = $("[data-wall]");
  const heroWords = wall ? $$("[data-word]", wall) : [];
  let fitRaf = 0;
  let fitUntil = 0;
  function settle(ms = 460) {
    fitUntil = Math.max(fitUntil, performance.now() + ms);
    if (fitRaf) return;
    const frame = () => {
      heroWords.forEach(refit);
      if (performance.now() < fitUntil) fitRaf = requestAnimationFrame(frame);
      else fitRaf = 0;
    };
    fitRaf = requestAnimationFrame(frame);
  }

  let shoved: HTMLElement | null = null;
  function shove(slot: HTMLElement | null) {
    if (slot === shoved) return;
    if (shoved) shoved.style.flexGrow = "";
    shoved = slot;
    if (slot && slot.parentElement && slot.parentElement.children.length > 1) {
      const g = parseFloat(getComputedStyle(slot).getPropertyValue("--fg")) || 1;
      slot.style.flexGrow = String(g * 1.9);
    }
    settle(reduced ? 40 : 460);
  }

  if (wall && fine) {
    wall.addEventListener(
      "pointermove",
      (e) => {
        const slot = (e.target as HTMLElement).closest<HTMLElement>("[data-slot]");
        if (slot) shove(slot);
      },
      on,
    );
    wall.addEventListener("pointerleave", () => shove(null), on);
  }

  /* -------------------------------------------------------- prensado */
  let presses = 0;
  try {
    presses = Number(sessionStorage.getItem(PRESS_KEY)) || 0;
  } catch {}
  const countEl = $("[data-count]");
  const countMsg = $("[data-count-msg]");
  const paintCount = () => {
    if (countEl) countEl.textContent = String(presses);
    if (countMsg) {
      const hit = Object.keys(MILESTONES)
        .map(Number)
        .filter((k) => presses >= k)
        .pop();
      countMsg.textContent = hit ? MILESTONES[hit] : "";
    }
  };
  paintCount();

  const hits = new WeakMap<HTMLElement, number[]>();
  const down = new Set<HTMLElement>();
  const release = () => {
    down.forEach((el) => el.removeAttribute("data-down"));
    down.clear();
  };

  function crackCheck(brick: HTMLElement) {
    if (brick.hasAttribute("data-crack") || !brick.querySelector("[data-word]")) return;
    const now = performance.now();
    const list = (hits.get(brick) ?? []).filter((t) => now - t < 3000);
    list.push(now);
    hits.set(brick, list);
    if (list.length < 6) return;
    brick.setAttribute("data-crack", "");
    say("Uh, se rajó.");
    later(() => {
      brick.setAttribute("data-patched", "");
      say("Listo: emparchado con lo que había a mano. Sigue andando.");
    }, 900);
  }

  root.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0) return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-brick],[data-press]");
      if (!el) return;
      el.setAttribute("data-down", "");
      down.add(el);
      presses += 1;
      try {
        sessionStorage.setItem(PRESS_KEY, String(presses));
      } catch {}
      if (MILESTONES[presses]) say(MILESTONES[presses]);
      paintCount();
      if (el.hasAttribute("data-brick")) {
        crackCheck(el);
        if (e.pointerType !== "mouse") {
          const slot = el.closest<HTMLElement>("[data-slot]");
          shove(slot === shoved ? null : slot);
        }
      }
    },
    on,
  );
  window.addEventListener("pointerup", release, on);
  window.addEventListener("pointercancel", release, on);
  window.addEventListener("blur", release, on);

  /* ----------------------------------------------------------- la prensa */
  let prensa = false;
  function runPrensa() {
    if (prensa) return;
    prensa = true;
    root.setAttribute("data-prensa", "");
    say("Te dije que no. Bueno: todo entra si apretás lo suficiente.");
    later(
      () => {
        root.removeAttribute("data-prensa");
        settle(500);
        later(() => (prensa = false), 500);
      },
      reduced ? 1200 : 1500,
    );
  }

  /* ------------------------------------------------------------- mezclar */
  const original = heroWords.map((w) => w.textContent ?? "");
  let restoreT = 0;
  function setWords(texts: string[]) {
    heroWords.forEach((w, i) => {
      w.textContent = texts[i];
      w.removeAttribute("data-repress");
      void w.offsetWidth;
      if (!reduced) w.setAttribute("data-repress", "");
      fit(w);
    });
  }
  function shuffle() {
    if (!heroWords.length) return;
    const next = original.slice();
    for (let tries = 0; tries < 20; tries++) {
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      if (next.every((t, i) => t !== original[i])) break;
    }
    setWords(next);
    say("Mismo material, otro orden. Igual entra.");
    window.clearTimeout(restoreT);
    restoreT = later(restore, 4800);
  }
  function restore() {
    window.clearTimeout(restoreT);
    if (heroWords.some((w, i) => w.textContent !== original[i])) setWords(original);
  }

  /* ------------------------------------------------------- clicks varios */
  const tapa = $<HTMLButtonElement>("[data-tapa]");
  const copyBtn = $<HTMLButtonElement>("[data-copy]");
  const mailState = $("[data-mail-state]");
  const launch = $("[data-launch]");

  root.addEventListener(
    "click",
    (e) => {
      const t = e.target as HTMLElement;

      if (t.closest("[data-prensa-btn]")) return runPrensa();
      if (t.closest("[data-shuffle]")) return shuffle();

      const tape = t.closest<HTMLElement>("[data-tape]");
      if (tape && !tape.hasAttribute("data-peeled")) {
        tape.setAttribute("data-peeled", "");
        tape.setAttribute("tabindex", "-1");
        tape.setAttribute("aria-hidden", "true");
        say("Abajo de la cinta había algo. Siempre hay algo.");
        return;
      }

      if (tapa && t.closest("[data-tapa]")) {
        tapa.setAttribute("data-open", "");
        if (mailState) mailState.textContent = "Ahora sí: tocá";
        later(() => {
          tapa.hidden = true;
          copyBtn?.focus({ preventScroll: true });
        }, reduced ? 0 : 420);
        return;
      }

      const cp = t.closest<HTMLElement>("[data-copy]");
      if (cp) {
        const mail = cp.dataset.copy ?? "";
        const ok = () => {
          launch?.setAttribute("data-copied", "");
          if (mailState) mailState.textContent = "Copiado ✓";
          say(`Copiado: ${mail}. Escribime cuando quieras.`);
        };
        const fail = () => {
          window.location.href = `mailto:${mail}`;
        };
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(mail).then(ok, fail);
        else fail();
      }
    },
    on,
  );

  /* -------------------------------------------------------------- teclas */
  let buf = "";
  const keys: string[] = [];
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        restore();
        release();
        return;
      }
      keys.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      if (keys.length > 10) keys.shift();
      if (keys.join(",") === KONAMI) {
        keys.length = 0;
        runPrensa();
      }
      if (e.key.length === 1) {
        buf = (buf + e.key.toLowerCase()).slice(-12);
        if (buf.endsWith("rebusque")) {
          buf = "";
          shuffle();
        }
      }
    },
    on,
  );

  /* ------------------------------------- "Escribime" que sigue al puntero */
  const kin = $("[data-kin]");
  const sec = kin?.closest<HTMLElement>("section");
  if (kin && sec && fine && !reduced) {
    const letters = $$("span[style]", kin);
    let px = 0;
    let py = 0;
    let raf = 0;
    const paint = () => {
      raf = 0;
      letters.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        const k = Math.min(d / 520, 1);
        c.style.setProperty("--w", (900 - 700 * k).toFixed(0));
        c.style.setProperty("--wd", (128 - 70 * k).toFixed(0));
      });
    };
    sec.addEventListener(
      "pointermove",
      (e) => {
        px = e.clientX;
        py = e.clientY;
        kin.setAttribute("data-live", "");
        if (!raf) raf = requestAnimationFrame(paint);
      },
      on,
    );
    sec.addEventListener(
      "pointerleave",
      () => {
        kin.removeAttribute("data-live");
        letters.forEach((c) => {
          c.style.removeProperty("--w");
          c.style.removeProperty("--wd");
        });
      },
      on,
    );
  }

  return () => {
    ac.abort();
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    cancelAnimationFrame(resizeRaf);
    cancelAnimationFrame(fitRaf);
  };
}
