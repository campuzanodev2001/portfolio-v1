/**
 * Motor de "Que entre". Sin React ni librerías: atributos `data-*` que lee
 * el CSS y unas pocas variables por elemento.
 *
 *  - FIT: cada `[data-fit]` mide su caja y resuelve el `wdth` (50–150) para
 *    que la palabra entre justo. Si a 150 le sobra, se justifica con
 *    letter-spacing; si a 50 no entra, recién ahí achica el cuerpo. Se mide
 *    en lote (3–4 layouts para todas las palabras de la página).
 *  - LENTE: con el puntero cerca, cada letra cambia de `wght`; como el peso
 *    cambia el ancho, el resto se reacomoda (wdth) cuadro a cuadro para que la
 *    palabra siga entrando.
 *  - SCROLL: la velocidad tuerce el nombre (skew + GRAD, que no cambia el
 *    ancho), corre las hiladas de ladrillos y acelera las cintas. El pie
 *    ondula su peso con el progreso y se reajusta en vivo.
 *  - Juguetes y huevos: achicá la caja, sello, logo, «caja», «entra»,
 *    ladrillo flojo, retrato, filtro por herramienta, mail que se copia,
 *    sello de velocidad.
 *
 * El loop de rAF duerme cuando no hay nada que mover.
 */

const MIN = 50;
const MAX = 150;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

type Rec = {
  el: HTMLElement;
  inn: HTMLElement;
  chars: HTMLElement[];
  fit: number;
  lens: boolean;
  wave: boolean;
  hero: boolean;
  hold: boolean;
  vis: boolean;
  amt: number; // intensidad de la lente 0..1
  lw: number[];
  live: boolean;
};

const restart = (el: Element, attr: string, value = "") => {
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

export function mount(root: HTMLElement): () => void {
  const ac = new AbortController();
  const on = { signal: ac.signal } as const;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s);
  const $$ = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));

  /* ---------------------------------------------------------------- toast */
  const live = $("[data-live]");
  let liveT = 0;
  const say = (m: string) => {
    if (!live) return;
    live.textContent = m;
    live.setAttribute("data-on", "");
    clearTimeout(liveT);
    liveT = window.setTimeout(() => {
      live.removeAttribute("data-on");
      liveT = window.setTimeout(() => (live.textContent = ""), 400);
    }, 3600);
  };

  /* ------------------------------------------------------------------ fit */
  const heroBox = $("[data-box]");
  const recs: Rec[] = $$("[data-fit]").map((el) => {
    const inn = el.querySelector<HTMLElement>(".fit-in")!;
    const chars = Array.from(inn.querySelectorAll<HTMLElement>(".ch"));
    return {
      el,
      inn,
      chars,
      fit: 100,
      lens: el.hasAttribute("data-lens"),
      wave: el.hasAttribute("data-wave"),
      hero: !!el.closest("[data-hero]"),
      hold: false,
      vis: false,
      amt: 0,
      lw: chars.map(() => 0),
      live: false,
    };
  });
  const byEl = new Map(recs.map((r) => [r.el as Element, r]));
  const heroRecs = recs.filter((r) => r.hero);
  const daniel = heroRecs[0];
  let heroReady = false;

  const setFit = (r: Rec) => r.el.style.setProperty("--fit", r.fit.toFixed(2));
  const width = (r: Rec) => r.inn.getBoundingClientRect().width;
  const target = (r: Rec) => r.el.clientWidth;

  function solve(list: Rec[], animate = false) {
    list = list.filter((r) => r.el.isConnected && !r.hold && (heroReady || !r.hero));
    if (!list.length) return;
    const from = list.map((r) => r.fit);
    root.setAttribute("data-measuring", "");
    for (const r of list) {
      r.inn.style.fontSize = "";
      r.inn.style.removeProperty("--ls");
      r.fit = 100;
      setFit(r);
    }
    // Iteración 0 a wdth 100, 1 proporcional, 2–3 secante. Lectura en lote.
    const prev = list.map(() => ({ f: 100, w: 0 }));
    for (let it = 0; it < 4; it++) {
      const ws = list.map(width);
      const ts = list.map(target);
      list.forEach((r, k) => {
        const w = ws[k];
        const t = ts[k];
        if (!w || !t) return;
        let f: number;
        if (it === 0 || Math.abs(w - prev[k].w) < 0.5) f = r.fit * (t / w);
        else f = r.fit + ((t - w) * (r.fit - prev[k].f)) / (w - prev[k].w);
        prev[k] = { f: r.fit, w };
        r.fit = clamp(Number.isFinite(f) ? f : 100, MIN, MAX);
        setFit(r);
      });
    }
    // Rebusque final: justificar si sobra, achicar el cuerpo si ni a 50 entra.
    const ws = list.map(width);
    list.forEach((r, k) => {
      const t = target(r);
      const w = ws[k];
      if (!w || !t) return;
      if (w > t * 1.004) {
        const fs = parseFloat(getComputedStyle(r.inn).fontSize);
        r.inn.style.fontSize = `${((fs * t) / w).toFixed(2)}px`;
      } else if (r.fit >= MAX - 0.01 && w < t * 0.995 && r.chars.length > 1) {
        r.inn.style.setProperty("--ls", `${((t - w) / (r.chars.length - 1)).toFixed(2)}px`);
      }
      r.el.setAttribute("data-wd", `wdth ${r.fit.toFixed(1)}`);
    });
    if (animate && !rm) {
      list.forEach((r, k) => r.el.style.setProperty("--fit", from[k].toFixed(2)));
      void root.offsetWidth;
      root.removeAttribute("data-measuring");
      list.forEach(setFit);
    } else root.removeAttribute("data-measuring");
    if (list.includes(daniel)) readout();
  }

  const readoutEl = $("[data-readout]");
  let boxPct = 100;
  function readout() {
    if (readoutEl && daniel) readoutEl.textContent = `caja ${boxPct}% · wdth ${daniel.fit.toFixed(0)}`;
  }

  // Re-ajuste al cambiar el ancho de cada caja (y la primera medición).
  const dirty = new Set<Rec>();
  let dirtyRaf = 0;
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const r = byEl.get(e.target);
      if (r && !r.live) dirty.add(r);
    }
    if (!dirtyRaf)
      dirtyRaf = requestAnimationFrame(() => {
        dirtyRaf = 0;
        solve([...dirty]);
        dirty.clear();
      });
  });
  recs.forEach((r) => ro.observe(r.el));
  document.fonts?.ready.then(() => !ac.signal.aborted && solve(recs));

  // Visibilidad: lente, ola y loop sólo trabajan con lo que está en pantalla.
  const vis = new Map<Element, boolean>();
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        vis.set(e.target, e.isIntersecting);
        const r = byEl.get(e.target);
        if (r) r.vis = e.isIntersecting;
      }
    },
    { rootMargin: "80px 0px" },
  );
  recs.forEach((r) => (r.lens || r.wave) && io.observe(r.el));
  const rows = $$("[data-row]");
  rows.forEach((r) => io.observe(r));

  /* --------------------------------------------------------------- stage */
  const onStage = () => {
    if (heroReady || root.getAttribute("data-stage") !== "done") return;
    heroReady = true;
    solve(heroRecs, true);
  };
  root.addEventListener("stage", onStage, on);
  onStage();

  /* -------------------------------------------------- scroll-driven squeeze */
  // Con scroll-timeline lo hace el CSS solo. Si no hay, IO + transición.
  let sqIo: IntersectionObserver | null = null;
  if (!rm && !CSS.supports("animation-timeline: view()")) {
    root.classList.add("sq-js");
    sqIo = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            sqIo?.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    $$("[data-sq]").forEach((el) => sqIo!.observe(el));
  }

  /* ------------------------------------------------------------ the loop */
  const ptr = { x: -9999, y: -9999, on: false };
  let lastY = window.scrollY;
  let lastT = performance.now();
  let sv = 0;
  let dy = 0;
  let raf = 0;
  let speedAt = 0;
  const heroH = $("[data-hero]");
  const speedEl = $("[data-speed]");
  const tapeAnims = () => $$("[data-tape]").flatMap((t) => t.getAnimations());
  let tapes: Animation[] = [];
  const rowX = rows.map(() => 0);
  const rowHalf = rows.map(() => 0);
  addEventListener("resize", () => rowHalf.fill(0), { passive: true, signal: ac.signal });
  const foot = recs.find((r) => r.wave);

  const kick = () => {
    if (!raf && !rm) {
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  function frame(t: number) {
    raf = 0;
    const dt = clamp(t - lastT, 1, 64);
    lastT = t;
    const y = window.scrollY;
    dy = y - lastY;
    lastY = y;
    const v = dy / dt;
    sv += (v - sv) * 0.12;
    let busy = Math.abs(sv) > 0.004 || dy !== 0;

    // Nombre: se tuerce y se engorda (GRAD no cambia el ancho).
    if (heroH) {
      heroH.style.setProperty("--skew", clamp(-sv * 3.2, -9, 9).toFixed(2));
      heroH.style.setProperty("--gv", clamp(Math.abs(sv) * 45, 0, 100).toFixed(0));
    }

    // Hiladas: se corren con el scroll, más rápido cuanto más rápido vas.
    rows.forEach((row, k) => {
      if (!vis.get(row) || !dy) return;
      const dir = Number(row.dataset.row) || 1;
      const inner = row.firstElementChild as HTMLElement;
      const half = (rowHalf[k] ||= inner.scrollWidth / 2) || 1;
      rowX[k] -= dy * 0.45 * dir * (1 + Math.min(Math.abs(sv) * 0.9, 3));
      rowX[k] = ((rowX[k] % half) - half) % half;
      inner.style.transform = `translate3d(${rowX[k].toFixed(1)}px,0,0)`;
    });

    // Cintas: aceleran y cambian de sentido con el scroll.
    if (!tapes.length) tapes = tapeAnims();
    const rate = busy ? (sv >= 0 ? 1 : -1) * (1 + Math.min(Math.abs(sv) * 3.5, 7)) : 1;
    tapes.forEach((a) => (a.playbackRate = rate));

    // Sello de velocidad.
    if (Math.abs(v) > 6 && t - speedAt > 9000 && speedEl) {
      speedAt = t;
      restart(speedEl, "data-on");
      later(() => speedEl.removeAttribute("data-on"), 1300);
    }

    // Lente + ola: leer todo, después escribir todo.
    const active = recs.filter((r) => (r.lens && (r.vis || r.amt > 0.001)) || (r.wave && r.vis && (dy || r.live)));
    const reads = active.map((r) => {
      const box = r.el.getBoundingClientRect();
      const centers = r.lens ? r.chars.map((c) => {
        const b = c.getBoundingClientRect();
        return [b.left + b.width / 2, b.top + b.height / 2];
      }) : [];
      return { box, centers, w: width(r), t: r.el.clientWidth, fs: parseFloat(getComputedStyle(r.inn).fontSize) };
    });
    active.forEach((r, k) => {
      if (r.hold || (r.hero && !heroReady)) return;
      const { box, centers, w, t: tw, fs } = reads[k];
      let moving = false;
      if (r.lens) {
        const near =
          ptr.on &&
          ptr.x > box.left - 60 &&
          ptr.x < box.right + 60 &&
          ptr.y > box.top - fs * 0.6 &&
          ptr.y < box.bottom + fs * 0.6;
        const want = near ? 1 : 0;
        r.amt += (want - r.amt) * 0.12;
        if (Math.abs(want - r.amt) < 0.002) r.amt = want;
        else moving = true;
        r.chars.forEach((c, i) => {
          const [cx, cy] = centers[i];
          const d = Math.hypot(ptr.x - cx, ptr.y - cy);
          const n = clamp(1 - d / (fs * 1.5), 0, 1);
          const tgt = r.amt * (-380 + 480 * n);
          r.lw[i] += (tgt - r.lw[i]) * 0.2;
          if (Math.abs(r.lw[i]) < 0.5 && r.amt === 0) r.lw[i] = 0;
          c.style.setProperty("--lw", r.lw[i].toFixed(0));
          if (Math.abs(tgt - r.lw[i]) > 0.5) moving = true;
        });
      }
      if (r.wave && foot) {
        const p = clamp(1 - (box.top - window.innerHeight * 0.2) / window.innerHeight, 0, 1);
        r.chars.forEach((c, i) => {
          const tgt = -420 + 420 * (0.5 + 0.5 * Math.sin(p * Math.PI * 2.4 + i * 0.62));
          r.lw[i] += (tgt - r.lw[i]) * 0.25;
          c.style.setProperty("--lw", r.lw[i].toFixed(0));
          if (Math.abs(tgt - r.lw[i]) > 0.5) moving = true;
        });
      }
      // Reajuste en vivo: que siga entrando aunque las letras cambien de peso.
      if (moving) {
        if (!r.live) {
          r.live = true;
          r.el.setAttribute("data-live", "");
        }
        if (w && tw) {
          r.fit = clamp(r.fit * (tw / w), MIN, MAX);
          setFit(r);
          if (r === daniel) readout();
        }
        busy = true;
      } else if (r.live) {
        r.live = false;
        r.el.removeAttribute("data-live");
        if (r.lw.every((x) => x === 0)) solve([r]);
      }
    });

    if (busy) raf = requestAnimationFrame(frame);
    else tapes.forEach((a) => (a.playbackRate = 1));
  }

  if (!rm) {
    addEventListener("scroll", kick, { passive: true, signal: ac.signal });
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.buttons === 0 && e.type === "pointermove") return;
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.on = true;
      kick();
    };
    addEventListener("pointermove", move, { passive: true, signal: ac.signal });
    addEventListener("pointerdown", move, { passive: true, signal: ac.signal });
    const leave = () => {
      ptr.on = false;
      kick();
    };
    document.documentElement.addEventListener("pointerleave", leave, on);
    addEventListener(
      "pointerup",
      (e) => {
        if (e.pointerType !== "mouse") leave();
      },
      { passive: true, signal: ac.signal },
    );
    addEventListener("pointercancel", leave, { passive: true, signal: ac.signal });
    if (!fine) root.classList.add("touch");
  }

  /* -------------------------------------------------------- achicá la caja */
  const STEPS = [100, 78, 58, 40, 26];
  const SAY: Record<number, string> = {
    100: "Le devolví el lugar. Volvió a entrar en una línea.",
    78: "Le saqué un 22 %. Se apretó un poco y entró.",
    58: "Más chica todavía. Se aprieta más.",
    40: "Ya no entra en una línea: se partió en dos.",
    26: "Ni así se rinde. Entró igual.",
  };
  let step = 0;
  let shrinking = false;
  const shrinkLabel = $("[data-shrink-label]");
  const shrink = () => {
    if (!daniel || !heroBox || shrinking || !heroReady) return;
    shrinking = true;
    step = (step + 1) % STEPS.length;
    boxPct = STEPS[step];
    daniel.hold = true;
    const stack = boxPct < 50;
    if (!stack) daniel.el.removeAttribute("data-stack");
    heroBox.style.setProperty("--box", String(boxPct));
    restart(heroBox, "data-hit");
    readout();
    later(
      () => {
        if (stack) daniel.el.setAttribute("data-stack", "");
        daniel.hold = false;
        solve([daniel], true);
        later(() => {
          heroBox.removeAttribute("data-hit");
          const ok = $("[data-restamp]");
          if (ok) restart(ok, "data-again");
          shrinking = false;
        }, rm ? 0 : 520);
      },
      rm ? 0 : 360,
    );
    say(SAY[boxPct]);
    if (shrinkLabel) shrinkLabel.textContent = step === STEPS.length - 1 ? "Devolvele el lugar" : "Achicá la caja";
  };
  $("[data-shrink]")?.addEventListener("click", shrink, on);
  heroBox?.addEventListener(
    "click",
    (e) => {
      if ((e.target as HTMLElement).closest("[data-restamp]")) return;
      shrink();
    },
    on,
  );

  /* ------------------------------------------------------------ clickables */
  root.addEventListener(
    "click",
    (e) => {
      const el = e.target as HTMLElement;

      const ok = el.closest<HTMLElement>("[data-restamp]");
      if (ok) {
        ok.style.setProperty("--rot", `${(Math.random() * 16 - 8).toFixed(1)}deg`);
        restart(ok, "data-again");
        return;
      }

      if (el.closest("[data-logo]") && heroH) {
        restart(heroH, "data-replay");
        later(() => heroH.removeAttribute("data-replay"), 1400);
        return;
      }

      const knock = el.closest<HTMLElement>("[data-knock]");
      if (knock) {
        restart(knock, "data-knocked");
        if (knock.hasAttribute("data-loose")) {
          const n = Number(knock.dataset.n || 0) + 1;
          knock.dataset.n = String(n);
          if (n === 3) {
            knock.closest("li")?.setAttribute("data-out", "");
            const hole = $("[data-hole]");
            if (hole) hole.textContent = "Sacaste el ladrillo flojo. Bien: así se arranca a arreglar algo.";
          }
        }
        return;
      }

      const portrait = el.closest<HTMLElement>("[data-portrait]");
      if (portrait) {
        const st = $("[data-photo-stamp]");
        const lines = ["A mí no me achicás", "Probá con la caja de arriba", "Entra justo"];
        const n = (Number(portrait.dataset.n || 0) + 1) % lines.length;
        portrait.dataset.n = String(n);
        restart(portrait, "data-squish");
        if (st) st.textContent = lines[(n + lines.length - 1) % lines.length];
        return;
      }

      const chip = el.closest<HTMLElement>("[data-tech]");
      if (chip) {
        const tech = chip.dataset.tech!;
        const projs = $("[data-projs]");
        const was = chip.getAttribute("aria-pressed") === "true";
        $$("[data-tech]").forEach((c) => c.setAttribute("aria-pressed", "false"));
        $$(".proj").forEach((p) => p.removeAttribute("data-hit"));
        if (was || !projs) {
          projs?.removeAttribute("data-filter");
          say("Sin filtro: todos los proyectos.");
          return;
        }
        chip.setAttribute("aria-pressed", "true");
        projs.setAttribute("data-filter", "");
        let n = 0;
        $$(".proj").forEach((p) => {
          if ((p.dataset.stack || "").split("|").includes(tech)) {
            p.setAttribute("data-hit", "");
            n++;
          }
        });
        say(`${tech}: ${n} ${n === 1 ? "proyecto" : "proyectos"}. Tocalo de nuevo para sacar el filtro.`);
        return;
      }

      const mail = el.closest<HTMLAnchorElement>("[data-mail]");
      // Primer toque: copia. Segundo (dentro de 6 s): abre el correo.
      if (mail && navigator.clipboard && Date.now() - Number(mail.dataset.at || 0) > 6000) {
        e.preventDefault();
        mail.dataset.at = String(Date.now());
        const addr = mail.dataset.mail!;
        navigator.clipboard.writeText(addr).then(
          () => {
            restart(mail, "data-copied");
            const note = $("[data-mail-note]");
            if (note) note.textContent = "Copiado. Pegalo donde quieras, o tocalo otra vez y se abre tu correo.";
            say(`Copiado: ${addr}`);
          },
          () => (location.href = mail.href),
        );
      }
    },
    on,
  );

  /* ------------------------------------------------------- palabras tipeadas */
  let buf = "";
  addEventListener(
    "keydown",
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-8);
      if (buf.endsWith("caja")) {
        const onX = root.toggleAttribute("data-xray");
        say(onX ? "Rayos X: cada palabra con su wdth. Tipeá «caja» otra vez para salir." : "Rayos X apagados.");
        buf = "";
      } else if (buf.endsWith("entra")) {
        restart(root, "data-replay-all");
        later(() => root.removeAttribute("data-replay-all"), 1500);
        say("Otra vez: todo se apretó hasta entrar.");
        buf = "";
      }
    },
    on,
  );

  /* ------------------------------------------------------------------ hora */
  const clock = $("[data-clock]");
  const tick = () => clock && (clock.textContent = baTime());
  tick();
  const clockT = window.setInterval(tick, 30000);

  console.log(
    "%cQue entre.%c ¿Mirando el código? Tipeá «caja» en la página, o escribime: danicampu56@gmail.com",
    "font:800 16px serif;background:#B8975A;color:#0E0D0B;padding:2px 6px;border:2px solid #0E0D0B",
    "font:12px monospace",
  );

  return () => {
    ac.abort();
    ro.disconnect();
    io.disconnect();
    sqIo?.disconnect();
    cancelAnimationFrame(raf);
    cancelAnimationFrame(dirtyRaf);
    clearInterval(clockT);
    clearTimeout(liveT);
    timers.forEach(clearTimeout);
  };
}
