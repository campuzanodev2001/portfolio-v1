/**
 * The composing room. One rAF loop for two things that touch each other:
 *
 *  - the type (DOM): DANIEL_ justified with the `wdth` axis, the pointer lens
 *    on desktop, and letters that fall when you click them (hand-rolled
 *    physics from Specimen);
 *  - the crew (canvas): four pixel workers from La Obra who walk to a fallen
 *    letter, put it on their head, carry it under its slot and toss it back.
 *
 * No React state. The loop only runs while something moves; when everyone is
 * idle it sleeps until the next scheduled idle action, and it never runs
 * while the hero is off-screen or the tab is hidden.
 */
import { BOOT_BY_ID } from "./boot";
import { drawWorker, SPR_H, type FrameName } from "./art";

const G = 2600; // px/s²
const EGG = "claude";
const TILE = 8; // floor tile height, art px

type Mode = "fall" | "rest" | "carry" | "spring";
type Body = {
  el: HTMLElement;
  x: number; // offset from home, CSS px
  y: number;
  a: number;
  vx: number;
  vy: number;
  va: number;
  hw: number;
  hh: number;
  /** canvas-left − home-centre-x and canvas-top − home-centre-y (scroll-invariant) */
  cx0: number;
  cy0: number;
  minX: number;
  maxX: number;
  mode: Mode;
  by: Worker | null;
};

type WMode = "idle" | "walk" | "fetch" | "carry" | "toss" | "hammer" | "sit" | "cheer";
type Worker = {
  crew: number;
  home: number; // fraction of the floor width
  x: number;
  dir: 1 | -1;
  mode: WMode;
  tx: number;
  speed: number;
  step: number;
  timer: number;
  hits: number;
  body: Body | null;
  nextIdle: number;
  pose: FrameName;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function mountHero(root: HTMLElement): () => void {
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
  const yard = root.querySelector<HTMLElement>("[data-yard]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-crew]");
  const sign = root.querySelector<HTMLElement>("[data-sign]");
  const note = root.querySelector<HTMLElement>("[data-note]");
  const ctx = canvas?.getContext("2d") ?? null;
  const art = document.createElement("canvas");
  const g = art.getContext("2d");
  if (!hero || !word || !yard || !canvas || !ctx || !g) return () => ac.abort();

  const letters = Array.from(word.querySelectorAll<HTMLElement>("[data-ch]"));
  const cur = word.querySelector<HTMLElement>("[data-cur]");
  const glyphs = cur ? [...letters, cur] : letters;

  let ready = false;
  let fitVal = 100;
  let centers: number[] = [];
  const bodies = new Map<HTMLElement, Body>();

  /* ================================================================ type */

  // Justify the word with the width axis instead of font-size: the type
  // adapts its proportions to the column, like a compositor would.
  const fit = (animate: boolean) => {
    const box = word.parentElement;
    if (!box) return;
    const target = box.clientWidth;
    const from = fitVal;
    word.setAttribute("data-fitting", "");
    glyphs.forEach((el) => el.style.setProperty("--lens", "0"));
    word.style.setProperty("--lm", "0");
    let f = fitVal;
    for (let i = 0; i < 5; i++) {
      word.style.setProperty("--fit", f.toFixed(2));
      const w = word.getBoundingClientRect().width;
      if (!w) break;
      const next = clamp(f * (target / w), 25, 151);
      const settled = Math.abs(next - f) < 0.15;
      f = next;
      if (settled) break;
    }
    word.style.setProperty("--fit", f.toFixed(2));
    centers = glyphs.map((el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2 - (bodies.get(el)?.x ?? 0);
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
  };

  /* the lens: on desktop the pointer stretches the letters it's near */
  let px = -1;
  let py = 0;
  let lensRaf = 0;
  const applyLens = () => {
    lensRaf = 0;
    const r = word.getBoundingClientRect();
    const my = r.top + r.height / 2;
    const vy = px < 0 ? 0 : Math.exp(-(((py - my) / (r.height * 1.4)) ** 2));
    const sigma = Math.max(90, window.innerWidth * 0.1);
    const ls = glyphs.map((_, i) => (px < 0 ? 0 : vy * Math.exp(-(((px - centers[i]) / sigma) ** 2))));
    const mean = ls.reduce((a, b) => a + b, 0) / ls.length;
    word.style.setProperty("--lm", mean.toFixed(3));
    ls.forEach((l, i) => glyphs[i].style.setProperty("--lens", l.toFixed(3)));
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

  /* ================================================================ crew */

  let u = 2;
  let k = 2; // CSS px per art px (≈ u, exact on the device grid)
  let P = 2;
  let dpr = 1;
  let W = 0;
  let H = 0;
  let gy = 0;
  let t = 0;
  let jammed = false;
  let yellow = root.hasAttribute("data-yellow");

  const mk = (crew: number, home: number): Worker => ({
    crew,
    home,
    x: 0,
    dir: 1,
    mode: "idle",
    tx: 0,
    speed: 24,
    step: Math.random() * 6,
    timer: 0,
    hits: 0,
    body: null,
    nextIdle: 2500 + Math.random() * 3500,
    pose: "idle",
  });
  const crew: Worker[] = [mk(0, 0.08), mk(1, 0.3), mk(2, 0.52), mk(3, 0.7)];
  const homeX = (w: Worker) => Math.round(w.home * W) + 6;

  function layout() {
    u = parseFloat(getComputedStyle(root).getPropertyValue("--u")) || 2;
    dpr = Math.max(1, Math.round((window.devicePixelRatio || 1) * 4) / 4);
    P = Math.max(1, Math.round(u * dpr));
    k = P / dpr;
    const r = yard!.getBoundingClientRect();
    W = Math.max(1, Math.ceil(r.width / k));
    H = Math.max(1, Math.ceil(r.height / k));
    canvas!.width = W * P;
    canvas!.height = H * P;
    canvas!.style.width = `${W * k}px`;
    canvas!.style.height = `${H * k}px`;
    art.width = W;
    art.height = H;
    gy = H - Math.round((TILE * u) / k);
    for (const w of crew) w.x = clamp(w.x, 4, W - 4);
  }

  /** canvas rect in client px (canvas is bottom-aligned in the yard) */
  const canvasRect = () => {
    const r = yard!.getBoundingClientRect();
    return { left: r.left, top: r.bottom - H * k };
  };

  /** centre of a body in art px, canvas-local */
  const artX = (b: Body) => (b.x - b.cx0) / k;

  const nearestFree = (x: number) => {
    let best: Worker | null = null;
    let d = Infinity;
    for (const w of crew) {
      if (w.body || w.mode === "sit" || w.mode === "toss") continue;
      const dd = Math.abs(w.x - x);
      if (dd < d) {
        d = dd;
        best = w;
      }
    }
    return best;
  };

  function dispatchFetches() {
    if (jammed || reduce) return;
    bodies.forEach((b) => {
      if (b.mode !== "rest" || b.by) return;
      const w = nearestFree(artX(b));
      if (!w) return;
      b.by = w;
      w.body = b;
      w.mode = "fetch";
      w.speed = 46;
      w.tx = Math.round(artX(b));
    });
  }

  function stepWorker(w: Worker, dt: number) {
    if (w.mode === "sit") {
      w.pose = "sit";
      return;
    }
    if (w.mode === "cheer") {
      w.timer -= dt;
      w.pose = Math.floor(w.timer / 160) % 2 ? "up" : "idle";
      if (w.timer <= 0) {
        w.mode = "idle";
        w.pose = "idle";
      }
      return;
    }
    if (w.mode === "walk" || w.mode === "fetch" || w.mode === "carry") {
      if (w.mode === "fetch" && w.body) w.tx = Math.round(artX(w.body));
      w.tx = clamp(w.tx, 4, W - 4);
      const d = w.tx - w.x;
      const mv = (w.speed * dt) / 1000;
      if (Math.abs(d) <= mv) {
        w.x = w.tx;
        arrive(w);
      } else {
        w.dir = d > 0 ? 1 : -1;
        w.x += Math.sign(d) * mv;
        w.step += mv;
        w.pose = w.mode === "carry" ? "up" : Math.floor(w.step / 3) % 2 ? "walkA" : "walkB";
      }
      if (w.mode === "carry" && w.body) holdOverHead(w, w.body);
      return;
    }
    if (w.mode === "toss") {
      w.pose = "up";
      w.timer -= dt;
      if (w.body) holdOverHead(w, w.body);
      if (w.timer <= 0) {
        const b = w.body;
        w.body = null;
        w.mode = "idle";
        w.nextIdle = t + 1500 + Math.random() * 2500;
        if (b) {
          b.by = null;
          b.mode = "spring";
          b.vy = -520;
          b.va = (Math.random() - 0.5) * 4;
        }
      }
      return;
    }
    if (w.mode === "hammer") {
      w.timer += dt;
      w.pose = Math.floor(w.timer / 140) % 2 === 0 ? "hamUp" : "hamDown";
      if (w.timer > w.hits * 280) {
        w.mode = "idle";
        w.pose = "idle";
        w.nextIdle = t + 2500 + Math.random() * 3000;
      }
      return;
    }
    // idle
    w.pose = "idle";
    if (reduce || jammed || !ready) return;
    if (t > w.nextIdle) {
      w.nextIdle = t + 3000 + Math.random() * 4500;
      const r = Math.random();
      if (r < 0.5) {
        w.mode = "walk";
        w.speed = 18;
        w.tx = homeX(w) + Math.round((Math.random() - 0.5) * 36);
      } else if (r < 0.8) {
        w.dir = 1;
        w.mode = "hammer";
        w.hits = 3;
        w.timer = 0;
      } else {
        w.dir = w.dir === 1 ? -1 : 1;
      }
    }
  }

  function arrive(w: Worker) {
    if (w.mode === "fetch" && w.body) {
      if (w.body.mode !== "rest") {
        w.pose = "idle"; // wait for it to stop bouncing
        return;
      }
      const b = w.body;
      b.mode = "carry";
      b.a = Math.round(b.a / (Math.PI / 2)) * (Math.PI / 2);
      w.mode = "carry";
      w.speed = 38;
      w.tx = clamp(Math.round(-b.cx0 / k), 4, W - 4); // under the letter's slot
      return;
    }
    if (w.mode === "carry" && w.body) {
      w.mode = "toss";
      w.timer = 200;
      return;
    }
    w.mode = "idle";
  }

  function holdOverHead(w: Worker, b: Body) {
    const c = Math.abs(Math.cos(b.a));
    const s = Math.abs(Math.sin(b.a));
    const ey = b.hh * c + b.hw * s;
    const bob = w.mode === "carry" && Math.floor(w.step / 3) % 2 ? k : 0;
    const lx = (w.x + 0.5) * k;
    const ly = (gy - SPR_H - 1) * k - ey + bob;
    b.x = lx + b.cx0;
    b.y = ly + b.cy0;
    b.vx = b.vy = b.va = 0;
    render(b);
  }

  /* ============================================================= physics */

  const render = (b: Body) => {
    b.el.style.translate = `${b.x.toFixed(1)}px ${b.y.toFixed(1)}px`;
    b.el.style.rotate = `${b.a.toFixed(4)}rad`;
  };
  const release = (b: Body) => {
    bodies.delete(b.el);
    b.el.style.translate = "";
    b.el.style.rotate = "";
    b.el.removeAttribute("data-fallen");
    if (b.by) {
      b.by.body = null;
      if (b.by.mode !== "sit") b.by.mode = "idle";
      b.by = null;
    }
    root.removeAttribute("data-empty");
  };

  const stepBody = (b: Body, dt: number) => {
    if (b.mode === "spring") {
      // slightly underdamped: letters overshoot a hair and click into place
      const ks = 230;
      const c = 21;
      b.vx += (-ks * b.x - c * b.vx) * dt;
      b.vy += (-ks * b.y - c * b.vy) * dt;
      b.va += (-ks * b.a - c * b.va) * dt;
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
    const floor = gy * k + b.cy0;
    let ground = false;
    if (b.y + ey >= floor) {
      b.y = floor - ey;
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
      const tq = Math.round(b.a / q) * q;
      b.va = 0;
      b.a += (tq - b.a) * Math.min(1, dt * 10);
      b.vx *= Math.max(0, 1 - dt * 5);
      if (Math.abs(b.vx) < 4 && Math.abs(tq - b.a) < 0.002) {
        b.a = tq;
        b.vx = 0;
        b.mode = "rest";
        dispatchFetches();
      }
    }
    render(b);
  };

  const drop = (el: HTMLElement, clientX: number) => {
    const r = el.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    const prev = bodies.get(el);
    const cx = r.left + r.width / 2 - (prev?.x ?? 0);
    const cy = r.top + r.height / 2 - (prev?.y ?? 0);
    const hw = el.offsetWidth / 2;
    const off = clamp((clientX - (r.left + r.width / 2)) / hw, -1, 1);
    const cr = canvasRect();
    if (prev?.by) {
      // knocked off someone's head: they're left holding nothing
      prev.by.body = null;
      prev.by.mode = "idle";
      prev.by.dir = prev.by.dir === 1 ? -1 : 1;
    }
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
      cx0: cr.left - cx,
      cy0: cr.top - cy,
      minX: h.left - cx,
      maxX: h.right - cx,
      mode: "fall",
      by: null,
    };
    bodies.set(el, b);
    el.setAttribute("data-fallen", "");
    kick();
  };

  const checkAllFallen = () => {
    const fallen = letters.every((l) => bodies.has(l));
    root.toggleAttribute("data-empty", fallen);
  };

  word.addEventListener(
    "click",
    (e) => {
      if (!ready) return;
      const el = (e.target as Element).closest<HTMLElement>("[data-ch]");
      if (!el || el === cur) return;
      if (reduce) {
        // calm version: the letter just changes weight, nothing flies
        el.toggleAttribute("data-alt");
        return;
      }
      const b = bodies.get(el);
      if (b && b.mode === "fall") {
        b.vy = -720; // juggle
        b.va += (Math.random() - 0.5) * 8;
      } else {
        drop(el, e.clientX);
      }
      checkAllFallen();
    },
    on,
  );

  const homeAll = () => {
    bodies.forEach((b) => {
      if (b.by) {
        b.by.body = null;
        if (b.by.mode !== "sit") b.by.mode = "idle";
        b.by = null;
      }
      b.mode = "spring";
    });
    root.removeAttribute("data-empty");
    kick();
  };

  /* ================================================================ loop */

  let raf = 0;
  let sleep = 0;
  let last = 0;
  let visible = true;

  function busy() {
    if (bodies.size) {
      for (const b of bodies.values()) if (b.mode !== "rest") return true;
    }
    return crew.some((w) => w.mode !== "idle" && w.mode !== "sit");
  }

  function draw() {
    g!.clearRect(0, 0, W, H);
    for (const w of crew) drawWorker(g!, w.pose, w.crew, Math.round(w.x), gy, w.dir, yellow);
    ctx!.imageSmoothingEnabled = false;
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    ctx!.drawImage(art, 0, 0, W * P, H * P);
  }

  function frame(now: number) {
    raf = 0;
    const dtMs = last ? Math.min(50, now - last) : 16;
    last = now;
    t += dtMs;
    const dt = Math.min(1 / 30, dtMs / 1000);
    bodies.forEach((b) => stepBody(b, dt));
    for (const w of crew) stepWorker(w, dtMs);
    draw();
    if (!visible || document.hidden) {
      last = 0;
      return;
    }
    if (busy()) raf = requestAnimationFrame(frame);
    else {
      last = 0;
      snooze();
    }
  }

  /** Nothing moves: sleep until the next idle action (never in calm mode). */
  function snooze() {
    if (sleep) {
      clearTimeout(sleep);
      timers.delete(sleep);
      sleep = 0;
    }
    if (reduce || jammed) return;
    const next = Math.min(...crew.map((w) => w.nextIdle));
    sleep = later(
      () => {
        sleep = 0;
        t = Math.max(t, next);
        kick();
      },
      Math.max(200, next - t),
    );
  }

  function kick() {
    if (sleep) {
      clearTimeout(sleep);
      timers.delete(sleep);
      sleep = 0;
    }
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  /* ================================================================= egg */

  let buf = "";
  let eggOn = false;
  const original = letters.map((l) => l.getAttribute("data-c") ?? l.textContent ?? "");
  const setChar = (l: HTMLElement, c: string) => {
    l.textContent = c;
    l.setAttribute("data-c", c);
  };
  const swapTo = (chars: string[], then: () => void) => {
    if (reduce) {
      letters.forEach((l, i) => setChar(l, chars[i]));
      then();
      return;
    }
    letters.forEach((l, i) =>
      later(() => {
        l.setAttribute("data-swap", "");
        later(() => {
          setChar(l, chars[i]);
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
    for (const w of crew) {
      if (w.mode === "idle" && !reduce && !jammed) {
        w.mode = "cheer";
        w.timer = 1400;
      }
    }
    kick();
    swapTo(EGG.toUpperCase().split(""), () => fit(true));
    later(() => {
      swapTo(original, () => {
        fit(true);
        root.removeAttribute("data-egg");
        if (note) note.textContent = "";
        eggOn = false;
      });
    }, 3200);
  };
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") homeAll();
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const tg = e.target as Element | null;
      if (tg?.closest("input, textarea, [contenteditable]")) return;
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

  /* =========================================================== lifecycle */

  layout();
  const entering = !reduce;
  for (const w of crew) {
    const home = homeX(w);
    if (entering) {
      // the crew walks into the shop from both sides
      w.x = home < W / 2 ? -12 : W + 12;
      w.tx = home;
      w.mode = "walk";
      w.speed = 64;
    } else {
      w.x = home;
    }
  }
  root.setAttribute("data-crew-on", "");
  kick();
  if (reduce) draw();

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

  // jam (from the press): everybody sits down until the sheet is out
  root.addEventListener(
    "imp:jam",
    () => {
      jammed = true;
      bodies.forEach((b) => {
        if (b.by) {
          b.by = null;
          if (b.mode === "carry") {
            b.mode = "fall";
            b.vy = -60;
          }
        }
      });
      for (const w of crew) {
        w.body = null;
        w.mode = "sit";
      }
      if (sign) {
        const x = clamp(W * 0.42, 24, W - 24);
        sign.style.left = `${x * k}px`;
        sign.dataset.show = "1";
      }
      kick();
      draw();
    },
    on,
  );
  root.addEventListener(
    "imp:unjam",
    () => {
      jammed = false;
      if (sign) sign.dataset.show = "0";
      for (const w of crew) {
        w.mode = "idle";
        w.nextIdle = t + 400 + Math.random() * 1200;
      }
      dispatchFetches();
      kick();
      draw();
    },
    on,
  );
  root.addEventListener(
    "imp:ink",
    () => {
      yellow = root.hasAttribute("data-yellow");
      draw();
    },
    on,
  );

  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) kick();
  });
  io.observe(hero);
  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) kick();
    },
    on,
  );

  let rz = 0;
  let lastW = window.innerWidth;
  const ro = new ResizeObserver(() => {
    if (rz) clearTimeout(rz);
    rz = window.setTimeout(() => {
      layout();
      draw();
      // mobile browsers resize the viewport height while scrolling: only a
      // width change re-justifies the word and calls the letters home
      if (window.innerWidth !== lastW && ready) {
        lastW = window.innerWidth;
        homeAll();
        fit(false);
      }
    }, 160);
  });
  ro.observe(yard);

  return () => {
    ac.abort();
    timers.forEach((id) => clearTimeout(id));
    if (rz) clearTimeout(rz);
    if (raf) cancelAnimationFrame(raf);
    if (lensRaf) cancelAnimationFrame(lensRaf);
    io.disconnect();
    ro.disconnect();
  };
}
