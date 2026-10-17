/**
 * Progressive enhancement for the server-rendered Specimen hero.
 * No React state: everything here mutates CSS custom properties / data
 * attributes on DOM that the server already rendered, so the client bundle
 * stays tiny and hydration never re-renders the type.
 *
 *  - fit():   justifies DANIEL_ to the column width using the `wdth` axis
 *  - lens:    pointer proximity stretches/squashes letters (fine pointers only)
 *  - physics: click a letter -> it falls, bounces, lies down. Click again to
 *             send it home; click it mid-air to juggle it.
 *  - dot:     the final period can be dragged; it always springs back.
 *  - egg:     type "claude" (or long-press the `_`) -> DANIEL_ becomes CLAUDE_.
 */
import { BOOT_BY_ID } from "./boot";

const G = 2600; // px/s²
const BASE_W = 860;
const EGG = "claude";

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
  mode: "fall" | "rest" | "home" | "drag";
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function mount(root: HTMLElement): () => void {
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

  // Client-side navigation: React doesn't execute inline scripts, so boot here.
  if (!root.getAttribute("data-b")) {
    const s = document.createElement("script");
    s.textContent = BOOT_BY_ID;
    document.head.appendChild(s);
    s.remove();
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hero = root.querySelector<HTMLElement>("[data-hero]");
  const word = root.querySelector<HTMLElement>("[data-word]");
  if (!hero || !word) return () => ac.abort();
  const letters = Array.from(word.querySelectorAll<HTMLElement>("[data-ch]"));
  const cur = word.querySelector<HTMLElement>("[data-cur]");
  const glyphs = cur ? [...letters, cur] : letters;
  const dot = root.querySelector<HTMLElement>("[data-dot]");
  const readout = root.querySelector<HTMLElement>("[data-readout]");
  const note = root.querySelector<HTMLElement>("[data-note]");

  let ready = false;
  let fitVal = 100;
  let centers: number[] = [];

  /* ------------------------------------------------------------ readout */
  const setReadout = (label: string, w: number, d: number) => {
    if (!readout) return;
    readout.style.setProperty("--rw", String(Math.round(w)));
    readout.style.setProperty("--rd", String(Math.round(d)));
    readout.setAttribute("data-c", label);
  };
  const wordLabel = () => letters.map((l) => l.textContent).join("") + "_";

  /* ---------------------------------------------------------------- fit */
  // Justify the word with the width axis instead of font-size: the type
  // adapts its proportions to the column, like a compositor would.
  const fit = (animate: boolean) => {
    const box = word.parentElement;
    if (!box) return;
    const target = box.clientWidth;
    const from = fitVal;
    word.setAttribute("data-fitting", "");
    glyphs.forEach((g) => g.style.setProperty("--lens", "0"));
    word.style.setProperty("--lm", "0");
    let f = fitVal;
    for (let k = 0; k < 5; k++) {
      word.style.setProperty("--fit", f.toFixed(2));
      const w = word.getBoundingClientRect().width;
      if (!w) break;
      const next = clamp(f * (target / w), 25, 151);
      const settled = Math.abs(next - f) < 0.15;
      f = next;
      if (settled) break;
    }
    word.style.setProperty("--fit", f.toFixed(2));
    centers = glyphs.map((g) => {
      const r = g.getBoundingClientRect();
      return r.left + r.width / 2 - (bodies.get(g)?.x ?? 0);
    });
    if (animate && !reduce) {
      word.style.setProperty("--fit", from.toFixed(2));
      void word.offsetWidth;
      word.removeAttribute("data-fitting");
      word.style.setProperty("--fit", f.toFixed(2));
    } else {
      void word.offsetWidth;
      word.removeAttribute("data-fitting");
    }
    fitVal = f;
    setReadout(wordLabel(), BASE_W, f);
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

  /* ------------------------------------------------------------ physics */
  const bodies = new Map<HTMLElement, Body>();
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
      // slightly underdamped spring: letters overshoot a hair and click in
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
    const s = Math.abs(Math.sin(b.a));
    const ey = b.hh * c + b.hw * s;
    const ex = b.hw * c + b.hh * s;
    let ground = false;
    if (b.y + ey >= b.floor) {
      b.y = b.floor - ey;
      if (b.vy > 0) {
        b.vy = b.vy > 160 ? -b.vy * 0.42 : 0;
        b.vx *= 0.78;
        b.va = b.va * 0.5 + b.vx * 0.004;
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
      // lie down on the nearest side, like a wooden letter would
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

  let allTimer = 0;
  const checkAllFallen = () => {
    const fallen = letters.every((l) => {
      const b = bodies.get(l);
      return b && (b.mode === "fall" || b.mode === "rest");
    });
    root.toggleAttribute("data-empty", fallen);
    if (allTimer) {
      clearTimeout(allTimer);
      timers.delete(allTimer);
      allTimer = 0;
    }
    if (!fallen) return;
    // nothing left but the cursor blinking; then the word re-types itself
    allTimer = later(() => {
      allTimer = 0;
      root.removeAttribute("data-empty");
      letters.forEach((l, i) =>
        later(() => {
          const b = bodies.get(l);
          if (b) {
            b.mode = "home";
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
      } else {
        b.mode = "home";
        kick();
      }
      checkAllFallen();
    },
    on,
  );

  const homeAll = () => {
    bodies.forEach((b) => {
      if (b.el !== dot) b.mode = "home";
    });
    root.removeAttribute("data-empty");
    kick();
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

  /* ----------------------------------------------------------- the egg */
  let buf = "";
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
  const egg = () => {
    if (eggOn || !ready) return;
    eggOn = true;
    buf = "";
    root.setAttribute("data-egg", "");
    if (note) note.textContent = "Este sitio lo armé a puro prompt, con Claude Code.";
    swapTo(EGG.toUpperCase().split(""), () => fit(true));
    later(() => {
      swapTo(original, () => {
        fit(true);
        root.removeAttribute("data-egg");
        if (note) note.textContent = "";
        eggOn = false;
      });
    }, 3000);
  };
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") homeAll();
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-EGG.length);
      if (buf === EGG) egg();
    },
    on,
  );
  // touch screens have no keyboard: long-press the cursor instead
  if (cur) {
    let press = 0;
    const cancel = () => {
      if (press) {
        clearTimeout(press);
        timers.delete(press);
      }
      press = 0;
    };
    cur.addEventListener(
      "pointerdown",
      () => {
        cancel();
        press = later(egg, 650);
      },
      on,
    );
    cur.addEventListener("pointerup", cancel, on);
    cur.addEventListener("pointerleave", cancel, on);
    cur.addEventListener("pointercancel", cancel, on);
    cur.addEventListener("contextmenu", (e) => e.preventDefault(), on);
  }

  /* ------------------------------------------------------- lifecycle */
  const onStage = () => {
    if (ready || root.getAttribute("data-stage") !== "done") return;
    ready = true;
    fit(true);
  };
  root.addEventListener("stage", onStage, on);
  onStage();
  document.fonts?.ready.then(() => {
    if (ready && !ac.signal.aborted) fit(true);
  });

  let rz = 0;
  window.addEventListener(
    "resize",
    () => {
      if (rz) clearTimeout(rz);
      rz = window.setTimeout(() => {
        if (!ready) return;
        homeAll();
        fit(false);
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
