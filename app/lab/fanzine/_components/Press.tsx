"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { BOOT_KEY, BOOT_MS } from "./print";
import { Halftone } from "./Halftone";

/* ------------------------------------------------------------------ */
/* Shared state                                                        */
/* ------------------------------------------------------------------ */

type PressCtx = {
  yellow: boolean;
  toggleYellow: () => void;
  reregister: () => void;
};

const Ctx = createContext<PressCtx>({
  yellow: false,
  toggleYellow: () => {},
  reregister: () => {},
});

const usePress = () => useContext(Ctx);

type Stamp = {
  id: number;
  x: number;
  y: number;
  word: string;
  rot: number;
  ink: "p" | "b";
  mx: number;
  my: number;
};

const WORDS = ["Aprobado", "OK", "Visto", "Original", "¡Joya!", "De acuerdo", "Chequeado"];
const MAX_STAMPS = 36;
/** Stamping this many times inside JAM_WINDOW jams the printer. */
const JAM_COUNT = 7;
const JAM_WINDOW = 2400;
const SECRET = "amarillo";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/* ------------------------------------------------------------------ */
/* The press: boot controller + stamps + jam + hidden ink              */
/* ------------------------------------------------------------------ */

export function Press({ children }: { children: ReactNode }) {
  const pressRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const nextId = useRef(0);
  const recent = useRef<number[]>([]);
  const jamBtn = useRef<HTMLButtonElement>(null);

  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [jam, setJam] = useState(false);
  const [yellow, setYellow] = useState(false);
  const [mis, setMis] = useState<{ x: number; y: number; r: number } | null>(null);

  const finishLater = useCallback((root: HTMLElement) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (root.dataset.boot === "run") root.dataset.boot = "done";
    }, BOOT_MS);
  }, []);

  // Boot. On a hard load the inline script in page.tsx already decided
  // (before first paint). On a client-side navigation it never ran, so we
  // decide here, before paint too.
  useLayoutEffect(() => {
    const root = pressRef.current?.closest<HTMLElement>(".fz");
    if (!root) return;
    rootRef.current = root;
    if (!root.dataset.boot) {
      let booted = false;
      try {
        booted = !!sessionStorage.getItem(BOOT_KEY);
        if (!booted) sessionStorage.setItem(BOOT_KEY, "1");
      } catch {
        /* private mode: just print */
      }
      root.dataset.boot = booted ? "done" : "run";
      if (!booted) finishLater(root);
    }
    const skip = () => {
      if (root.dataset.boot !== "run") return;
      root.dataset.boot = "done";
      root.dataset.skipped = String(Date.now());
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.clearTimeout(timer.current);
    };
  }, [finishLater]);

  // Hidden ink: type "amarillo" anywhere.
  useEffect(() => {
    let buf = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
      if (buf === SECRET) setYellow(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (jam) jamBtn.current?.focus();
  }, [jam]);

  const onStamp = (e: MouseEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    const press = pressRef.current;
    if (!root || !press || jam) return;
    if (root.dataset.boot === "run") return;
    // the tap that skipped the loader shouldn't also stamp
    if (Date.now() - Number(root.dataset.skipped ?? 0) < 450) return;
    const t = e.target as Element;
    if (t.closest("a, button, input, [data-nostamp]")) return;
    if (e.detail === 0) return; // keyboard "click"

    const box = press.getBoundingClientRect();
    const now = Date.now();
    recent.current = [...recent.current.filter((s) => now - s < JAM_WINDOW), now];
    const id = nextId.current++;
    const stamp: Stamp = {
      id,
      x: e.clientX - box.left,
      y: e.clientY - box.top,
      word: WORDS[Math.floor(Math.random() * WORDS.length)],
      rot: rand(-14, 14),
      ink: Math.random() < 0.62 ? "p" : "b",
      mx: Math.round(rand(0, 160)),
      my: Math.round(rand(0, 160)),
    };
    setStamps((s) => [...s.slice(-(MAX_STAMPS - 1)), stamp]);
    if (recent.current.length >= JAM_COUNT) {
      recent.current = [];
      setJam(true);
    }
  };

  const clearJam = () => {
    setJam(false);
    setStamps([]);
    const root = rootRef.current;
    if (!root) return;
    // reprint the sheet: replaying the boot sequence restarts the drum passes
    root.dataset.boot = "done";
    void root.offsetWidth;
    root.dataset.boot = "run";
    finishLater(root);
  };

  const ctx = useMemo<PressCtx>(
    () => ({
      yellow,
      toggleYellow: () => setYellow((y) => !y),
      reregister: () => {
        const pick = (m: number) => {
          const v = rand(1.5, m);
          return Math.round((Math.random() < 0.5 ? -v : v) * 10) / 10;
        };
        setMis({ x: pick(7), y: pick(5), r: pick(0.5) });
      },
    }),
    [yellow],
  );

  const style = mis
    ? ({
        "--mx": `${mis.x}px`,
        "--my": `${mis.y}px`,
        "--mr": `${mis.r}deg`,
      } as CSSProperties)
    : undefined;

  return (
    <Ctx.Provider value={ctx}>
      <div
        ref={pressRef}
        className="fz-press"
        data-jam={jam || undefined}
        data-yellow={yellow || undefined}
        style={style}
        onClick={onStamp}
      >
        {children}
        <div className="fz-stamps" aria-hidden="true">
          {stamps.map((s) => (
            <span
              key={s.id}
              className={`fz-stamp fz-stamp--${s.ink}`}
              style={
                {
                  left: s.x,
                  top: s.y,
                  "--r": `${s.rot.toFixed(1)}deg`,
                  "--mp": `${s.mx}px ${s.my}px`,
                } as CSSProperties
              }
            >
              {s.word}
            </span>
          ))}
        </div>
        <div className="fz-grain" aria-hidden="true" />
      </div>
      {jam && (
        <div
          className="fz-jam"
          role="alertdialog"
          aria-labelledby="fz-jam-t"
          aria-describedby="fz-jam-d"
          data-nostamp
        >
          <p id="fz-jam-t" className="fz-jam__t">
            Atasco de papel
          </p>
          <p id="fz-jam-d" className="fz-jam__d">
            Demasiados sellos en muy poco tiempo. La hoja quedó trabada en el
            tambor.
          </p>
          <button ref={jamBtn} type="button" className="fz-jam__b" onClick={clearJam}>
            Abrir la tapa y sacar la hoja
          </button>
        </div>
      )}
    </Ctx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Real time in Buenos Aires (client only, no fake clocks)             */
/* ------------------------------------------------------------------ */

const TZ = "America/Argentina/Buenos_Aires";
const timeFmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dateFmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const tick = (cb: () => void) => {
  const id = window.setInterval(cb, 10_000);
  return () => window.clearInterval(id);
};
const noSnap = () => null;
const nowTime = () => timeFmt.format(new Date());
const nowDate = () => dateFmt.format(new Date()).replace(/\//g, "·");

export function BaClock() {
  const t = useSyncExternalStore(tick, nowTime, noSnap);
  return (
    <time className="fz-clock" suppressHydrationWarning>
      {t ?? "--:--"}
    </time>
  );
}

/** The last beat of the print run: a dated stamp lands on the cover. */
export function DateStamp() {
  const d = useSyncExternalStore(tick, nowDate, noSnap);
  if (!d) return null;
  return (
    <span className="fz-datestamp" aria-hidden="true">
      <span className="fz-datestamp__big">Impreso</span>
      <span className="fz-datestamp__small">{d}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Clickable print furniture                                           */
/* ------------------------------------------------------------------ */

export function RegMarkButton({ className }: { className: string }) {
  const { reregister } = usePress();
  return (
    <button
      type="button"
      className={`fz-reg ${className}`}
      onClick={reregister}
      aria-label="Correr el registro de las tintas"
      title="Registro"
    >
      <RegMarkSvg />
    </button>
  );
}

export function RegMarkSvg() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="14" cy="14" r="7" />
        <path d="M14 1v26M1 14h26" />
      </g>
      <circle cx="14" cy="14" r="3" fill="currentColor" />
    </svg>
  );
}

export function YellowSwitch() {
  const { yellow, toggleYellow } = usePress();
  return (
    <>
      Tambor 3:{" "}
      <button
        type="button"
        className="fz-secret"
        onClick={toggleYellow}
        aria-pressed={yellow}
      >
        Yellow
      </button>
      {yellow ? ", ¡en uso! Ahora son tres tintas." : ", cargado, sin usar."}
    </>
  );
}

/** Third plate. Only computed and mounted when someone finds it. */
export function YellowPlate() {
  const { yellow } = usePress();
  if (!yellow) return null;
  return (
    <div className="fz-plate fz-plate--y" aria-hidden="true">
      <Halftone className="fz-sun fz-sun--y" step={13} angle={0} light={[0.75, 0.2]} near={0.95} far={0.15} />
    </div>
  );
}
