/*
 * La Obra — motor del canvas. Sin React: un loop chico que dibuja en una
 * grilla de "art px" y escala con enteros (pixel crocante, cero blur).
 */
import {
  CELL,
  DAY,
  GROUND_Y,
  NAME_COLS,
  NAME_ROWS,
  NAME_W,
  NAME_Y,
  NIGHT,
  STAGE_H,
  U_MAX,
  U_MIN,
  nameSlots,
  type FrameName,
} from "./art";
import { baTime } from "./time";
import { drawBlock, drawPlan, drawSky, drawStatic, drawWorker, lampPos, type Rect } from "./draw";

export const BOOT_KEY = "lab-la-obra-booted";

type BlockState = "plan" | "set" | "fly" | "loose" | "carry";
type Block = {
  c: number;
  r: number;
  v: number;
  st: BlockState;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number;
  fy: number;
  t0: number;
  dur: number;
  claimed: boolean;
  resting: boolean;
};

type Role = "vereda" | "andamio" | "sereno";
type Mode = "idle" | "walk" | "fetch" | "carry" | "toss" | "hammer" | "sit";
type Worker = {
  crew: number;
  role: Role;
  home: number; // offset respecto de su referencia
  x: number;
  dir: 1 | -1;
  mode: Mode;
  tx: number;
  speed: number;
  step: number;
  timer: number;
  hits: number;
  block: Block | null;
  job: "cartel" | "wander" | "post" | null;
  nextIdle: number;
  pose: FrameName;
};

type Floor = { y: number; x0: number; x1: number };

const G = 300; // gravedad, art px / s²
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function startObra(canvas: HTMLCanvasElement): () => void {
  const hero = canvas.parentElement as HTMLElement;
  const root = canvas.closest<HTMLElement>("[data-obra-root]") ?? hero;
  const stageEl = hero.querySelector<HTMLElement>('[data-obra="stage"]');
  const cartelEl = hero.querySelector<HTMLElement>('[data-obra="cartel"]');
  const signEl = hero.querySelector<HTMLElement>('[data-obra="sign"]');
  const liveEl = hero.querySelector<HTMLElement>('[data-obra="live"]');
  const ctx = canvas.getContext("2d");
  const art = document.createElement("canvas");
  const g = art.getContext("2d");
  const bg = document.createElement("canvas");
  const bgx = bg.getContext("2d");
  if (!stageEl || !ctx || !g || !bgx) return () => {};

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let booted = false;
  try {
    booted = sessionStorage.getItem(BOOT_KEY) === "1";
  } catch {}
  // Si el JS llegó tarde (3G), no hay loader: nadie espera a la cuadrilla.
  // data-t0 lo pone el script inline al parsear el HTML; en navegación cliente no existe.
  const t0 = root.dataset.t0 ? Number(root.dataset.t0) : NaN;
  const late = performance.now() - t0 > 2000;
  const mode: "build" | "entrance" | "calm" = still
    ? "calm"
    : !booted && !late
      ? "build"
      : "entrance";
  root.dataset.boot = mode;

  /* ---------------- estado ---------------- */
  let u = 2;
  let dpr = 1;
  let P = 2;
  let W = 0;
  let H = 0;
  let nx = 0;
  let ny = 0;
  let gy = 0;
  const floors: Record<Role, Floor> = {
    vereda: { y: 0, x0: 0, x1: 0 },
    andamio: { y: 0, x0: 0, x1: 0 },
    sereno: { y: 0, x0: 0, x1: 0 },
  };
  let cartel = { x0: 0, x1: 0, y: 0 };
  let skyTop = 0;
  let avoid: Rect[] = [];
  let tilt = 0;
  let night = false;
  let aim: { x: number; y: number } | null = null;
  let hovered = -1;
  let visible = true;
  let raf = 0;
  let last = 0;
  let t = 0; // ms desde el arranque del motor
  let buildDone = mode !== "build";
  let breaks: number[] = [];
  let annoyedUntil = 0;
  let kIdx = 0;

  const slots = nameSlots();
  const blocks: Block[] = slots.map((s) => ({
    ...s,
    st: mode === "build" ? "plan" : "set",
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    fx: 0,
    fy: 0,
    t0: 0,
    dur: 0,
    claimed: false,
    resting: false,
  }));
  const byCell = new Map<number, Block>();
  for (const b of blocks) byCell.set(b.c * NAME_ROWS + b.r, b);

  const mk = (crew: number, role: Role, home: number): Worker => ({
    crew,
    role,
    home,
    x: 0,
    dir: 1,
    mode: "idle",
    tx: 0,
    speed: 24,
    step: 0,
    timer: 0,
    hits: 0,
    block: null,
    job: null,
    nextIdle: 2500 + Math.random() * 3000,
    pose: "idle",
  });
  const workers: Worker[] = [
    mk(0, "vereda", 18),
    mk(1, "vereda", 62),
    mk(2, "vereda", 104),
    mk(1, "andamio", 112),
    mk(3, "sereno", 0),
  ];

  const sx = (w: Worker) => (w.role === "andamio" ? nx + w.home : w.role === "sereno" ? serenoHome() : nx + w.home);
  const serenoHome = () => {
    const f = floors.sereno;
    return cartel.x1 + 7 <= f.x1 ? cartel.x1 + 7 : Math.max(f.x0, cartel.x0 - 7);
  };
  const floorOf = (w: Worker) => floors[w.role];
  const slotX = (b: Block) => nx + b.c * CELL;
  const slotY = (b: Block) => ny + b.r * CELL;

  /* ---------------- layout ---------------- */
  function layout() {
    const sw = stageEl!.clientWidth;
    const byH = Math.floor((innerHeight * 0.55) / STAGE_H);
    const nu = Math.max(U_MIN, Math.min(U_MAX, Math.floor(sw / NAME_W), Math.max(U_MIN, byH)));
    if (nu !== u || !root.style.getPropertyValue("--u")) {
      u = nu;
      root.style.setProperty("--u", `${u}px`);
    }
    dpr = Math.max(1, Math.round((window.devicePixelRatio || 1) * 4) / 4);
    P = Math.max(1, Math.round(u * dpr));
    const hr = hero.getBoundingClientRect();
    W = Math.ceil((hr.width * dpr) / P);
    H = Math.ceil((hr.height * dpr) / P);
    canvas.width = W * P;
    canvas.height = H * P;
    canvas.style.width = `${(W * P) / dpr}px`;
    canvas.style.height = `${(H * P) / dpr}px`;
    art.width = W;
    art.height = H;
    bg.width = W;
    bg.height = H;
    const toArt = (v: number) => Math.round((v * dpr) / P);
    // Caja de layout relativa al hero, sin transforms: el cartel puede estar
    // torcido o entrando con animación y no queremos medir eso.
    const boxOf = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = el;
      while (n && n !== hero) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { left: x, top: y, right: x + el.offsetWidth, bottom: y + el.offsetHeight };
    };
    const st = boxOf(stageEl!);
    nx = toArt(st.left);
    const sy = toArt(st.top);
    ny = sy + NAME_Y;
    gy = sy + GROUND_Y;
    floors.vereda = { y: gy, x0: 4, x1: W - 4 };
    floors.andamio = { y: ny, x0: nx + 86, x1: nx + 123 };
    if (cartelEl) {
      const cr = boxOf(cartelEl);
      cartel = { x0: toArt(cr.left), x1: toArt(cr.right), y: toArt(cr.bottom) };
    } else {
      cartel = { x0: W - 40, x1: W - 10, y: gy };
    }
    floors.sereno = Math.abs(cartel.y - gy) < 4 ? floors.vereda : { y: cartel.y, x0: 4, x1: W - 4 };
    const rectOf = (el: HTMLElement | null): Rect | null => {
      if (!el) return null;
      const r = boxOf(el);
      return { x0: toArt(r.left) - 2, y0: toArt(r.top) - 2, x1: toArt(r.right) + 2, y1: toArt(r.bottom) + 2 };
    };
    const top = rectOf(hero.querySelector("header"));
    skyTop = top ? top.y1 + 1 : 0;
    avoid = [rectOf(hero.querySelector<HTMLElement>('[data-obra="lede"]')), rectOf(cartelEl)].filter(
      (r): r is Rect => r !== null,
    );

    // al cambiar el layout se acomoda todo: nada queda flotando
    for (const b of blocks) if (b.st === "loose" || b.st === "carry") b.st = "set";
    for (const w of workers) {
      const f = floorOf(w);
      if (w.block || w.mode === "fetch" || w.mode === "carry" || w.mode === "toss") {
        w.block = null;
        w.mode = "idle";
      }
      if (w.job === "post") w.tx = sx(w);
      else if (w.mode !== "walk") w.x = Math.min(f.x1, Math.max(f.x0, w.x));
    }
    paintStatic();
    kick();
  }

  function paintStatic() {
    bgx!.clearRect(0, 0, W, H);
    drawStatic(bgx!, { W, nx, ny, gy }, night ? NIGHT : DAY);
  }

  /* ---------------- acciones ---------------- */
  function launch(b: Block, fromX: number, fromY: number, dur: number) {
    b.st = "fly";
    b.fx = fromX;
    b.fy = fromY;
    b.t0 = t;
    b.dur = dur;
    b.claimed = false;
  }

  function finishBuild(skipped = false) {
    if (buildDone) return;
    buildDone = true;
    for (const b of blocks) b.st = "set";
    for (const w of workers) {
      w.mode = "idle";
      w.x = sx(w);
    }
    root.dataset.phase = skipped ? "skipped" : "done";
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {}
    kick();
  }

  function say(msg: string) {
    if (liveEl) liveEl.textContent = msg;
  }

  function isAnnoyed() {
    return t < annoyedUntil;
  }

  function registerBreak(atX: number) {
    const now = t;
    breaks = breaks.filter((b) => now - b < 6000);
    breaks.push(now);
    if (breaks.length >= 7) annoy(atX);
  }

  function annoy(atX: number) {
    annoyedUntil = t + 7000;
    breaks = [];
    for (const w of workers) {
      if (w.block) {
        w.block.st = "loose";
        w.block.resting = false;
        w.block.claimed = false;
        w.block.vx = 0;
        w.block.vy = -20;
        w.block = null;
      }
      w.mode = "sit";
      w.job = null;
    }
    const f = floors.vereda;
    const x = Math.min(f.x1 - 20, Math.max(f.x0 + 20, atX));
    if (signEl) {
      signEl.style.left = `${(x * P) / dpr}px`;
      signEl.style.top = `${(f.y * P) / dpr}px`;
      signEl.dataset.show = "1";
    }
    say("La cuadrilla puso un cartel de NO MOLESTAR. Vuelven en un ratito.");
  }

  function unannoy() {
    annoyedUntil = 0;
    if (signEl) signEl.dataset.show = "0";
    for (const w of workers) {
      w.mode = "idle";
      w.nextIdle = t + 400 + Math.random() * 1200;
    }
    say("");
    dispatchCartel();
  }

  function shakeSign() {
    if (!signEl) return;
    signEl.dataset.shake = signEl.dataset.shake === "a" ? "b" : "a";
  }

  function popBlock(b: Block) {
    b.x = slotX(b);
    b.y = slotY(b);
    if (still) {
      // versión calma: el bloque se marca y alguien lo asienta sin moverse
      b.st = "plan";
      const w = nearest("vereda", b.x);
      if (w) {
        w.pose = "hamDown";
        w.timer = 0;
        w.mode = "hammer";
        w.hits = 0;
      }
      setTimeout(() => {
        if (b.st === "plan") b.st = "set";
        kick();
      }, 650);
    } else {
      b.st = "loose";
      b.resting = false;
      b.claimed = false;
      b.vx = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 16);
      b.vy = -45 - Math.random() * 20;
    }
    registerBreak(b.x);
    kick();
  }

  function breakCartel() {
    if (!cartelEl) return;
    tilt = Math.min(3, tilt + (tilt === 0 ? 2 : 1));
    if (!still) cartelEl.style.setProperty("--tilt", `${-tilt * 2}deg`);
    registerBreak((cartel.x0 + cartel.x1) / 2);
    dispatchCartel();
  }

  function dispatchCartel() {
    if (!cartelEl || tilt <= 0 || isAnnoyed()) return;
    if (workers.some((w) => w.job === "cartel")) return;
    const w = nearest("sereno", cartel.x0) ?? nearest("vereda", cartel.x0);
    if (!w) return;
    if (still) {
      tilt = 0;
      cartelEl.style.setProperty("--tilt", "0deg");
      w.mode = "hammer";
      w.pose = "hamDown";
      w.timer = 0;
      w.hits = 0;
      kick();
      return;
    }
    const f = floorOf(w);
    const left = cartel.x0 - 5;
    w.job = "cartel";
    w.tx = left >= f.x0 ? left : Math.min(f.x1, cartel.x1 + 5);
    w.mode = "walk";
    w.speed = 40;
    kick();
  }

  function nearest(role: Role, x: number): Worker | null {
    let best: Worker | null = null;
    let d = Infinity;
    for (const w of workers) {
      if (w.role !== role && !(role === "sereno" && floors.sereno === floors.vereda && w.role === "vereda")) continue;
      if (w.block || w.job === "cartel" || w.mode === "sit") continue;
      const dd = Math.abs(w.x - x);
      if (dd < d) {
        d = dd;
        best = w;
      }
    }
    return best;
  }

  function toggleNight() {
    night = !night;
    root.dataset.night = night ? "1" : "0";
    paintStatic();
    say(
      night
        ? `Turno noche. Apuntá con el mouse o tocá la pantalla: la cuadrilla te sigue con la linterna. En Buenos Aires son las ${baTime()}.`
        : "Volvió el día.",
    );
    kick();
  }

  /* ---------------- simulación ---------------- */
  function update(dt: number) {
    const s = dt / 1000;

    if (!buildDone) {
      // loader: los de la vereda tiran ladrillos en escalera, de abajo-izq. a arriba-der.
      const thrown = Math.min(1, Math.max(0, (t - 80) / 900));
      const n = Math.floor(thrown * order.length);
      for (let i = 0; i < n; i++) {
        const b = order[i];
        if (b.st !== "plan") continue;
        const w = thrower(slotX(b));
        launch(b, w.x - 1, gy - 13, 260);
        w.pose = "up";
        w.timer = 110;
      }
      if (t > 80 + 900 + 280) finishBuild();
    }

    if (annoyedUntil && t >= annoyedUntil) unannoy();

    for (const b of blocks) {
      if (b.st === "fly") {
        const p = Math.min(1, (t - b.t0) / b.dur);
        const tx = slotX(b);
        const ty = slotY(b);
        const arc = Math.max(10, (b.fy - ty) * 0.45);
        b.x = b.fx + (tx - b.fx) * p;
        b.y = b.fy + (ty - b.fy) * p - arc * 4 * p * (1 - p);
        if (p >= 1) b.st = "set";
      } else if (b.st === "loose" && !b.resting) {
        b.vy += G * s;
        b.x += b.vx * s;
        b.y += b.vy * s;
        if (b.x < 2 || b.x > W - 5) {
          b.vx = -b.vx;
          b.x = Math.min(W - 5, Math.max(2, b.x));
        }
        if (b.y >= gy - CELL) {
          b.y = gy - CELL;
          if (b.vy > 60) {
            b.vy = -b.vy * 0.3;
            b.vx *= 0.5;
          } else {
            b.vy = 0;
            b.vx = 0;
            b.resting = true;
          }
        }
      }
    }

    if (!isAnnoyed() && buildDone && !still) {
      for (const b of blocks) {
        if (b.st !== "loose" || b.claimed) continue;
        const w = nearest("vereda", b.x);
        if (!w || w.mode === "toss") continue;
        b.claimed = true;
        w.block = b;
        w.job = null;
        w.mode = "fetch";
        w.tx = Math.round(b.x + 1);
        w.speed = 38;
      }
    }

    for (const w of workers) stepWorker(w, dt);
  }

  const order = [...blocks].sort(
    (a, b) => a.c + (NAME_ROWS - a.r) * 2.2 - (b.c + (NAME_ROWS - b.r) * 2.2),
  );
  function thrower(x: number) {
    let best = workers[0];
    let d = Infinity;
    for (const w of workers) {
      if (w.role !== "vereda") continue;
      const dd = Math.abs(w.x - x);
      if (dd < d) {
        d = dd;
        best = w;
      }
    }
    return best;
  }

  function stepWorker(w: Worker, dt: number) {
    const f = floorOf(w);
    if (w.mode === "sit") {
      w.pose = "sit";
      return;
    }
    if (w.mode === "walk" || w.mode === "fetch" || w.mode === "carry") {
      if (w.mode === "fetch" && w.block && w.block.st === "loose") w.tx = Math.round(w.block.x + 1);
      w.tx = Math.min(f.x1, Math.max(f.x0, w.tx));
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
      if (w.block && w.mode === "carry") {
        w.block.x = w.x - 1;
        w.block.y = f.y - 13;
      }
      return;
    }
    if (w.mode === "toss") {
      w.pose = "up";
      w.timer -= dt;
      if (w.timer <= 0 && w.block) {
        const b = w.block;
        w.block = null;
        launch(b, w.x - 1, f.y - 13, 300);
        w.mode = "idle";
        w.nextIdle = t + 1500 + Math.random() * 2500;
      }
      return;
    }
    if (w.mode === "hammer") {
      w.timer += dt;
      if (still) {
        if (w.timer >= 650) {
          w.mode = "idle";
          w.pose = "idle";
        }
        return;
      }
      const was = w.pose;
      w.pose = Math.floor(w.timer / 140) % 2 === 0 ? "hamUp" : "hamDown";
      if (was === "hamUp" && w.pose === "hamDown") {
        w.hits--;
        if (w.job === "cartel" && tilt > 0) {
          tilt--;
          cartelEl?.style.setProperty("--tilt", `${-tilt * 2}deg`);
        }
      }
      const done = w.job === "cartel" ? tilt <= 0 && w.pose === "hamDown" : w.hits <= 0;
      if (done || w.timer > 5000) {
        w.mode = "idle";
        w.pose = "idle";
        w.job = null;
        w.nextIdle = t + 2000 + Math.random() * 3000;
      }
      return;
    }
    // idle
    if (w.timer > 0) {
      w.timer -= dt;
      if (w.timer <= 0) w.pose = "idle";
    } else w.pose = "idle";
    if (!buildDone || still || isAnnoyed()) return;
    if (t > w.nextIdle) {
      w.nextIdle = t + 3000 + Math.random() * 4500;
      if (w.role === "andamio") {
        w.dir = 1;
        w.mode = "hammer";
        w.hits = 3;
        w.timer = 0;
      } else if (w.role === "vereda") {
        w.job = "wander";
        w.mode = "walk";
        w.speed = 18;
        w.tx = sx(w) + Math.round((Math.random() - 0.5) * 36);
      } else if (Math.random() < 0.5) {
        w.dir = w.dir === 1 ? -1 : 1;
      }
    }
  }

  function arrive(w: Worker) {
    if (w.mode === "fetch" && w.block) {
      if (!w.block.resting) {
        w.pose = "idle"; // esperá que deje de rebotar
        return;
      }
      w.block.st = "carry";
      w.mode = "carry";
      w.speed = 30;
      w.tx = slotX(w.block) + 1;
      return;
    }
    if (w.mode === "carry" && w.block) {
      w.mode = "toss";
      w.timer = 160;
      return;
    }
    if (w.job === "cartel") {
      w.dir = w.x < cartel.x0 ? 1 : -1;
      w.mode = "hammer";
      w.hits = tilt;
      w.timer = 0;
      w.pose = "hamUp";
      return;
    }
    if (w.job === "post") {
      w.job = null;
      w.dir = w.role === "sereno" && w.x > (cartel.x0 + cartel.x1) / 2 ? -1 : 1;
    }
    w.mode = "idle";
    w.job = null;
  }

  /* ---------------- render ---------------- */
  function render() {
    const pal = night ? NIGHT : DAY;
    g!.clearRect(0, 0, W, H);
    if (night) drawSky(g!, W, skyTop, ny - 8, avoid, pal, t, still);
    g!.drawImage(bg, 0, 0);

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const x0 = slotX(b);
      const y0 = slotY(b);
      if (b.st === "set") {
        const lift = i === hovered && !isAnnoyed() ? (Math.floor(t / 180) % 2 ? 1 : 0) : 0;
        drawBlock(g!, x0, y0 - lift, pal, b.v);
      } else {
        drawPlan(g!, x0, y0, pal);
      }
    }
    for (const b of blocks) {
      if (b.st === "fly" || b.st === "loose" || b.st === "carry") drawBlock(g!, Math.round(b.x), Math.round(b.y), pal, b.v);
    }
    for (const w of workers) {
      const f = floorOf(w);
      drawWorker(g!, w.pose, w.crew, Math.round(w.x), f.y, w.dir, night);
    }

    if (night) cones(pal.moon);

    ctx!.imageSmoothingEnabled = false;
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.drawImage(art, 0, 0, W * P, H * P);
  }

  function cones(color: string) {
    g!.save();
    g!.globalCompositeOperation = "lighter";
    g!.fillStyle = color;
    for (const w of workers) {
      const f = floorOf(w);
      const lp = lampPos(Math.round(w.x), f.y, w.dir, w.pose);
      let ax: number;
      let ay: number;
      if (aim) {
        ax = aim.x;
        ay = aim.y;
      } else {
        ax = lp.x + w.dir * 50;
        ay = lp.y - 18;
      }
      let ang = Math.atan2(ay - lp.y, ax - lp.x);
      // no se tuercen el cuello: si el punto queda atrás, el que está libre se da vuelta;
      // el que está laburando sigue alumbrando para adelante
      if ((Math.cos(ang) > 0 ? 1 : -1) !== w.dir) {
        if (w.mode === "idle") w.dir = w.dir === 1 ? -1 : 1;
        else ang = Math.atan2(-0.35, w.dir);
      }
      const len = Math.min(110, Math.hypot(ax - lp.x, ay - lp.y) + 6);
      const spread = 0.2;
      g!.globalAlpha = 0.13;
      g!.beginPath();
      g!.moveTo(lp.x + 0.5, lp.y + 0.5);
      g!.lineTo(lp.x + Math.cos(ang - spread) * len, lp.y + Math.sin(ang - spread) * len);
      g!.lineTo(lp.x + Math.cos(ang + spread) * len, lp.y + Math.sin(ang + spread) * len);
      g!.closePath();
      g!.fill();
    }
    if (aim) {
      g!.globalAlpha = 0.12;
      const r = 7;
      for (let dy = -r; dy <= r; dy++) {
        const half = Math.floor(Math.sqrt(r * r - dy * dy));
        g!.fillRect(Math.round(aim.x) - half, Math.round(aim.y) + dy, half * 2 + 1, 1);
      }
    }
    g!.restore();
  }

  /* ---------------- loop ---------------- */
  function frame(now: number) {
    raf = 0;
    const dt = last ? Math.min(50, now - last) : 16;
    last = now;
    t += dt;
    update(dt);
    render();
    if (visible && !document.hidden && (!still || busy())) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  function busy() {
    return isAnnoyed() || workers.some((w) => w.mode !== "idle" && w.mode !== "sit") || blocks.some((b) => b.st !== "set");
  }
  function kick() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  /* ---------------- entrada ---------------- */
  layout();
  if (mode === "entrance") {
    for (const w of workers) {
      if (w.role === "andamio") {
        w.x = sx(w);
        continue;
      }
      const home = sx(w);
      const f = floorOf(w);
      w.x = home < W / 2 ? f.x0 - 14 : f.x1 + 14;
      w.tx = home;
      w.mode = "walk";
      w.job = "post";
      w.speed = 70;
      w.step = Math.random() * 6;
    }
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {}
  } else {
    for (const w of workers) w.x = sx(w);
    if (mode === "build") {
      const a = workers.find((w) => w.role === "andamio");
      if (a) {
        a.mode = "hammer";
        a.hits = 5;
        a.timer = 0;
      }
    }
    if (mode === "calm") {
      try {
        sessionStorage.setItem(BOOT_KEY, "1");
      } catch {}
    }
  }
  root.dataset.canvas = "1";
  kick();

  /* ---------------- input ---------------- */
  const toArtPoint = (cx: number, cy: number) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((cx - r.left) * dpr) / P, y: ((cy - r.top) * dpr) / P };
  };
  const cellAt = (x: number, y: number) => {
    const c = Math.floor((x - nx) / CELL);
    const r = Math.floor((y - ny) / CELL);
    if (c < 0 || r < 0 || c >= NAME_COLS || r >= NAME_ROWS) return null;
    return byCell.get(c * NAME_ROWS + r) ?? null;
  };

  const onClick = (e: MouseEvent) => {
    if (!buildDone) return;
    const target = e.target as Element | null;
    if (target?.closest("a, button, input, textarea, select, summary")) return;
    const p = toArtPoint(e.clientX, e.clientY);
    if (night) aim = p;
    if (target?.closest('[data-obra="cartel"]')) {
      if (isAnnoyed()) shakeSign();
      breakCartel();
      return;
    }
    const b = cellAt(p.x, p.y);
    if (b && b.st === "set") {
      if (isAnnoyed()) {
        shakeSign();
        return;
      }
      popBlock(b);
    }
    kick();
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const p = toArtPoint(e.clientX, e.clientY);
    if (night) {
      aim = p;
      kick();
    }
    const b = buildDone ? cellAt(p.x, p.y) : null;
    const idx = b && b.st === "set" ? blocks.indexOf(b) : -1;
    if (idx !== hovered) {
      hovered = idx;
      hero.style.cursor = idx >= 0 ? "pointer" : "";
      kick();
    }
  };
  const onLeave = () => {
    hovered = -1;
    hero.style.cursor = "";
  };

  const skip = () => {
    if (!buildDone) finishBuild(true);
  };

  const konami = (token: string) => {
    if (token === KONAMI[kIdx] || (token === "tap" && kIdx >= 8)) {
      kIdx++;
      if (kIdx === KONAMI.length) {
        kIdx = 0;
        toggleNight();
      }
    } else kIdx = token === KONAMI[0] ? 1 : 0;
  };
  const onKey = (e: KeyboardEvent) => {
    if (!buildDone) {
      skip();
      return;
    }
    konami(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  };

  // Konami táctil: deslizá ↑↑↓↓←→←→ y después dos toques
  let touch0: { x: number; y: number } | null = null;
  const onTouchStart = (e: TouchEvent) => {
    const tt = e.changedTouches[0];
    touch0 = { x: tt.clientX, y: tt.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!touch0) return;
    const tt = e.changedTouches[0];
    const dx = tt.clientX - touch0.x;
    const dy = tt.clientY - touch0.y;
    touch0 = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) konami("tap");
    else if (Math.abs(dx) > Math.abs(dy)) konami(dx > 0 ? "ArrowRight" : "ArrowLeft");
    else konami(dy > 0 ? "ArrowDown" : "ArrowUp");
  };

  const ro = new ResizeObserver(() => layout());
  ro.observe(hero);
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    kick();
  });
  io.observe(hero);
  const onVis = () => kick();

  hero.addEventListener("click", onClick);
  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", onLeave);
  window.addEventListener("keydown", onKey);
  window.addEventListener("pointerdown", skip);
  hero.addEventListener("touchstart", onTouchStart, { passive: true });
  hero.addEventListener("touchend", onTouchEnd, { passive: true });
  document.addEventListener("visibilitychange", onVis);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    hero.removeEventListener("click", onClick);
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("pointerdown", skip);
    hero.removeEventListener("touchstart", onTouchStart);
    hero.removeEventListener("touchend", onTouchEnd);
    document.removeEventListener("visibilitychange", onVis);
  };
}
