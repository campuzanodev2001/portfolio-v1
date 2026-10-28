"use client";

import { useEffect, useRef } from "react";
import { Pixel } from "./Pixel";

/**
 * Intro de pantalla completa: "Clawd arma el portfolio". Al principio solo
 * está la línea de comandos, con Clawd dormido arriba. Daniel tipea la orden,
 * Clawd se despierta sobresaltado, levanta el pulgar ("¡A la orden!") y arma
 * el hero desde cero: cada herramienta que usa queda en la consola, como en
 * Claude Code, y la pieza que crea sale volando de él hasta su lugar real.
 * Al final la consola se mete en la del hero y el loop del canvas arranca.
 *
 * La activa el script inline de page.tsx (`.cl[data-intro]`). Cualquier tecla
 * o un toque la saltea. Las piezas del hero se marcan con [data-build].
 */

type Kind = "you" | "say" | "think" | "tool" | "out";
type Mood = "sleep" | "startle" | "thumbs" | "work" | "throw";
type Cue = { at: number; line?: [Kind, string]; mood?: Mood; build?: string };

const ORDER = "Clawd, armá el portfolio";
const TYPE_AT = 0.7;
const TYPE_MS = 0.055;
const ENTER = TYPE_AT + ORDER.length * TYPE_MS + 0.35;

const CUES: Cue[] = [
  { at: ENTER, line: ["you", ORDER] },
  { at: ENTER + 0.25, mood: "startle" },
  { at: ENTER + 1.0, mood: "thumbs" },
  { at: ENTER + 1.15, line: ["say", "¡A la orden!"] },
  { at: ENTER + 2.1, mood: "work", line: ["think", "Pensando por dónde arrancar"] },
  { at: ENTER + 3.0, line: ["tool", "Leer(docs/HECHOS.md)"] },
  { at: ENTER + 3.4, line: ["out", "todo lo que hay que saber de Daniel"] },
  { at: ENTER + 4.0, line: ["tool", "CrearBarra(navegación)"], mood: "throw", build: "nav" },
  { at: ENTER + 4.5, mood: "work" },
  { at: ENTER + 4.9, line: ["tool", "BuscarEnLaWeb(“cómo titular un portfolio”)"] },
  { at: ENTER + 5.6, line: ["out", "todos dicen «apasionado». Descartado."] },
  { at: ENTER + 6.2, line: ["think", "Pensando qué título poner"] },
  { at: ENTER + 7.3, line: ["tool", "CrearTítulo(“Daniel Campuzano”)"], mood: "throw", build: "title" },
  { at: ENTER + 7.8, mood: "work" },
  { at: ENTER + 8.1, line: ["tool", "CentrarTítulo()"], build: "center" },
  { at: ENTER + 8.8, line: ["tool", "PonerSubtítulo(“Fullstack Developer · construye con IA”)"], mood: "throw", build: "role" },
  { at: ENTER + 9.3, mood: "work" },
  { at: ENTER + 9.6, line: ["tool", "EscribirBajada()"], mood: "throw", build: "lede" },
  { at: ENTER + 10.0, build: "sub" },
  { at: ENTER + 10.2, mood: "work" },
  { at: ENTER + 10.6, line: ["tool", "CrearBotón(“Contactame”)"], mood: "throw", build: "actions" },
  { at: ENTER + 11.1, mood: "work" },
  { at: ENTER + 11.4, line: ["tool", "ArmarEscena(clawd.canvas)"], mood: "throw", build: "stage" },
  { at: ENTER + 11.9, mood: "work" },
  { at: ENTER + 12.3, line: ["tool", "Revisar(hero)"] },
  { at: ENTER + 12.8, line: ["out", "todo en su lugar ✓"] },
  { at: ENTER + 13.3, mood: "thumbs", line: ["say", "Listo. Bajá, que te cuento quién es."] },
];
const END = ENTER + 14.6;
const LINES = 5;
const SPIN = ["·", "✢", "✳", "✶", "✻", "✽"];

export function Intro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const root = el?.closest<HTMLElement>(".cl");
    if (!el || !root || !("intro" in root.dataset)) return;
    const typed = el.querySelector<HTMLElement>(".in-typed")!;
    const log = el.querySelector<HTMLOListElement>(".in-log")!;
    const term = el.querySelector<HTMLElement>(".in-term")!;
    const clawd = el.querySelector<HTMLElement>(".in-clawd")!;
    const piece = (name: string) => root.querySelector<HTMLElement>(`[data-build="${name}"]`);

    let raf = 0;
    let start = 0;
    let next = 0;
    let think: HTMLElement | null = null;
    let done = false;

    const add = ([kind, text]: [Kind, string]) => {
      const li = document.createElement("li");
      li.className = `in-${kind}`;
      li.textContent = text;
      log.querySelector(".is-live")?.classList.remove("is-live");
      if (kind === "tool") li.classList.add("is-live");
      log.append(li);
      while (log.children.length > LINES) log.firstElementChild?.remove();
      think = kind === "think" ? li : null;
      if (think) think.dataset.text = text;
    };

    // La pieza sale de Clawd y vuela a su lugar real (FLIP con WAAPI).
    const build = (name: string) => {
      if (name === "center") {
        piece("title")?.animate(
          [{ translate: "-14px 0" }, { translate: "6px 0" }, { translate: "0 0" }],
          { duration: 500, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" },
        );
        return;
      }
      const p = piece(name);
      if (!p) return;
      const a = clawd.getBoundingClientRect();
      const b = p.getBoundingClientRect();
      const dx = a.left + a.width / 2 - (b.left + b.width / 2);
      const dy = a.top + a.height / 3 - (b.top + b.height / 2);
      p.dataset.built = "";
      p.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0, filter: "blur(2px)" },
          { opacity: 1, offset: 0.35 },
          { transform: "none", opacity: 1, filter: "none" },
        ],
        { duration: 750, easing: "cubic-bezier(0.2, 0.9, 0.25, 1.12)" },
      );
    };

    const finish = (skipped: boolean) => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("pointerdown", onSkip);
      root.querySelectorAll<HTMLElement>("[data-build]").forEach((p) => (p.dataset.built = ""));
      const close = () => {
        root.dataset.introDone = "";
        window.dispatchEvent(new Event("clawd:ready"));
      };
      if (skipped) {
        el.dataset.out = "skip";
        close();
        return;
      }
      // La consola se mete en la del hero; Clawd salta adentro del canvas.
      const to = (from: Element, target: Element | null) => {
        if (!target) return;
        const a = from.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        from.animate(
          [
            { transform: "none", opacity: 1 },
            {
              transform: `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width}, ${b.height / a.height})`,
              opacity: 0,
            },
          ],
          { duration: 650, easing: "cubic-bezier(0.6, 0, 0.3, 1)", fill: "forwards" },
        );
      };
      to(term, root.querySelector(".cl-log"));
      to(clawd, root.querySelector(".cl-stage__canvas"));
      el.dataset.out = "fly";
      window.setTimeout(close, 600);
    };
    function onSkip(ev: Event) {
      if (ev instanceof KeyboardEvent && ["Shift", "Control", "Alt", "Meta"].includes(ev.key)) return;
      finish(true);
    }

    const tick = (now: number) => {
      if (!start) start = now;
      const s = (now - start) / 1000;
      const n = Math.max(0, Math.min(ORDER.length, Math.floor((s - TYPE_AT) / TYPE_MS)));
      const shown = s >= ENTER ? "" : ORDER.slice(0, n);
      if (typed.textContent !== shown) typed.textContent = shown;
      while (next < CUES.length && CUES[next].at <= s) {
        const c = CUES[next++];
        if (c.mood) el.dataset.mood = c.mood;
        if (c.line) add(c.line);
        if (c.build) build(c.build);
        if (c.at >= ENTER + 2) el.dataset.phase = "build";
      }
      if (think) {
        const g = SPIN[Math.floor(s / 0.12) % SPIN.length];
        think.textContent = `${g} ${think.dataset.text}…`;
      }
      if (s >= END) return finish(false);
      raf = requestAnimationFrame(tick);
    };

    window.scrollTo(0, 0);
    raf = requestAnimationFrame(tick);
    window.addEventListener("keydown", onSkip);
    window.addEventListener("pointerdown", onSkip);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("pointerdown", onSkip);
    };
  }, []);

  return (
    <div className="in" ref={ref} data-mood="sleep" aria-hidden="true">
      <div className="in-term">
        <div className="in-clawd">
          <span className="in-z">z</span>
          <span className="in-z in-z--2">z</span>
          <span className="in-bang">!</span>
          <span className="in-burst" />
          <Pixel pose="idle" className="in-c in-c--idle" />
          <Pixel pose="thumbs" className="in-c in-c--thumbs" />
          <Pixel pose="volley" className="in-c in-c--throw" />
        </div>
        <ol className="in-log" />
        <p className="in-prompt">
          <span className="cl-prompt__who">daniel</span>
          <span className="cl-prompt__sep"> › </span>
          <span className="in-typed" />
          <span className="cl-prompt__caret" />
        </p>
      </div>
      <p className="in-skip">
        <span className="in-skip--key">Apretá cualquier tecla para saltear la intro</span>
        <span className="in-skip--tap">Tocá la pantalla para saltear la intro</span>
      </p>
    </div>
  );
}
