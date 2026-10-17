/**
 * La Máquina — imperative engine. React renders static markup once; this
 * file only writes `transform`s and data-attributes. No libraries.
 *
 * - tweens/physics run on a virtual clock that only advances while the
 *   stage is on-screen and the tab is visible; no rAF while idle.
 * - chain(): the Rube Goldberg run. Missing pieces make it jam.
 * - pieces: tap = gag, second tap within 1.3s = knocked to the floor.
 *   Fix: drag it back onto its dashed silhouette (or focus + Enter).
 * - ball: tap = bump. 3 bumps in 4s = a second ball joins (egg).
 * - first scroll: the ball leaves through the ramp into the next section.
 */
import {
  AFTER,
  BALL_ON_SEESAW,
  BALL_R,
  BALL_START_S,
  BOOK_S0,
  DOT_R_EM,
  FALLEN,
  FLOOR,
  HOLE_X,
  NAME,
  PICK_TIP,
  PIECES,
  POT_FLOOR,
  PUSH,
  SEESAW_TILT,
  SHELF_Y,
  START,
  STRING_CUT,
  STRING_FULL,
  STRING_X,
  VB_W,
  onBook,
  onKeyboard,
  poseAttr,
  potOnSeesaw,
  seesawPoint,
  type PieceId,
  type Pose,
} from "./geometry";

type Ease = (t: number) => number;
const lin: Ease = (t) => t;
const inQ: Ease = (t) => t * t;
const outQ: Ease = (t) => 1 - (1 - t) * (1 - t);
const inOut: Ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const BOOT_KEY = "lab-maquina-booted";

type Where = "dot" | "period" | "svg" | "air" | "gone";
type Ball = {
  el: HTMLElement;
  x: number;
  y: number;
  r: number;
  rot: number;
  sx: number;
  sy: number;
  hop: number; // vertical offset from the rest point (px, negative = up)
  hv: number;
  vis: boolean;
  where: Where;
  sv: [number, number]; // rest point in svg coords when where === "svg"
};
type PS = {
  el: SVGGElement;
  wrap: Element;
  ghost: Element | null;
  pose: Pose;
  out: boolean;
  last: number;
};

export function mount(root: HTMLElement): () => void {
  const html = document.documentElement;
  const ac = new AbortController();
  const on = { signal: ac.signal } as const;
  const svg = root.querySelector<SVGSVGElement>("[data-svg]");
  const stub = root.querySelector<HTMLElement>("[data-next]");
  const iEl = root.querySelector<HTMLElement>("[data-i]");
  const iAnchor = root.querySelector<HTMLElement>("[data-anchor='i']");
  const pAnchor = root.querySelector<HTMLElement>("[data-anchor='p']");
  const nameEl = root.querySelector<HTMLElement>("[data-name]");
  const strEl = root.querySelector<SVGLineElement>("[data-str]");
  const toastEl = root.querySelector<HTMLElement>("[data-toast]");
  const statusEl = root.querySelector<HTMLElement>("[data-status]");
  const runBtn = root.querySelector<HTMLButtonElement>("[data-run]");
  const b1El = root.querySelector<HTMLElement>("[data-ball='1']");
  const b2El = root.querySelector<HTMLElement>("[data-ball='2']");
  if (!svg || !stub || !iEl || !iAnchor || !pAnchor || !nameEl || !strEl || !b1El || !b2El) return () => ac.abort();

  const mode0 = html.getAttribute("data-mq") || "done";
  const calm = mode0 === "calm" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = Number(html.getAttribute("data-mq-t")) || Date.now();
  // Late hydration (slow 3G): the CSS failsafe already revealed the page.
  let booting = mode0 === "boot" && Date.now() - t0 < 1800;

  /* ------------------------------------------------------------ clock */
  type Tw = { start: number; dur: number; fn: (p: number) => void; res: () => void };
  let tws: Tw[] = [];
  const physics = new Set<(dt: number) => boolean>();
  let clock = 0;
  let last = 0;
  let raf = 0;
  let onScreen = true;
  let gen = 0;

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(50, now - last);
    last = now;
    clock += dt;
    for (const tw of tws.slice()) {
      const p = clamp((clock - tw.start) / tw.dur, 0, 1);
      tw.fn(p);
      if (p >= 1) {
        tws = tws.filter((t) => t !== tw);
        tw.res();
      }
    }
    for (const f of Array.from(physics)) if (!f(dt / 1000)) physics.delete(f);
    render();
    kick();
  };
  const kick = () => {
    if (raf || !onScreen || document.hidden) return;
    if (!tws.length && !physics.size) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const raw = (dur: number, fn: (p: number) => void, ease: Ease = lin) =>
    new Promise<boolean>((res) => {
      const g = gen;
      tws.push({ start: clock, dur: Math.max(1, dur), fn: (p) => fn(ease(p)), res: () => res(g === gen) });
      kick();
    });
  /** Motion tween: instant under reduced motion. Resolves false if cancelled. */
  const tween = (dur: number, fn: (p: number) => void, ease: Ease = lin) => {
    if (calm) {
      fn(1);
      render();
      return Promise.resolve(true);
    }
    return raw(dur, fn, ease);
  };
  const wait = (ms: number) => raw(ms, () => {});
  /** Storyboard beat: only exists in the calm version. */
  const beat = () => (calm ? wait(320) : Promise.resolve(true));
  const cancelAll = () => {
    gen++;
    const old = tws;
    tws = [];
    old.forEach((t) => t.res());
    physics.clear();
  };

  /* ------------------------------------------------------------ geometry */
  let ox = 0;
  let oy = 0;
  let k = 1;
  const measure = () => {
    const rr = root.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    ox = sr.left - rr.left;
    oy = sr.top - rr.top;
    k = sr.width / VB_W || 1;
  };
  const rel = (el: Element) => {
    const rr = root.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height };
  };
  const dotR = () => parseFloat(getComputedStyle(nameEl).fontSize) * DOT_R_EM;
  const iDot = () => {
    const a = rel(iEl);
    const b = rel(iAnchor);
    return { x: a.x + a.w / 2, y: b.y, r: dotR() };
  };
  const pDot = () => {
    const b = rel(pAnchor);
    return { x: b.x, y: b.y, r: dotR() };
  };

  /* ------------------------------------------------------------ pieces */
  const P = {} as Record<PieceId, PS>;
  for (const id of PIECES) {
    const el = svg.querySelector<SVGGElement>(`[data-p='${id}']`);
    if (!el) return () => ac.abort();
    P[id] = {
      el,
      wrap: el.parentElement as Element,
      ghost: svg.querySelector(`[data-g='${id}']`),
      pose: { ...AFTER[id] },
      out: false,
      last: 0,
    };
  }
  let strY = STRING_CUT;
  let potOnSaw = true;
  let coneS = 1;
  const cone = svg.querySelector<SVGGElement>("[data-cone]");

  /* ------------------------------------------------------------ balls */
  const mkBall = (el: HTMLElement): Ball => ({
    el, x: 0, y: 0, r: 10, rot: 0, sx: 1, sy: 1, hop: 0, hv: 0, vis: false, where: "gone", sv: [0, 0],
  });
  const b1 = mkBall(b1El);
  const b2 = mkBall(b2El);

  const setSvg = (b: Ball, x: number, y: number, r = BALL_R * k) => {
    const nx = ox + x * k;
    const ny = oy + y * k;
    if (b.vis) b.rot += ((nx - b.x) / Math.max(4, r)) * 57.3;
    b.x = nx;
    b.y = ny;
    b.r = r;
    b.sv = [x, y];
  };
  const restAt = (b: Ball) => {
    if (b.where === "dot") Object.assign(b, iDot());
    else if (b.where === "period") Object.assign(b, pDot());
    else if (b.where === "svg") setSvg(b, b.sv[0], b.sv[1]);
  };

  /* ------------------------------------------------------------ render */
  const render = () => {
    for (const id of PIECES) P[id].el.setAttribute("transform", poseAttr(P[id].pose, id));
    strEl.setAttribute("y2", String(strY));
    if (cone) cone.setAttribute("transform", `translate(300 284) scale(${coneS}) translate(-300 -284)`);
    for (const b of [b1, b2]) {
      b.el.style.visibility = b.vis ? "visible" : "hidden";
      if (!b.vis) continue;
      const s = b.r / 22;
      b.el.style.transform = `translate3d(${b.x}px,${b.y + b.hop}px,0) scale(${s * b.sx},${s * b.sy}) rotate(${b.rot}deg)`;
    }
  };

  /* ------------------------------------------------------------ ui text */
  let toastT = 0;
  const toast = (msg: string) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.setAttribute("data-on", "");
    window.clearTimeout(toastT);
    toastT = window.setTimeout(() => toastEl.removeAttribute("data-on"), 2600);
  };
  const missing = () => PIECES.filter((id) => P[id].out);
  const status = (msg?: string) => {
    if (!statusEl) return;
    const m = missing();
    statusEl.textContent =
      msg ?? (m.length ? `Falta: ${m.map((id) => NAME[id]).join(", ")}. Devolvé la pieza a su silueta punteada.` : "Máquina lista.");
    root.toggleAttribute("data-jam", m.length > 0);
  };

  /* ------------------------------------------------------------ moves */
  const poseTo = (id: PieceId, to: Pose, dur: number, ease: Ease = inOut, hop = 0, spin = 0) => {
    const s = P[id];
    const from = { ...s.pose };
    return tween(dur, (p) => {
      s.pose.x = lerp(from.x, to.x, p);
      s.pose.y = lerp(from.y, to.y, p) - hop * 4 * p * (1 - p);
      s.pose.r = lerp(from.r, to.r + spin, p) - (p >= 1 ? spin : 0);
    }, ease);
  };
  const squash = async (b: Ball, amt = 0.28) => {
    await tween(70, (p) => { b.sx = 1 + amt * p; b.sy = 1 - amt * p; }, outQ);
    await tween(160, (p) => { b.sx = 1 + amt * (1 - p); b.sy = 1 - amt * (1 - p); }, outQ);
  };
  /** Ballistic-looking arc between two stage points; r tweens too. */
  const arcTo = (b: Ball, to: () => { x: number; y: number; r: number }, dur: number, lift = 70) => {
    const fx = b.x, fy = b.y, fr = b.r;
    b.where = "air";
    return tween(dur, (p) => {
      const t = to();
      const H = lift + Math.abs(t.x - fx) * 0.18;
      const nx = lerp(fx, t.x, p);
      b.rot += ((nx - b.x) / Math.max(4, b.r)) * 57.3;
      b.x = nx;
      b.y = lerp(fy, t.y, p) - H * 4 * p * (1 - p);
      b.r = lerp(fr, t.r, p);
    }, (t) => (t < 0.5 ? outQ(t * 2) / 2 : 0.5 + inQ((t - 0.5) * 2) / 2) * 0.35 + t * 0.65);
  };
  const svgSeg = (b: Ball, from: [number, number], to: [number, number], dur: number, ease: Ease) =>
    tween(dur, (p) => setSvg(b, lerp(from[0], to[0], p), lerp(from[1], to[1], p)), ease);

  const ballOnSaw = (deg: number) => {
    const [x, y] = seesawPoint(deg, BALL_ON_SEESAW[0], BALL_ON_SEESAW[1]);
    return [x, y] as [number, number];
  };

  /* ------------------------------------------------------------ the run */
  let running = false;
  let jammedOnce = false;

  const cutString = () => {
    void tween(260, (p) => { strY = lerp(STRING_FULL, STRING_CUT, p); }, outQ);
  };

  async function chain(S: number): Promise<void> {
    const g = gen;
    const alive = () => g === gen;
    running = true;
    root.setAttribute("data-running", "");
    const has = (id: PieceId) => !P[id].out;
    status("Corriendo…");

    // reset what is on the machine
    potOnSaw = false;
    if (S > 1) {
      const y0 = strY;
      const resets: Promise<boolean>[] = PIECES.filter(has).map((id) => poseTo(id, START[id], 280));
      resets.push(tween(280, (p) => { strY = lerp(y0, STRING_FULL, p); }));
      await Promise.all(resets);
      if (!alive()) return;
    }

    // ball to the top of the keyboard
    const [sx, sy] = onKeyboard(BALL_START_S);
    if (b1.vis && b1.where !== "gone") {
      await arcTo(b1, () => ({ x: ox + sx * k, y: oy + sy * k, r: BALL_R * k }), 520 * Math.min(S, 1.2), 90);
    } else {
      b1.vis = true;
      setSvg(b1, sx, sy);
      b1.sx = b1.sy = 0;
      await tween(120, (p) => { b1.sx = b1.sy = p; }, outQ);
      b1.sx = b1.sy = 1;
    }
    if (!alive()) return;
    b1.where = "svg";
    await beat();

    // 1. roll down the keyboard
    if (!(await tween(220 * S, (p) => { const [x, y] = onKeyboard(lerp(BALL_START_S, 1, p)); setSvg(b1, x, y); }, inQ))) return;
    await beat();

    // 2. push the gamepad → ruler → pick cuts the string
    let cut = false;
    let releasePot: () => void = () => {};
    const potGate = new Promise<void>((r) => (releasePot = r));
    let potDone: Promise<unknown> = Promise.resolve();
    const [kx, ky] = onKeyboard(1);
    if (has("pad")) {
      const push = tween(300 * S, (p) => {
        P.pad.pose.x = PUSH * p;
        if (has("ruler")) {
          P.ruler.pose.x = PUSH * p;
          if (!cut && PICK_TIP + PUSH * p >= STRING_X) {
            cut = true;
            cutString();
            if (has("pot")) {
              potDone = (async () => {
                // cartoon beat: the pot hangs in the air a moment
                const wob = tween(140, (q) => { P.pot.pose.r = Math.sin(q * 18) * 3 * (1 - q); });
                await Promise.race([potGate, wait(900 * S)]);
                await wob;
                if (!alive()) return;
                if (has("seesaw")) {
                  const land = potOnSeesaw(-SEESAW_TILT);
                  await poseTo("pot", land, 170 * S, inQ);
                  potOnSaw = true;
                } else {
                  await poseTo("pot", POT_FLOOR, 240 * S, inQ);
                }
              })();
            }
          }
        }
      }, outQ);
      const roll = svgSeg(b1, [kx, ky], [HOLE_X, SHELF_Y], 150 * S, outQ);
      await Promise.all([roll, beat()]);
      // the ball doesn't wait for the slow push; it drops as soon as the hole opens
      void push;
    } else {
      await svgSeg(b1, [kx, ky], [HOLE_X, SHELF_Y], 130 * S, lin);
    }
    if (!alive()) return;

    // 3. through the hole
    if (!has("book")) {
      releasePot();
      await svgSeg(b1, [HOLE_X, SHELF_Y], [178, FLOOR - BALL_R], 260 * S, inQ);
      void squash(b1, 0.2);
      await svgSeg(b1, [178, FLOOR - BALL_R], [150, FLOOR - BALL_R], 320 * S, outQ);
      return jam("book");
    }
    const [bx0, by0] = onBook(BOOK_S0);
    if (!(await svgSeg(b1, [HOLE_X, SHELF_Y], [bx0, by0], 100 * S, inQ))) return;
    await beat();
    if (!(await tween(120 * S, (p) => { const [x, y] = onBook(lerp(BOOK_S0, 1, p)); setSvg(b1, x, y); }, inQ))) return;
    await beat();

    // 4. drop onto the seesaw
    const [ex, ey] = onBook(1);
    releasePot();
    if (!has("seesaw")) {
      await svgSeg(b1, [ex, ey], [230, FLOOR - BALL_R], 220 * S, inQ);
      void squash(b1, 0.2);
      await svgSeg(b1, [230, FLOOR - BALL_R], [252, FLOOR - BALL_R], 300 * S, outQ);
      await potDone;
      return jam("seesaw");
    }
    if (!(await svgSeg(b1, [ex, ey], ballOnSaw(-SEESAW_TILT), 150 * S, inQ))) return;
    void squash(b1, 0.18);
    await potDone;
    if (!alive()) return;
    if (!cut || !has("pot") || !potOnSaw) {
      return jam(!has("pad") ? "pad" : !has("ruler") ? "ruler" : "pot");
    }
    await beat();

    // 5. flip and launch
    if (!(await tween(60 * S, (p) => {
      const deg = lerp(-SEESAW_TILT, SEESAW_TILT, p);
      P.seesaw.pose.r = deg;
      P.pot.pose = potOnSeesaw(deg);
      const [x, y] = ballOnSaw(deg);
      setSvg(b1, x, y);
    }, inQ))) return;
    coneS = 1.25;
    void tween(240, (p) => { coneS = lerp(1.25, 1, p); });

    if (!(await arcTo(b1, iDot, 320 * S, 110))) return;
    b1.where = "dot";
    root.removeAttribute("data-dotless");
    await squash(b1, 0.3);
    if (!alive()) return;
    running = false;
    root.removeAttribute("data-running");
    status();
    if (S > 1) toast(jammedOnce ? "Lo arreglaste vos. Así se resuelve." : "Punto a la i. Problema resuelto.");
    jammedOnce = false;
  }

  function jam(id: PieceId) {
    running = false;
    root.removeAttribute("data-running");
    b1.where = "svg";
    jammedOnce = true;
    status(`Se trabó: falta ${NAME[id]}.`);
    toast(`Se trabó. Sin ${NAME[id]} la i se queda sin punto.`);
  }

  /* ------------------------------------------------------------ states */
  const applyAfter = () => {
    for (const id of PIECES) P[id].pose = { ...(P[id].out ? FALLEN[id] : AFTER[id]) };
    strY = STRING_CUT;
    potOnSaw = true;
    coneS = 1;
    b1.vis = true;
    b1.where = "dot";
    b1.sx = b1.sy = 1;
    b1.hop = 0;
    measure();
    restAt(b1);
    root.removeAttribute("data-dotless");
    render();
  };

  const finishBoot = () => {
    booting = false;
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {}
    html.setAttribute("data-mq", calm ? "calm" : "done");
    running = false;
    root.removeAttribute("data-running");
  };

  let skippedAt = 0;
  const skip = () => {
    if (!booting) return;
    skippedAt = performance.now();
    cancelAll();
    applyAfter();
    finishBoot();
    status();
  };

  /* ------------------------------------------------------------ gags */
  const react = async (id: string) => {
    switch (id) {
      case "pad": {
        toast("Rumble. (Otro toque y se cae.)");
        const base = P.pad.pose.x;
        await tween(320, (p) => { P.pad.pose.x = base + Math.sin(p * 40) * 2 * (1 - p); });
        break;
      }
      case "ruler": {
        toast("30 cm. Bien medido. (Otro toque y se cae.)");
        await tween(360, (p) => { P.ruler.pose.r = Math.sin(p * 20) * 4 * (1 - p); });
        break;
      }
      case "pot": {
        toast("La planta está bien, gracias. (Otro toque y se cae.)");
        const r0 = P.pot.pose.r;
        await tween(500, (p) => { P.pot.pose.r = r0 + Math.sin(p * 14) * 6 * (1 - p); });
        break;
      }
      case "book": {
        toast("Capítulo 1: rebuscársela. (Otro toque y se cae.)");
        await tween(300, (p) => { P.book.pose.y = -6 * Math.sin(p * Math.PI); });
        break;
      }
      case "seesaw": {
        toast("Sube, baja. (Otro toque y se cae.)");
        const r0 = P.seesaw.pose.r;
        await tween(420, (p) => {
          P.seesaw.pose.r = r0 + Math.sin(p * 12) * 5 * (1 - p);
          if (potOnSaw && !P.pot.out) P.pot.pose = potOnSeesaw(P.seesaw.pose.r);
        });
        break;
      }
      case "keys":
        toast("git commit -m \"arreglado\"");
        svg.querySelectorAll(".mq-key").forEach((kEl, i) => {
          window.setTimeout(() => kEl.classList.add("on"), i * 30);
          window.setTimeout(() => kEl.classList.remove("on"), i * 30 + 160);
        });
        break;
      case "peg":
        toast("Mi. La sexta, al aire.");
        await tween(500, (p) => {
          strEl.setAttribute("x2", String(STRING_X + Math.sin(p * 50) * 3 * (1 - p)));
        });
        strEl.setAttribute("x2", String(STRING_X));
        break;
      case "speaker":
        toast("♪ Música para trabajar.");
        await tween(420, (p) => { coneS = 1 + Math.abs(Math.sin(p * 4 * Math.PI)) * 0.3 * (1 - p); });
        break;
    }
  };

  const knock = async (id: PieceId) => {
    const s = P[id];
    const hadFocus = document.activeElement === s.el;
    s.out = true;
    s.el.setAttribute("data-out", "");
    s.el.setAttribute("aria-label", `${s.el.getAttribute("aria-label")?.split(" (")[0]} (caído: Enter lo vuelve a su lugar)`);
    svg.insertBefore(s.wrap, svg.querySelector(".mq-ghosts"));
    if (hadFocus) s.el.focus({ preventScroll: true });
    s.ghost?.setAttribute("data-show", "");
    status();
    toast(`Uh, se cayó ${NAME[id]}. Arreglá la máquina vos: devolvé la pieza a su silueta.`);
    const jobs: Promise<unknown>[] = [poseTo(id, FALLEN[id], 560, inQ, 30, id === "pad" ? 180 : 0)];
    if (id === "seesaw" && potOnSaw && !P.pot.out) {
      potOnSaw = false;
      jobs.push(poseTo("pot", POT_FLOOR, 420, inQ));
    }
    if (b1.where === "svg" && b1.sv[1] < FLOOR - BALL_R - 1 && !running) {
      const [x, y] = b1.sv;
      jobs.push(svgSeg(b1, [x, y], [x, FLOOR - BALL_R], 380, inQ));
    }
    await Promise.all(jobs);
  };

  const restore = async (id: PieceId) => {
    const s = P[id];
    s.out = false;
    s.el.removeAttribute("data-out");
    s.el.setAttribute("aria-label", s.el.getAttribute("aria-label")?.split(" (")[0] ?? "");
    s.ghost?.removeAttribute("data-show");
    status();
    await poseTo(id, START[id], 300, outQ);
    if (!missing().length) toast("Quedó. Ahora probala.");
  };

  let dragEndAt = 0;
  const activate = (id: string, viaKey: boolean) => {
    const now = performance.now();
    if (running || booting || now - skippedAt < 450 || now - dragEndAt < 350) return;
    if (!(id in P)) return void react(id);
    const pid = id as PieceId;
    const s = P[pid];
    if (s.out) {
      if (viaKey) void restore(pid);
      else toast("Arrastrá la pieza hasta la silueta punteada.");
      return;
    }
    if (now - s.last < 1300) {
      s.last = 0;
      void knock(pid);
    } else {
      s.last = now;
      void react(pid);
    }
  };

  /* ------------------------------------------------------------ drag */
  let drag: { id: PieceId; px: number; py: number; moved: number; pid: number } | null = null;
  svg.addEventListener("pointerdown", (e) => {
    const g = (e.target as Element).closest<SVGGElement>("[data-p]");
    if (!g || running || booting) return;
    const id = g.getAttribute("data-p") as PieceId;
    if (!P[id].out) return;
    e.preventDefault();
    g.setPointerCapture(e.pointerId);
    drag = { id, px: e.clientX, py: e.clientY, moved: 0, pid: e.pointerId };
    void tween(140, (p) => { P[id].pose.r = lerp(P[id].pose.r, START[id].r, p); });
  }, on);
  svg.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const dx = (e.clientX - drag.px) / k;
    const dy = (e.clientY - drag.py) / k;
    drag.px = e.clientX;
    drag.py = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    const s = P[drag.id];
    s.pose.x += dx;
    s.pose.y += dy;
    render();
  }, on);
  const endDrag = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const { id, moved } = drag;
    drag = null;
    dragEndAt = performance.now();
    const s = P[id];
    const st = START[id];
    if (Math.hypot(s.pose.x - st.x, s.pose.y - st.y) < 34) {
      void restore(id);
    } else {
      if (moved < 3) toast("Arrastrá la pieza hasta la silueta punteada.");
      void poseTo(id, { x: s.pose.x, y: FALLEN[id].y, r: FALLEN[id].r }, 320, inQ);
    }
  };
  svg.addEventListener("pointerup", endDrag, on);
  svg.addEventListener("pointercancel", endDrag, on);
  svg.addEventListener("click", (e) => {
    const g = (e.target as Element).closest<SVGGElement>("[data-p],[data-s]");
    if (!g) return;
    const id = g.getAttribute("data-p") ?? g.getAttribute("data-s") ?? "";
    if (P[id as PieceId]?.out) return; // handled by drag
    activate(id, false);
  }, on);
  svg.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const g = (e.target as Element).closest<SVGGElement>("[data-p],[data-s]");
    if (!g) return;
    e.preventDefault();
    activate(g.getAttribute("data-p") ?? g.getAttribute("data-s") ?? "", true);
  }, on);

  runBtn?.addEventListener("click", () => {
    if (running || booting) return;
    if (scrolledAway) scrolledAway = false;
    root.setAttribute("data-dotless", "");
    void chain(calm ? 1 : 1.4);
  }, on);

  /* ------------------------------------------------------------ ball bumps + egg */
  let bumps: number[] = [];
  let egged = false;
  const bump = (b: Ball) => {
    if (b.where === "air" || b.where === "gone" || running || booting || performance.now() - skippedAt < 450) return;
    if (calm) {
      void squash(b, 0.3);
    } else if (!physics.has(hopFn(b))) {
      b.hv = -Math.max(380, b.r * 48);
      physics.add(hopFn(b));
      kick();
    }
    if (b !== b1 || egged) return;
    const now = performance.now();
    bumps = bumps.filter((t) => now - t < 4000).concat(now);
    if (bumps.length >= 3) void egg();
  };
  const hops = new Map<Ball, (dt: number) => boolean>();
  const hopFn = (b: Ball) => {
    let f = hops.get(b);
    if (!f) {
      f = (dt) => {
        b.hv += 2600 * dt;
        b.hop += b.hv * dt;
        b.rot += 240 * dt;
        if (b.hop >= 0) {
          b.hop = 0;
          b.hv = 0;
          void squash(b, 0.22);
          return false;
        }
        return true;
      };
      hops.set(b, f);
    }
    return f;
  };

  async function egg() {
    egged = true;
    const d = iDot();
    b2.vis = true;
    b2.r = d.r;
    b2.x = root.clientWidth + 40;
    b2.y = Math.max(20, d.y - 160);
    b2.where = "air";
    if (calm) {
      b2.where = "period";
      restAt(b2);
      render();
    } else {
      await arcTo(b2, () => { const t = iDot(); return { x: t.x + t.r * 0.6, y: t.y - t.r * 2, r: t.r }; }, 520, 60);
      void squash(b1, 0.35);
      await arcTo(b2, pDot, 460, 90);
      b2.where = "period";
      await squash(b2, 0.3);
    }
    root.setAttribute("data-egg", "");
    toast("Llegó refuerzo. Esto se juega en equipo.");
  }

  b1El.addEventListener("click", () => bump(b1), on);
  b2El.addEventListener("click", () => bump(b2), on);

  /* ------------------------------------------------------------ scroll → next section */
  let scrolledAway = false;
  const rampH = () => parseFloat(getComputedStyle(stub).getPropertyValue("--ramp")) || 56;
  const onScroll = () => {
    if (booting || running) return;
    const y = window.scrollY;
    if (!scrolledAway && y > 60 && b1.where === "dot" && b1.hop === 0) {
      scrolledAway = true;
      void exitBall();
    } else if (scrolledAway && y < 12 && b1.where === "gone") {
      scrolledAway = false;
      void returnBall();
    }
  };
  async function exitBall() {
    root.setAttribute("data-dotless", "");
    const W = root.clientWidth;
    const s = rel(stub as HTMLElement);
    const H = rampH();
    const r = b1.r;
    const at = (x: number) => ({ x, y: s.y + (x / W) * H - r * 1.05, r });
    const x0 = clamp(b1.x + 40, 24, W * 0.6);
    if (calm) {
      b1.where = "gone";
      b1.vis = false;
      render();
      return;
    }
    await arcTo(b1, () => at(x0), 620, 60);
    b1.where = "air";
    await tween(900, (p) => {
      const t = at(lerp(x0, W + r * 3, p));
      b1.rot += ((t.x - b1.x) / r) * 57.3;
      b1.x = t.x;
      b1.y = t.y;
    }, inQ);
    b1.where = "gone";
    b1.vis = false;
    render();
  }
  async function returnBall() {
    const d = iDot();
    b1.vis = true;
    b1.r = d.r;
    b1.x = d.x;
    b1.y = d.y - 260;
    b1.where = "air";
    await tween(420, (p) => { b1.y = lerp(d.y - 260, iDot().y, p); }, inQ);
    b1.where = "dot";
    root.removeAttribute("data-dotless");
    restAt(b1);
    await squash(b1, 0.3);
  }
  window.addEventListener("scroll", onScroll, { passive: true, signal: ac.signal });

  /* ------------------------------------------------------------ pause + resize */
  const io = new IntersectionObserver(([en]) => {
    onScreen = en.isIntersecting;
    kick();
  });
  io.observe(root);
  document.addEventListener("visibilitychange", kick, on);
  const reflow = () => {
    measure();
    if (!running) {
      restAt(b1);
      restAt(b2);
    }
    render();
  };
  const ro = new ResizeObserver(reflow);
  ro.observe(root);
  void document.fonts?.ready.then(reflow);

  /* ------------------------------------------------------------ boot */
  html.setAttribute("data-mq-ready", "");
  measure();
  if (booting) {
    for (const id of PIECES) P[id].pose = { ...START[id] };
    strY = STRING_FULL;
    potOnSaw = false;
    root.setAttribute("data-dotless", "");
    render();
    html.setAttribute("data-mq", "run");
    const skipEv = () => skip();
    window.addEventListener("pointerdown", skipEv, { capture: true, signal: ac.signal });
    window.addEventListener("keydown", skipEv, { capture: true, signal: ac.signal });
    void (async () => {
      const g = gen;
      await wait(120);
      if (g !== gen) return;
      await chain(1);
      if (g !== gen) return;
      finishBoot();
    })();
  } else {
    applyAfter();
    finishBoot();
    status();
  }

  return () => {
    ac.abort();
    cancelAll();
    io.disconnect();
    ro.disconnect();
    if (raf) cancelAnimationFrame(raf);
    window.clearTimeout(toastT);
  };
}
