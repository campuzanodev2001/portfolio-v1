/**
 * Hero de Specimen × La Obra. Sin React: engancha comportamiento al DOM que
 * vino del server.
 *
 *  - Tipo (de Specimen): DANIEL_ se justifica con el eje `wdth`; en desktop
 *    el puntero estira las letras cercanas; un click suelta la letra, que cae
 *    con física propia y queda acostada sobre la vereda.
 *  - Cuadrilla (de La Obra): cuatro laburantes en pixel art viven en un canvas
 *    sobre la vereda. Levantan las letras caídas y las devuelven a su lugar,
 *    y cada tanto una ajustan a martillazos (el `wght` sube de a un golpe).
 *  - NO MOLESTAR: 7 letras tiradas en 6 s y la cuadrilla se sienta 7 s.
 *  - Huevo: `claude` (o mantener apretado el `_`) -> DANIEL_ pasa a CLAUDE_.
 *
 * Un solo loop de rAF para física + cuadrilla. Duerme cuando no hay nada que
 * mover, y no corre con la pestaña oculta ni con el hero fuera de pantalla.
 * Las ganas de laburar (pasear, ajustar) llegan por setTimeout, no por loop.
 */
import { BOOT_BY_ID } from "./boot";
import { FRAMES, SPR_AX, SPR_H, SPR_W, colorOf, type FrameName } from "./sprites";

const G = 2600; // px/s² (letras, en px CSS)
const BASE_W = 860;
const EGG = "CLAUDE";

type Body = {
  el: HTMLElement;
  cx: number; // centro "en casa", relativo al hero (px CSS)
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
  mode: "fall" | "rest" | "home";
  claimed: boolean;
};

type Mode = "idle" | "walk" | "push" | "hammer" | "sit";
type Worker = {
  crew: number;
  home: number; // fracción del ancho
  x: number; // art px
  dir: 1 | -1;
  mode: Mode;
  tx: number;
  speed: number;
  step: number;
  timer: number;
  hits: number;
  job: "letter" | "tune" | "wander" | "post" | "cheer" | null;
  body: Body | null;
  tune: HTMLElement | null;
  pose: FrameName;
};

export type HeroApi = {
  destroy(): void;
  egg(): void;
  setNight(on: boolean): void;
  dropRandom(): void;
  homeAll(): void;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function mountHero(root: HTMLElement, say: (m: string) => void): HeroApi | null {
  const hero = root.querySelector<HTMLElement>("[data-hero]");
  const word = root.querySelector<HTMLElement>("[data-word]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-crew]");
  const vereda = root.querySelector<HTMLElement>("[data-vereda]");
  const base = root.querySelector<HTMLElement>("[data-base]");
  if (!hero || !word || !canvas || !vereda || !base) return null;
  const ctx = canvas.getContext("2d");
  const art = document.createElement("canvas");
  const g = art.getContext("2d");
  if (!ctx || !g) return null;

  // Navegación cliente: React no ejecuta scripts inline, así que booteamos acá.
  if (!root.getAttribute("data-b")) {
    const s = document.createElement("script");
    s.textContent = BOOT_BY_ID;
    document.head.appendChild(s);
    s.remove();
  }

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

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const letters = Array.from(word.querySelectorAll<HTMLElement>("[data-ch]"));
  const cur = word.querySelector<HTMLElement>("[data-cur]");
  const glyphs = cur ? [...letters, cur] : letters;
  const readout = root.querySelector<HTMLElement>("[data-readout]");
  const sign = root.querySelector<HTMLElement>("[data-sign]");

  let ready = false;
  let fitVal = parseFloat(getComputedStyle(word).getPropertyValue("--fit")) || 100;
  let centers: number[] = [];

  /* ------------------------------------------------------------ readout */
  let readoutHold = 0;
  const setReadout = (label: string, w: number, d: number) => {
    if (!readout) return;
    readout.style.setProperty("--rw", String(Math.round(w)));
    readout.style.setProperty("--rd", String(Math.round(d)));
    readout.setAttribute("data-c", label);
  };
  const wordLabel = () => letters.map((l) => l.textContent).join("") + "_";

  /* ---------------------------------------------------------------- fit */
  // Justifica la palabra con el eje de ancho, no con el cuerpo: la letra
  // se adapta a la columna, como lo haría un componedor.
  const fit = (animate: boolean) => {
    const box = word.parentElement;
    if (!box) return;
    const target = box.clientWidth;
    const from = fitVal;
    word.setAttribute("data-fitting", "");
    glyphs.forEach((gl) => gl.style.setProperty("--lens", "0"));
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
    centers = glyphs.map((gl) => {
      const r = gl.getBoundingClientRect();
      return r.left + r.width / 2 - (bodies.get(gl)?.x ?? 0);
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

  // El `_` es una viga apoyada en la vereda: lo subimos lo que baja de la línea de base.
  const seatBeam = () => {
    if (!cur) return;
    try {
      const m = document.createElement("canvas").getContext("2d");
      const fam = (root.getAttribute("data-font") || "").split(",")[0];
      if (!m || !fam) return;
      m.font = `860 100px ${fam}`;
      const d = m.measureText("_").actualBoundingBoxDescent;
      if (Number.isFinite(d)) root.style.setProperty("--usd", `${(-d / 100).toFixed(3)}em`);
    } catch {}
  };

  // La vereda va exactamente en la línea de base de la palabra.
  const seatVereda = () => {
    const b = base.getBoundingClientRect().top;
    const v = vereda.getBoundingClientRect().top;
    const m = parseFloat(getComputedStyle(vereda).marginTop) || 0;
    if (Math.abs(v - b) > 0.5) vereda.style.marginTop = `${(m - (v - b)).toFixed(1)}px`;
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
    const ls = glyphs.map((_, i) => (px < 0 ? 0 : vy * Math.exp(-(((px - centers[i]) / sigma) ** 2))));
    const mean = ls.reduce((a, b) => a + b, 0) / ls.length;
    word.style.setProperty("--lm", mean.toFixed(3));
    ls.forEach((l, i) => glyphs[i].style.setProperty("--lens", l.toFixed(3)));
    if (readoutHold) return;
    let k = 0;
    ls.forEach((l, i) => {
      if (l > ls[k]) k = i;
    });
    if (ls[k] > 0.15) {
      setReadout(glyphs[k].textContent ?? "", BASE_W + 140 * ls[k], fitVal * (1 + 0.4 * (ls[k] - mean)));
    } else setReadout(wordLabel(), BASE_W, fitVal);
  };
  const lens = () => {
    if (!lensRaf) lensRaf = requestAnimationFrame(applyLens);
  };

  /* ------------------------------------------------------- canvas setup */
  let u = 2;
  let dpr = 1;
  let P = 2;
  let W = 0;
  let H = 0;
  let floorY = 0; // art px: donde pisan
  let skyTop = 0;
  let skyBot = 0;
  let night = false;
  let aim: { x: number; y: number } | null = null;
  let visible = true;
  let raf = 0;
  let last = 0;
  let annoyedUntil = 0;
  let annoyTimer = 0;
  let breaks: number[] = [];

  const mk = (crew: number, home: number): Worker => ({
    crew,
    home,
    x: 0,
    dir: home < 0.5 ? 1 : -1,
    mode: "idle",
    tx: 0,
    speed: 30,
    step: 0,
    timer: 0,
    hits: 0,
    job: null,
    body: null,
    tune: null,
    pose: "idle",
  });
  const workers: Worker[] = [mk(0, 0.1), mk(1, 0.37), mk(2, 0.63), mk(3, 0.9)];
  const homeX = (w: Worker) => Math.round(w.home * W);
  const toArtX = (cssX: number) => (cssX * dpr) / P;

  function layout() {
    const cs = getComputedStyle(root);
    u = Math.max(1, Math.round(parseFloat(cs.getPropertyValue("--u")) || 2));
    dpr = Math.max(1, Math.round((window.devicePixelRatio || 1) * 4) / 4);
    P = Math.max(1, Math.round(u * dpr));
    const hr = hero!.getBoundingClientRect();
    seatVereda();
    const vr = vereda!.getBoundingClientRect();
    // el canvas cubre del techo del hero hasta la vereda (+ aire para los conos)
    const hCss = Math.min(hr.height, vr.top - hr.top + 4);
    W = Math.ceil((hr.width * dpr) / P);
    H = Math.ceil((hCss * dpr) / P);
    canvas!.width = W * P;
    canvas!.height = H * P;
    canvas!.style.width = `${(W * P) / dpr}px`;
    canvas!.style.height = `${(H * P) / dpr}px`;
    art.width = W;
    art.height = H;
    floorY = Math.round(((vr.top - hr.top) * dpr) / P);
    const top = hero!.querySelector("header")?.getBoundingClientRect();
    const wr = word!.getBoundingClientRect();
    skyTop = top ? Math.ceil(((top.bottom - hr.top) * dpr) / P) + 2 : 2;
    skyBot = Math.floor(((wr.top - hr.top) * dpr) / P) - 2;
    for (const w of workers) {
      if (w.mode === "idle" || w.mode === "sit") w.x = clamp(w.x || homeX(w), 4, W - 4);
      if (w.job === "post") w.tx = homeX(w);
    }
    kick();
  }

  /* ------------------------------------------------------------ physics */
  const bodies = new Map<HTMLElement, Body>();

  const renderBody = (b: Body) => {
    b.el.style.translate = `${b.x.toFixed(1)}px ${b.y.toFixed(1)}px`;
    b.el.style.rotate = `${b.a.toFixed(4)}rad`;
  };
  const release = (b: Body) => {
    bodies.delete(b.el);
    b.el.style.translate = "";
    b.el.style.rotate = "";
    b.el.removeAttribute("data-fallen");
    checkAllFallen();
  };

  const stepBody = (b: Body, dt: number) => {
    if (b.mode === "home") {
      // resorte apenas sub-amortiguado: la letra se pasa un pelo y encaja
      const k = 230;
      const c = 21;
      b.vx += (-k * b.x - c * b.vx) * dt;
      b.vy += (-k * b.y - c * b.vy) * dt;
      b.va += (-k * b.a - c * b.va) * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.a += b.va * dt;
      if (Math.abs(b.x) + Math.abs(b.y) < 0.4 && Math.abs(b.vx) + Math.abs(b.vy) < 8 && Math.abs(b.a) < 0.003) {
        release(b);
        return;
      }
      renderBody(b);
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
      // se acuesta sobre el lado más cercano, como una letra de madera
      const q = Math.PI / 2;
      const t = Math.round(b.a / q) * q;
      b.va = 0;
      b.a += (t - b.a) * Math.min(1, dt * 10);
      b.vx *= Math.max(0, 1 - dt * 5);
      if (Math.abs(b.vx) < 4 && Math.abs(t - b.a) < 0.002) {
        b.a = t;
        b.vx = 0;
        b.mode = "rest";
        b.claimed = false;
      }
    }
    renderBody(b);
  };

  const checkAllFallen = () => {
    const fallen = letters.every((l) => {
      const b = bodies.get(l);
      return b && (b.mode === "fall" || b.mode === "rest");
    });
    root.toggleAttribute("data-empty", fallen);
  };

  const drop = (el: HTMLElement, clientX: number) => {
    const r = el.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    const v = vereda.getBoundingClientRect();
    const prev = bodies.get(el);
    const cxC = r.left + r.width / 2 - (prev?.x ?? 0);
    const cyC = r.top + r.height / 2 - (prev?.y ?? 0);
    const hw = el.offsetWidth / 2;
    const off = clamp((clientX - (r.left + r.width / 2)) / hw, -1, 1);
    const b: Body = {
      el,
      cx: cxC - h.left,
      x: prev?.x ?? 0,
      y: prev?.y ?? 0,
      a: prev?.a ?? 0,
      // la letra ya está parada en el piso: para que se caiga de verdad
      // salta, gira bastante y se va de costado sobre la vereda
      vx: -off * 240 + (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 150),
      vy: -(640 + Math.random() * 260),
      va: (off === 0 ? (Math.random() < 0.5 ? -1 : 1) : -Math.sign(off)) * (4.5 + Math.random() * 3.5),
      hw,
      hh: el.offsetHeight / 2,
      floor: v.top + 2 - cyC,
      minX: h.left - cxC,
      maxX: h.right - cxC,
      mode: "fall",
      claimed: false,
    };
    bodies.set(el, b);
    el.setAttribute("data-fallen", "");
    // si alguien la estaba ajustando, suelta el martillo
    for (const w of workers) if (w.tune === el) endJob(w);
    checkAllFallen();
    kick();
  };

  const sendHome = (b: Body) => {
    b.mode = "home";
    for (const w of workers) if (w.body === b) endJob(w);
    kick();
  };

  /* -------------------------------------------------------------- crew */
  function endJob(w: Worker) {
    if (w.tune) {
      const el = w.tune;
      later(() => el.removeAttribute("data-tune"), 700);
    }
    w.job = null;
    w.body = null;
    w.tune = null;
    if (w.mode !== "sit") {
      w.mode = "idle";
      w.pose = "idle";
    }
  }

  const isAnnoyed = () => performance.now() < annoyedUntil;

  function registerBreak(atX: number) {
    const now = performance.now();
    breaks = breaks.filter((b) => now - b < 6000);
    breaks.push(now);
    if (breaks.length >= 7 && !isAnnoyed()) annoy(atX);
  }

  function annoy(atX: number) {
    annoyedUntil = performance.now() + 7000;
    breaks = [];
    for (const w of workers) {
      if (w.tune) w.tune.removeAttribute("data-tune");
      if (w.body) w.body.claimed = false;
      w.job = null;
      w.body = null;
      w.tune = null;
      w.mode = "sit";
      w.pose = "sit";
    }
    if (sign) {
      const xCss = (clamp(atX, 24, W - 24) * P) / dpr;
      sign.style.left = `${xCss}px`;
      sign.style.top = `${(floorY * P) / dpr}px`;
      sign.dataset.show = "1";
    }
    say("La cuadrilla clavó un cartel de NO MOLESTAR. Vuelven en un toque.");
    if (annoyTimer) cancel(annoyTimer);
    annoyTimer = later(unannoy, 7000);
    kick();
  }

  function extendAnnoy() {
    annoyedUntil = performance.now() + 4000;
    if (annoyTimer) cancel(annoyTimer);
    annoyTimer = later(unannoy, 4000);
  }

  function unannoy() {
    annoyTimer = 0;
    annoyedUntil = 0;
    if (sign) sign.dataset.show = "0";
    for (const w of workers) {
      w.mode = "idle";
      w.pose = "idle";
    }
    say("");
    kick();
  }

  function shakeSign() {
    if (!sign) return;
    sign.dataset.shake = sign.dataset.shake === "a" ? "b" : "a";
  }

  const free = (w: Worker) =>
    w.mode !== "sit" && (w.job === null || w.job === "wander" || w.job === "post" || w.job === "cheer");

  function nearestFree(x: number) {
    let best: Worker | null = null;
    let d = Infinity;
    for (const w of workers) {
      if (!free(w)) continue;
      const dd = Math.abs(w.x - x);
      if (dd < d) {
        d = dd;
        best = w;
      }
    }
    return best;
  }

  const bodyArtX = (b: Body) => toArtX(b.cx + b.x);

  function assign() {
    if (isAnnoyed() || reduce) return;
    bodies.forEach((b) => {
      if (b.mode !== "rest" || b.claimed) return;
      const x = bodyArtX(b);
      const w = nearestFree(x);
      if (!w) return;
      b.claimed = true;
      w.job = "letter";
      w.body = b;
      w.mode = "walk";
      w.speed = 44;
      // se para al costado de la letra, del lado de donde viene
      const side = w.x < x ? -1 : 1;
      w.tx = Math.round(clamp(x + side * Math.min(8, toArtX(b.hh) * 0.6), 4, W - 4));
    });
  }

  function stepWorker(w: Worker, dt: number) {
    if (w.mode === "sit") {
      w.pose = "sit";
      return;
    }
    if (w.mode === "walk") {
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
        w.pose = Math.floor(w.step / 3) % 2 ? "walkA" : "walkB";
      }
      return;
    }
    if (w.mode === "push") {
      w.pose = "up";
      w.timer -= dt;
      if (w.timer <= 0) {
        const b = w.body;
        if (b && b.mode === "rest" && w.job === "letter") {
          w.body = null;
          sendHome(b);
        }
        endJob(w);
      }
      return;
    }
    if (w.mode === "hammer") {
      w.timer += dt;
      const was = w.pose;
      w.pose = Math.floor(w.timer / 140) % 2 === 0 ? "hamUp" : "hamDown";
      if (was === "hamUp" && w.pose === "hamDown") {
        w.hits--;
        if (w.tune) {
          const n = Math.min(3, Number(w.tune.dataset.tune || 0) + 1);
          w.tune.dataset.tune = String(n);
          showTune(w.tune, n);
        }
      }
      if (w.hits <= 0 && w.pose === "hamDown") endJob(w);
      return;
    }
    w.pose = "idle";
  }

  function showTune(el: HTMLElement, n: number) {
    if (!readout) return;
    if (readoutHold) cancel(readoutHold);
    setReadout(`${el.textContent ?? ""} · ajuste ${n}/3`, BASE_W + n * 46, fitVal);
    readoutHold = later(() => {
      readoutHold = 0;
      setReadout(wordLabel(), BASE_W, fitVal);
    }, 1600);
  }

  function arrive(w: Worker) {
    if (w.job === "letter") {
      const b = w.body;
      if (!b || b.mode !== "rest") return endJob(w);
      w.dir = bodyArtX(b) > w.x ? 1 : -1;
      w.mode = "push";
      w.timer = 420;
      return;
    }
    if (w.job === "tune" && w.tune && !w.tune.hasAttribute("data-fallen")) {
      w.mode = "hammer";
      w.hits = 3;
      w.timer = 0;
      w.pose = "hamUp";
      return;
    }
    endJob(w);
  }

  /* ----------------------------------------------- ganas de laburar */
  let wakeTimer = 0;
  function schedule(ms = 2600 + Math.random() * 4200) {
    if (reduce) return;
    if (wakeTimer) cancel(wakeTimer);
    wakeTimer = later(wake, ms);
  }
  function wake() {
    wakeTimer = 0;
    if (!visible || document.hidden || !ready || isAnnoyed()) return schedule();
    const idle = workers.filter((w) => w.mode === "idle" && w.job === null);
    if (idle.length) {
      const w = idle[Math.floor(Math.random() * idle.length)];
      const standing = letters.filter((l) => !bodies.has(l) && !l.dataset.tune);
      if (standing.length && Math.random() < 0.5) {
        const el = standing[Math.floor(Math.random() * standing.length)];
        const r = el.getBoundingClientRect();
        const x = toArtX(r.left + r.width / 2 - hero!.getBoundingClientRect().left);
        w.job = "tune";
        w.tune = el;
        w.mode = "walk";
        w.speed = 26;
        w.tx = Math.round(clamp(x + (w.x < x ? -6 : 6), 4, W - 4));
      } else {
        w.job = "wander";
        w.mode = "walk";
        w.speed = 18;
        w.tx = Math.round(homeX(w) + (Math.random() - 0.5) * W * 0.2);
      }
      kick();
    }
    schedule();
  }

  /* ------------------------------------------------------------ render */
  function draw(frame: FrameName, crew: number, x: number, y: number, dir: 1 | -1) {
    const rows = FRAMES[frame];
    const ox = x - SPR_AX;
    const oy = y - SPR_H;
    for (let r = 0; r < SPR_H; r++) {
      for (let c = 0; c < SPR_W; c++) {
        const col = colorOf(rows[r][c], crew, night);
        if (!col) continue;
        g!.fillStyle = col;
        g!.fillRect(dir === 1 ? ox + c : ox + (SPR_W - 1 - c), oy + r, 1, 1);
      }
    }
  }

  function stars() {
    const h = skyBot - skyTop;
    if (h < 4) return;
    let s = 1234567;
    const n = Math.max(12, Math.floor((W * h) / 140));
    g!.fillStyle = "#EFE7D6";
    for (let i = 0; i < n; i++) {
      s = (s * 16807) % 2147483647;
      const x = s % W;
      s = (s * 16807) % 2147483647;
      g!.fillRect(x, skyTop + (s % h), 1, 1);
    }
  }

  function cones() {
    g!.save();
    g!.globalCompositeOperation = "lighter";
    g!.fillStyle = "#F4E6B8";
    for (const w of workers) {
      const rows = FRAMES[w.pose];
      const row = Math.max(0, rows.findIndex((r) => r.includes("L")));
      const col = rows[row].indexOf("L");
      const c = w.dir === 1 ? col : SPR_W - 1 - col;
      const lx = Math.round(w.x) - SPR_AX + c;
      const ly = floorY - SPR_H + row;
      const ax = aim ? aim.x : lx + w.dir * 50;
      const ay = aim ? aim.y : ly - 24;
      let ang = Math.atan2(ay - ly, ax - lx);
      if ((Math.cos(ang) > 0 ? 1 : -1) !== w.dir) {
        if (w.mode === "idle") w.dir = w.dir === 1 ? -1 : 1;
        else ang = Math.atan2(-0.4, w.dir);
      }
      const len = Math.min(140, Math.hypot(ax - lx, ay - ly) + 6);
      g!.globalAlpha = 0.14;
      g!.beginPath();
      g!.moveTo(lx + 0.5, ly + 0.5);
      g!.lineTo(lx + Math.cos(ang - 0.2) * len, ly + Math.sin(ang - 0.2) * len);
      g!.lineTo(lx + Math.cos(ang + 0.2) * len, ly + Math.sin(ang + 0.2) * len);
      g!.closePath();
      g!.fill();
    }
    g!.restore();
  }

  function render() {
    g!.clearRect(0, 0, W, H);
    if (night) stars();
    for (const w of workers) draw(w.pose, w.crew, Math.round(w.x), floorY, w.dir);
    if (night) cones();
    ctx!.imageSmoothingEnabled = false;
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    ctx!.drawImage(art, 0, 0, W * P, H * P);
  }

  /* -------------------------------------------------------------- loop */
  const bodiesLive = () => {
    for (const b of bodies.values()) if (b.mode === "fall" || b.mode === "home") return true;
    return false;
  };
  const crewBusy = () => workers.some((w) => w.mode === "walk" || w.mode === "push" || w.mode === "hammer");

  function frame(now: number) {
    raf = 0;
    const dt = last ? Math.min(50, now - last) : 16;
    last = now;
    const s = Math.min(1 / 30, dt / 1000);
    bodies.forEach((b) => stepBody(b, s));
    assign();
    for (const w of workers) stepWorker(w, dt);
    render();
    if (visible && !document.hidden && (bodiesLive() || crewBusy())) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  function kick() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------- arranque */
  layout();
  const stage0 = root.getAttribute("data-stage");
  for (const w of workers) w.x = homeX(w);
  if (reduce) {
    // quietos en sus puestos
  } else if (stage0 === "run" || stage0 === "boot") {
    // la palabra se está levantando: todos ajustan a martillazos
    workers.forEach((w, i) => {
      w.mode = "hammer";
      w.hits = 4 + (i % 2);
      w.timer = i * 70;
      w.dir = w.home < 0.5 ? 1 : -1;
    });
  } else {
    // entrada corta: llegan caminando desde los bordes
    for (const w of workers) {
      w.x = w.home < 0.5 ? -12 : W + 12;
      w.tx = homeX(w);
      w.mode = "walk";
      w.job = "post";
      w.speed = 80;
      w.step = Math.random() * 6;
    }
  }
  root.setAttribute("data-canvas", "1");
  kick();

  /* ------------------------------------------------------------- input */
  word.addEventListener(
    "click",
    (e) => {
      if (!ready) return;
      const el = (e.target as Element).closest<HTMLElement>("[data-ch]");
      if (!el) return;
      if (isAnnoyed()) {
        shakeSign();
        extendAnnoy();
        return;
      }
      if (reduce) {
        // versión calma: la letra cambia de peso, nadie vuela
        el.toggleAttribute("data-alt");
        const w = nearestFree(toArtX(e.clientX - hero.getBoundingClientRect().left));
        if (w) {
          w.pose = "hamDown";
          render();
          later(() => {
            w.pose = "idle";
            render();
          }, 600);
        }
        return;
      }
      const b = bodies.get(el);
      if (!b || b.mode === "home") drop(el, e.clientX);
      else if (b.mode === "fall") {
        b.vy = -900; // malabares
        b.va += (Math.random() - 0.5) * 8;
      } else sendHome(b);
      // cada toque molesta: 7 en 6 s y la cuadrilla se planta
      registerBreak(toArtX(e.clientX - hero.getBoundingClientRect().left));
      checkAllFallen();
    },
    on,
  );

  const toArtPoint = (cx: number, cy: number) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((cx - r.left) * dpr) / P, y: ((cy - r.top) * dpr) / P };
  };
  hero.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      if (fine && !reduce && ready) {
        px = e.clientX;
        py = e.clientY;
        lens();
      }
      const p = toArtPoint(e.clientX, e.clientY);
      let changed = false;
      for (const w of workers) {
        if (w.mode !== "idle") continue;
        const d: 1 | -1 = p.x > w.x ? 1 : -1;
        if (d !== w.dir) {
          w.dir = d;
          changed = true;
        }
      }
      if (night) aim = p;
      if (changed || night) kick();
    },
    on,
  );
  hero.addEventListener(
    "pointerleave",
    () => {
      px = -1;
      if (fine && !reduce) lens();
    },
    on,
  );
  hero.addEventListener(
    "pointerdown",
    (e) => {
      if (!night) return;
      aim = toArtPoint(e.clientX, e.clientY);
      kick();
    },
    on,
  );

  // touch: mantener apretado el `_` dispara el huevo
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
        press = later(egg, 650);
      },
      on,
    );
    cur.addEventListener("pointerup", stop, on);
    cur.addEventListener("pointerleave", stop, on);
    cur.addEventListener("pointercancel", stop, on);
    cur.addEventListener("contextmenu", (e) => e.preventDefault(), on);
  }

  /* --------------------------------------------------------------- egg */
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
  function egg() {
    if (eggOn || !ready) return;
    eggOn = true;
    homeAll();
    root.setAttribute("data-egg", "");
    say("Este sitio lo armé a puro prompt, con Claude Code. La cuadrilla también.");
    swapTo(EGG.split(""), () => fit(true));
    if (!reduce && !isAnnoyed()) {
      // la cuadrilla festeja: brazos arriba, mirando al medio
      for (const w of workers) {
        if (!free(w)) continue;
        w.dir = w.x < W / 2 ? 1 : -1;
        w.job = "cheer";
        w.mode = "push";
        w.timer = 1400;
      }
      kick();
    }
    later(() => {
      swapTo(original, () => {
        fit(true);
        root.removeAttribute("data-egg");
        say("");
        eggOn = false;
      });
    }, 3200);
  }

  function homeAll() {
    bodies.forEach((b) => sendHome(b));
    root.removeAttribute("data-empty");
    kick();
  }

  function dropRandom() {
    if (!ready || reduce) {
      const el = letters[Math.floor(Math.random() * letters.length)];
      el.toggleAttribute("data-alt");
      return;
    }
    if (isAnnoyed()) {
      shakeSign();
      return;
    }
    const standing = letters.filter((l) => !bodies.has(l));
    if (!standing.length) return homeAll();
    const el = standing[Math.floor(Math.random() * standing.length)];
    const r = el.getBoundingClientRect();
    drop(el, r.left + r.width * Math.random());
    registerBreak(toArtX(r.left + r.width / 2 - hero!.getBoundingClientRect().left));
  }

  function setNight(v: boolean) {
    night = v;
    if (!v) aim = null;
    kick();
  }

  /* --------------------------------------------------------- lifecycle */
  const onStage = () => {
    if (ready || root.getAttribute("data-stage") !== "done") return;
    ready = true;
    seatBeam();
    fit(true);
    layout();
    schedule(1800);
  };
  root.addEventListener("stage", onStage, on);
  onStage();
  document.fonts?.ready.then(() => {
    if (ac.signal.aborted) return;
    seatBeam();
    if (ready) fit(true);
    layout();
  });

  let rz = 0;
  const ro = new ResizeObserver(() => {
    if (rz) cancel(rz);
    rz = later(() => {
      rz = 0;
      if (ready) {
        homeAll();
        fit(false);
      }
      layout();
    }, 140);
  });
  ro.observe(hero);
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) {
      layout();
      kick();
    }
  });
  io.observe(hero);
  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) kick();
    },
    on,
  );

  return {
    destroy() {
      ac.abort();
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      ro.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (lensRaf) cancelAnimationFrame(lensRaf);
    },
    egg,
    setNight,
    dropRandom,
    homeAll,
  };
}
