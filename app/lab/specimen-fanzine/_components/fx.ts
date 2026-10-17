/**
 * Progressive enhancement for the server-rendered page. No React state:
 * everything mutates CSS custom properties / attributes on DOM that the
 * server already rendered, so hydration never re-renders the type.
 *
 *  - fit:      justifies words to their column with the `wdth` axis
 *  - lens:     pointer proximity stretches the blue letters (fine pointers);
 *              the pink plate doesn't follow, so the lens pulls the inks apart
 *  - physics:  click a letter -> the blue type falls; the pink ink stays on
 *              the paper, and where the letter lands it prints itself
 *  - dot:      the final period can be dragged; it always springs back
 *  - reg:      registration marks re-roll the misregistration of every plate
 *  - stamps:   the paper accepts proof stamps; 7 in 2.4 s jams the printer
 *  - eggs:     "claude", "amarillo", the jam, the portrait loupe
 *  - contact:  copy address, fill-in-the-blanks coupon -> mailto
 */
import { BOOT_BY_ID, RUN_MS } from "./boot";
import { EMAIL, STAMP_WORDS } from "./constants";

type Cls = Readonly<Record<string, string>>;

const G = 2600; // px/s²
const BASE_W = 860;
const EGG = "claude";
const YELLOW = "amarillo";
const MAX_STAMPS = 36;
const MAX_IMPS = 14;
const JAM_COUNT = 7;
const JAM_WINDOW = 2400;

type Body = {
  el: HTMLElement;
  x: number;
  y: number;
  a: number;
  vx: number;
  vy: number;
  va: number;
  hw: number;
  hh: number;
  floor: number;
  minX: number;
  maxX: number;
  printed: boolean;
  mode: "fall" | "rest" | "home" | "drag";
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

export function mount(root: HTMLElement, s: Cls): () => void {
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
  const cancel = (id: number) => {
    clearTimeout(id);
    timers.delete(id);
  };

  // Client-side navigation: React doesn't execute inline scripts, so boot here.
  if (!root.getAttribute("data-b")) {
    const sc = document.createElement("script");
    sc.textContent = BOOT_BY_ID;
    document.head.appendChild(sc);
    sc.remove();
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = <T extends Element = HTMLElement>(q: string, el: ParentNode = root) =>
    el.querySelector<T>(q);
  const $$ = <T extends Element = HTMLElement>(q: string, el: ParentNode = root) =>
    Array.from(el.querySelectorAll<T>(q));

  const hero = $<HTMLElement>("[data-hero]");
  const wordbox = $<HTMLElement>("[data-wordbox]");
  const word = $<HTMLElement>("[data-word]");
  if (!hero || !wordbox || !word) return () => ac.abort();
  const letters = $$<HTMLElement>("[data-ch]", word);
  const cur = $<HTMLElement>("[data-cur]", word);
  const glyphs = cur ? [...letters, cur] : letters;
  const dot = $<HTMLElement>("[data-dot]");
  const readout = $<HTMLElement>("[data-readout]");
  const regReadout = $<HTMLElement>("[data-reg-readout]");
  const note = $<HTMLElement>("[data-note]");

  let ready = false;
  let fitVal = 100;
  let centers: number[] = [];
  const bodies = new Map<HTMLElement, Body>();

  /* ------------------------------------------------------------ readout */
  const setReadout = (label: string, w: number, d: number) => {
    if (!readout) return;
    readout.style.setProperty("--rw", String(Math.round(w)));
    readout.style.setProperty("--rd", String(Math.round(d)));
    readout.setAttribute("data-c", label);
  };
  const wordLabel = () => letters.map((l) => l.textContent).join("") + "_";

  /* ---------------------------------------------------------------- fit */
  // Justify with the width axis instead of font-size, like a compositor.
  const solve = (el: HTMLElement, holder: HTMLElement, target: number, start: number) => {
    let f = start;
    for (let k = 0; k < 6; k++) {
      holder.style.setProperty("--fit", f.toFixed(2));
      const w = el.getBoundingClientRect().width;
      if (!w) break;
      const next = clamp(f * (target / w), 25, 151);
      const settled = Math.abs(next - f) < 0.15;
      f = next;
      if (settled) break;
    }
    return f;
  };

  const fitHero = (animate: boolean) => {
    const from = fitVal;
    wordbox.setAttribute("data-fitting", "");
    glyphs.forEach((g) => g.style.setProperty("--lens", "0"));
    word.style.setProperty("--lm", "0");
    const f = solve(word, wordbox, wordbox.clientWidth, fitVal);
    centers = glyphs.map((g) => {
      const r = g.getBoundingClientRect();
      return r.left + r.width / 2 - (bodies.get(g)?.x ?? 0);
    });
    if (animate && !reduce) {
      wordbox.style.setProperty("--fit", from.toFixed(2));
      void wordbox.offsetWidth;
      wordbox.removeAttribute("data-fitting");
      wordbox.style.setProperty("--fit", f.toFixed(2));
    } else {
      void wordbox.offsetWidth;
      wordbox.removeAttribute("data-fitting");
    }
    fitVal = f;
    setReadout(wordLabel(), BASE_W, f);
  };

  const fitOthers = () => {
    $$<HTMLElement>("[data-fit]").forEach((box) => {
      const el = $<HTMLElement>("[data-fit-word]", box);
      const parent = box.parentElement;
      if (!el || !parent) return;
      const cs = getComputedStyle(parent);
      const target =
        parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      box.setAttribute("data-fitting", "");
      const prev = parseFloat(box.style.getPropertyValue("--fit")) || 100;
      solve(el, box, target, prev);
      void box.offsetWidth;
      box.removeAttribute("data-fitting");
    });
  };

  /* --------------------------------------------------------------- lens */
  let px = -1;
  let py = 0;
  let lensRaf = 0;
  const applyLens = () => {
    lensRaf = 0;
    const r = word.getBoundingClientRect();
    const my = r.top + r.height / 2;
    const vy = px < 0 ? 0 : Math.exp(-(((py - my) / (r.height * 1.4)) ** 2));
    const sigma = Math.max(90, window.innerWidth * 0.1);
    const ls = glyphs.map((_, i) =>
      px < 0 ? 0 : vy * Math.exp(-(((px - centers[i]) / sigma) ** 2)),
    );
    const mean = ls.reduce((a, b) => a + b, 0) / ls.length;
    word.style.setProperty("--lm", mean.toFixed(3));
    ls.forEach((l, i) => glyphs[i].style.setProperty("--lens", l.toFixed(3)));
    let k = 0;
    ls.forEach((l, i) => {
      if (l > ls[k]) k = i;
    });
    if (ls[k] > 0.15) {
      setReadout(
        glyphs[k].textContent ?? "",
        BASE_W + 140 * ls[k],
        fitVal * (1 + 0.4 * (ls[k] - mean)),
      );
    } else {
      setReadout(wordLabel(), BASE_W, fitVal);
    }
  };
  const lens = () => {
    if (!lensRaf) lensRaf = requestAnimationFrame(applyLens);
  };
  if (fine && !reduce) {
    hero.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse" || !ready) return;
        px = e.clientX;
        py = e.clientY;
        lens();
      },
      on,
    );
    hero.addEventListener(
      "pointerleave",
      () => {
        px = -1;
        lens();
      },
      on,
    );
  }

  /* ------------------------------------------------- ink impressions */
  const imps = new Map<HTMLElement, HTMLElement[]>();
  let impCount = 0;
  const impress = (b: Body) => {
    const r = b.el.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = s.imp;
    span.setAttribute("aria-hidden", "true");
    span.textContent = b.el.textContent;
    span.style.left = `${(r.left + r.width / 2 - h.left).toFixed(1)}px`;
    span.style.top = `${(r.top + r.height / 2 - h.top).toFixed(1)}px`;
    span.style.rotate = `${b.a.toFixed(3)}rad`;
    span.style.fontVariationSettings = getComputedStyle(b.el).fontVariationSettings;
    span.style.setProperty("--mp", `${Math.round(rand(0, 160))}px ${Math.round(rand(0, 160))}px`);
    hero.appendChild(span);
    const list = imps.get(b.el) ?? [];
    list.push(span);
    imps.set(b.el, list);
    impCount++;
    if (impCount > MAX_IMPS) {
      const oldest = hero.querySelector(`.${s.imp}:not([data-gone])`);
      if (oldest) fadeOut(oldest as HTMLElement);
    }
  };
  const fadeOut = (el: HTMLElement) => {
    el.setAttribute("data-gone", "");
    impCount--;
    later(() => el.remove(), reduce ? 0 : 650);
  };
  const wipeImps = (el: HTMLElement) => {
    imps.get(el)?.forEach((i) => {
      if (!i.hasAttribute("data-gone")) fadeOut(i);
    });
    imps.delete(el);
  };

  /* ------------------------------------------------------------ physics */
  let raf = 0;
  let last = 0;

  const render = (b: Body) => {
    b.el.style.translate = `${b.x.toFixed(1)}px ${b.y.toFixed(1)}px`;
    b.el.style.rotate = `${b.a.toFixed(4)}rad`;
  };
  const release = (b: Body) => {
    bodies.delete(b.el);
    b.el.style.translate = "";
    b.el.style.rotate = "";
    b.el.removeAttribute("data-fallen");
  };

  const step = (b: Body, dt: number) => {
    if (b.mode === "home") {
      const k = 230;
      const c = 21;
      b.vx += (-k * b.x - c * b.vx) * dt;
      b.vy += (-k * b.y - c * b.vy) * dt;
      b.va += (-k * b.a - c * b.va) * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.a += b.va * dt;
      if (
        Math.abs(b.x) + Math.abs(b.y) < 0.4 &&
        Math.abs(b.vx) + Math.abs(b.vy) < 8 &&
        Math.abs(b.a) < 0.003
      ) {
        release(b);
        return;
      }
      render(b);
      return;
    }
    if (b.mode !== "fall") return;
    b.vy += G * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.a += b.va * dt;
    const c = Math.abs(Math.cos(b.a));
    const sn = Math.abs(Math.sin(b.a));
    const ey = b.hh * c + b.hw * sn;
    const ex = b.hw * c + b.hh * sn;
    let ground = false;
    if (b.y + ey >= b.floor) {
      b.y = b.floor - ey;
      if (b.vy > 0) {
        const hard = b.vy > 160;
        b.vy = hard ? -b.vy * 0.42 : 0;
        b.vx *= 0.78;
        b.va = b.va * 0.5 + b.vx * 0.004;
        if (hard && !b.printed && b.el !== dot) {
          b.printed = true;
          render(b);
          impress(b);
        }
      }
      ground = true;
    }
    if (b.x - ex < b.minX) {
      b.x = b.minX + ex;
      b.vx = Math.abs(b.vx) * 0.6;
      b.va *= -0.6;
    } else if (b.x + ex > b.maxX) {
      b.x = b.maxX - ex;
      b.vx = -Math.abs(b.vx) * 0.6;
      b.va *= -0.6;
    }
    if (ground && b.vy === 0) {
      // lie down on the nearest side, like a piece of wooden type
      const q = Math.PI / 2;
      const t = Math.round(b.a / q) * q;
      b.va = 0;
      b.a += (t - b.a) * Math.min(1, dt * 10);
      b.vx *= Math.max(0, 1 - dt * 5);
      if (Math.abs(b.vx) < 4 && Math.abs(t - b.a) < 0.002) {
        b.a = t;
        b.vx = 0;
        b.mode = "rest";
      }
    }
    render(b);
  };

  const tick = (t: number) => {
    const dt = Math.min(1 / 30, (t - last) / 1000 || 1 / 60);
    last = t;
    bodies.forEach((b) => step(b, dt));
    let live = false;
    bodies.forEach((b) => {
      if (b.mode === "fall" || b.mode === "home") live = true;
    });
    raf = live ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const goHome = (b: Body) => {
    b.mode = "home";
    wipeImps(b.el);
  };

  let allTimer = 0;
  const checkAllFallen = () => {
    const fallen = letters.every((l) => {
      const b = bodies.get(l);
      return b && (b.mode === "fall" || b.mode === "rest");
    });
    root.toggleAttribute("data-empty", fallen);
    if (allTimer) {
      cancel(allTimer);
      allTimer = 0;
    }
    if (!fallen) return;
    // nothing left but the pink cursor; then the word re-sets itself
    allTimer = later(() => {
      allTimer = 0;
      root.removeAttribute("data-empty");
      letters.forEach((l, i) =>
        later(() => {
          const b = bodies.get(l);
          if (b) {
            goHome(b);
            kick();
          }
        }, i * 90),
      );
    }, 1700);
  };

  const drop = (el: HTMLElement, clientX: number) => {
    const r = el.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    const prev = bodies.get(el);
    const cx = r.left + r.width / 2 - (prev?.x ?? 0);
    const cy = r.top + r.height / 2 - (prev?.y ?? 0);
    const hw = el.offsetWidth / 2;
    const off = clamp((clientX - (r.left + r.width / 2)) / hw, -1, 1);
    const b: Body = {
      el,
      x: prev?.x ?? 0,
      y: prev?.y ?? 0,
      a: prev?.a ?? 0,
      vx: -off * 170 + (Math.random() - 0.5) * 140,
      vy: -(360 + Math.random() * 240),
      va: -off * 6 + (Math.random() - 0.5) * 3,
      hw,
      hh: el.offsetHeight / 2,
      floor: h.bottom - 4 - cy,
      minX: h.left - cx,
      maxX: h.right - cx,
      printed: false,
      mode: "fall",
    };
    bodies.set(el, b);
    el.setAttribute("data-fallen", "");
    kick();
  };

  word.addEventListener(
    "click",
    (e) => {
      if (!ready) return;
      const el = (e.target as Element).closest<HTMLElement>("[data-ch]");
      if (!el) return;
      if (reduce) {
        // calm version: the letter just changes weight, no flight
        el.toggleAttribute("data-alt");
        return;
      }
      const b = bodies.get(el);
      if (!b || b.mode === "home") drop(el, e.clientX);
      else if (b.mode === "fall") {
        b.vy = -720; // juggle
        b.va += (Math.random() - 0.5) * 8;
        b.printed = false;
      } else {
        goHome(b);
        kick();
      }
      checkAllFallen();
    },
    on,
  );

  const homeAll = (instant = false) => {
    bodies.forEach((b) => {
      if (b.el === dot && b.mode === "drag") return;
      wipeImps(b.el);
      if (instant) release(b);
      else b.mode = "home";
    });
    root.removeAttribute("data-empty");
    if (!instant) kick();
  };

  /* -------------------------------------------------------- the period */
  if (dot) {
    let sx = 0;
    let sy = 0;
    let lt = 0;
    let lx = 0;
    let ly = 0;
    dot.addEventListener(
      "pointerdown",
      (e) => {
        if (!ready) return;
        e.preventDefault();
        e.stopPropagation();
        dot.setPointerCapture(e.pointerId);
        const prev = bodies.get(dot);
        const b: Body = prev ?? {
          el: dot,
          x: 0,
          y: 0,
          a: 0,
          vx: 0,
          vy: 0,
          va: 0,
          hw: 0,
          hh: 0,
          floor: 0,
          minX: 0,
          maxX: 0,
          printed: true,
          mode: "drag",
        };
        b.mode = "drag";
        b.vx = b.vy = 0;
        bodies.set(dot, b);
        sx = e.clientX - b.x;
        sy = e.clientY - b.y;
        lt = performance.now();
        lx = e.clientX;
        ly = e.clientY;
        dot.setAttribute("data-held", "");
      },
      on,
    );
    dot.addEventListener(
      "pointermove",
      (e) => {
        const b = bodies.get(dot);
        if (!b || b.mode !== "drag") return;
        const now = performance.now();
        const dt = Math.max(1, now - lt) / 1000;
        b.vx = b.vx * 0.6 + ((e.clientX - lx) / dt) * 0.4;
        b.vy = b.vy * 0.6 + ((e.clientY - ly) / dt) * 0.4;
        lt = now;
        lx = e.clientX;
        ly = e.clientY;
        b.x = e.clientX - sx;
        b.y = e.clientY - sy;
        render(b);
      },
      on,
    );
    const letGo = () => {
      const b = bodies.get(dot);
      if (!b || b.mode !== "drag") return;
      dot.removeAttribute("data-held");
      if (reduce) {
        release(b);
        return;
      }
      b.mode = "home"; // a period always goes back to closing the sentence
      kick();
    };
    dot.addEventListener("pointerup", letGo, on);
    dot.addEventListener("pointercancel", letGo, on);
  }

  /* ------------------------------------------------- egg 1: claude */
  let eggOn = false;
  const original = letters.map((l) => l.getAttribute("data-c") ?? l.textContent ?? "");
  const swapTo = (chars: string[], then: () => void) => {
    if (reduce) {
      letters.forEach((l, i) => (l.textContent = chars[i]));
      then();
      return;
    }
    letters.forEach((l, i) =>
      later(() => {
        l.setAttribute("data-swap", "");
        later(() => {
          l.textContent = chars[i];
          l.removeAttribute("data-swap");
        }, 170);
      }, i * 55),
    );
    later(then, letters.length * 55 + 200);
  };
  const say = (t: string) => {
    if (note) note.textContent = t;
  };
  const claude = () => {
    if (eggOn || !ready) return;
    eggOn = true;
    homeAll();
    root.setAttribute("data-egg", "");
    say("Este sitio lo armé a puro prompt, con Claude Code. (La plancha rosa sigue diciendo Daniel.)");
    // only the blue drum changes: the pink plate keeps printing DANIEL
    swapTo(EGG.toUpperCase().split(""), () => fitHero(true));
    later(() => {
      swapTo(original, () => {
        fitHero(true);
        root.removeAttribute("data-egg");
        say("");
        eggOn = false;
      });
    }, 3600);
  };
  // touch screens have no keyboard: long-press the cursor instead
  if (cur) {
    let press = 0;
    const stop = () => {
      if (press) cancel(press);
      press = 0;
    };
    cur.addEventListener(
      "pointerdown",
      () => {
        stop();
        press = later(claude, 650);
      },
      on,
    );
    cur.addEventListener("pointerup", stop, on);
    cur.addEventListener("pointerleave", stop, on);
    cur.addEventListener("pointercancel", stop, on);
    cur.addEventListener("contextmenu", (e) => e.preventDefault(), on);
  }

  /* --------------------------------------------- registration marks */
  const setRegister = (x: number, y: number, r: number) => {
    root.style.setProperty("--mx", `${x}px`);
    root.style.setProperty("--my", `${y}px`);
    root.style.setProperty("--mr", `${r}deg`);
    if (regReadout) regReadout.textContent = `registro ${signed(x)} ${signed(y)}`;
  };
  const reroll = () => {
    const pick = (m: number) => {
      const val = rand(1.5, m);
      return Math.round((Math.random() < 0.5 ? -val : val) * 10) / 10;
    };
    setRegister(Math.round(pick(8)), Math.round(pick(6)), pick(0.5));
  };
  $$<HTMLButtonElement>("[data-reg]").forEach((b) => b.addEventListener("click", reroll, on));

  /* ------------------------------------------- egg 2: yellow drum */
  const yBtn = $<HTMLButtonElement>("[data-yellow-btn]");
  const yStatus = $<HTMLElement>("[data-yellow-status]");
  const setYellow = (onOff: boolean) => {
    root.toggleAttribute("data-yellow", onOff);
    yBtn?.setAttribute("aria-pressed", String(onOff));
    if (yStatus)
      yStatus.textContent = onOff
        ? ", ¡en uso! Ahora son tres tintas: donde el amarillo pisa al rosa, el guion y el punto se vuelven rojos."
        : ", cargado, sin usar.";
  };
  yBtn?.addEventListener("click", () => setYellow(!root.hasAttribute("data-yellow")), on);

  /* ---------------------------------------- stamps + egg 3: paper jam */
  const stamps: HTMLElement[] = [];
  let recent: number[] = [];
  const jamDialog = $<HTMLElement>("[data-jam-dialog]");
  const unjamBtn = $<HTMLButtonElement>("[data-unjam]");
  let jammed = false;

  const stampAt = (sheet: HTMLElement, x: number, y: number, word?: string, ink?: "p" | "b") => {
    const el = document.createElement("span");
    const k = ink ?? (Math.random() < 0.62 ? "p" : "b");
    el.className = `${s.stamp} ${k === "p" ? s.stampP : s.stampB}`;
    el.setAttribute("aria-hidden", "true");
    el.textContent = word ?? STAMP_WORDS[Math.floor(Math.random() * STAMP_WORDS.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--r", `${rand(-14, 14).toFixed(1)}deg`);
    el.style.setProperty("--mp", `${Math.round(rand(0, 160))}px ${Math.round(rand(0, 160))}px`);
    sheet.appendChild(el);
    stamps.push(el);
    if (stamps.length > MAX_STAMPS) stamps.shift()?.remove();
  };
  const stampOn = (target: Element, word: string) => {
    const sheet = target.closest<HTMLElement>("[data-sheet]");
    if (!sheet) return;
    const a = target.getBoundingClientRect();
    const b = sheet.getBoundingClientRect();
    stampAt(sheet, a.right - b.left - 10, a.top - b.top + 4, word, "p");
  };

  const jam = () => {
    if (jammed || !jamDialog) return;
    jammed = true;
    // the paper never moves (transforming a sheet would drop its multiply
    // layers in Chrome and re-rasterize everything): the blue ink slips and
    // the pink plate jumps out of register instead
    root.setAttribute("data-jam", "");
    jamDialog.hidden = false;
    unjamBtn?.focus({ preventScroll: true });
  };
  const replay = () => {
    ready = false;
    homeAll(true);
    root.removeAttribute("data-egg");
    root.setAttribute("data-stage", "boot");
    void root.offsetWidth;
    const stage = reduce ? "calm" : "run";
    root.setAttribute("data-stage", stage);
    root.dispatchEvent(new Event("stage"));
    later(
      () => {
        root.setAttribute("data-stage", "done");
        root.dispatchEvent(new Event("stage"));
      },
      reduce ? 760 : RUN_MS,
    );
  };
  unjamBtn?.addEventListener(
    "click",
    () => {
      jammed = false;
      if (jamDialog) jamDialog.hidden = true;
      root.removeAttribute("data-jam");
      stamps.splice(0).forEach((el) => el.remove());
      $$<HTMLElement>(`.${s.imp}`, hero).forEach((el) => el.remove());
      imps.clear();
      impCount = 0;
      setRegister(3, -2, -0.12);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      const h1 = document.getElementById("sf-name");
      if (h1) {
        h1.setAttribute("tabindex", "-1");
        h1.focus({ preventScroll: true });
      }
      // reprint the sheet: replaying the boot restarts the drum passes
      replay();
    },
    on,
  );

  const NO_STAMP =
    "a, button, input, textarea, select, label, form, [data-ch], [data-cur], [data-dot], [data-loupe], [data-thumb]";
  root.addEventListener(
    "click",
    (e) => {
      if (jammed || root.getAttribute("data-stage") !== "done") return;
      // the tap that skipped the loader shouldn't also stamp
      if (Date.now() - Number(root.getAttribute("data-skipped") ?? 0) < 450) return;
      if (e.detail === 0) return; // keyboard "click"
      const t = e.target as Element;
      if (t.closest(NO_STAMP)) return;
      const sheet = t.closest<HTMLElement>("[data-sheet]");
      if (!sheet) return;
      const box = sheet.getBoundingClientRect();
      stampAt(sheet, e.clientX - box.left, e.clientY - box.top);
      const now = Date.now();
      recent = [...recent.filter((x) => now - x < JAM_WINDOW), now];
      if (recent.length >= JAM_COUNT) {
        recent = [];
        jam();
      }
    },
    on,
  );

  /* -------------------------------------------- thumbs: colour proof */
  $$<HTMLButtonElement>("[data-thumb]").forEach((b) =>
    b.addEventListener(
      "click",
      () => b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")),
      on,
    ),
  );

  /* ------------------------------------------ egg 4: portrait loupe */
  const loupe = $<HTMLElement>("[data-loupe]");
  if (loupe) {
    let hold = 0;
    const off = () => {
      if (hold) cancel(hold);
      hold = 0;
      loupe.removeAttribute("data-loupe-on");
    };
    loupe.addEventListener(
      "pointerdown",
      () => {
        off();
        hold = later(() => loupe.setAttribute("data-loupe-on", ""), 280);
      },
      on,
    );
    loupe.addEventListener("pointerup", off, on);
    loupe.addEventListener("pointerleave", off, on);
    loupe.addEventListener("pointercancel", off, on);
    loupe.addEventListener("contextmenu", (e) => e.preventDefault(), on);
  }

  /* ------------------------------------------------------- contact */
  const contact = $<HTMLElement>("[data-contact]");
  const copied = $<HTMLElement>("[data-copied]");
  let copyTimer = 0;
  $$<HTMLButtonElement>("[data-copy]").forEach((btn) =>
    btn.addEventListener(
      "click",
      async () => {
        const text = btn.getAttribute("data-copy") ?? EMAIL;
        let ok = false;
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch {
          ok = false;
        }
        if (copied)
          copied.textContent = ok
            ? "Copiado. El guion bajo ya puso el punto."
            : `No pude copiarlo; es ${text}`;
        if (!ok) return;
        contact?.setAttribute("data-copied", "");
        stampOn(btn, "Copiado");
        if (copyTimer) cancel(copyTimer);
        copyTimer = later(() => {
          contact?.removeAttribute("data-copied");
          if (copied) copied.textContent = "";
        }, 5000);
      },
      on,
    ),
  );

  const coupon = $<HTMLFormElement>("[data-coupon]");
  const couponNote = $<HTMLElement>("[data-coupon-note]");
  coupon?.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      const fd = new FormData(coupon);
      const name = String(fd.get("name") ?? "").trim();
      const why = String(fd.get("subject") ?? "Hola");
      const body = String(fd.get("body") ?? "").trim();
      const subject = `${why} — de ${name || "alguien"}`;
      const text = `${body || "Hola Daniel,"}\n\n— ${name}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      const submit = coupon.querySelector("button[type=submit]");
      if (submit) stampOn(submit, "Listo");
      if (couponNote)
        couponNote.textContent = `Listo: se abrió tu app de mail con el cupón escrito. Si no pasó nada, escribime a ${EMAIL}.`;
    },
    on,
  );

  /* ------------------------------------------------------- keyboard */
  let buf = "";
  window.addEventListener(
    "keydown",
    (e) => {
      const t = e.target;
      if (t instanceof HTMLElement && (t.closest("input, textarea, select") || t.isContentEditable))
        return;
      if (e.key === "Escape") homeAll();
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-YELLOW.length);
      if (buf.endsWith(EGG)) {
        buf = "";
        claude();
      } else if (buf === YELLOW) {
        buf = "";
        setYellow(!root.hasAttribute("data-yellow"));
      }
    },
    on,
  );

  /* ------------------------------------- pause what isn't on screen */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.toggleAttribute("data-vis", en.isIntersecting));
    });
    $$("[data-sheet]").forEach((el) => io.observe(el));
    ac.signal.addEventListener("abort", () => io.disconnect());
  }

  /* ------------------------------------------------------ lifecycle */
  const onStage = () => {
    const st = root.getAttribute("data-stage");
    if (st !== "done") {
      ready = false;
      return;
    }
    if (ready) return;
    ready = true;
    fitHero(true);
  };
  root.addEventListener("stage", onStage, on);
  onStage();
  fitOthers();
  document.fonts?.ready.then(() => {
    if (ac.signal.aborted) return;
    fitOthers();
    if (ready) fitHero(true);
  });

  let rz = 0;
  let lastW = window.innerWidth;
  window.addEventListener(
    "resize",
    () => {
      if (rz) clearTimeout(rz);
      rz = window.setTimeout(() => {
        // mobile URL bars fire height-only resizes while scrolling: ignore
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        fitOthers();
        if (!ready) return;
        homeAll();
        fitHero(false);
      }, 160);
    },
    on,
  );

  return () => {
    ac.abort();
    timers.forEach((id) => clearTimeout(id));
    if (rz) clearTimeout(rz);
    if (raf) cancelAnimationFrame(raf);
    if (lensRaf) cancelAnimationFrame(lensRaf);
  };
}
