"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  BACK_TO_FIRST,
  BLAME_SUMMARY,
  BRANCH,
  FILE,
  LINKS,
  MERGED,
  NAME,
  ROWS,
  STATEMENT,
  STYLES,
  type RowKey,
} from "./content";
import { Loader } from "./Loader";
import { bootStart, markBooted, prefersReducedMotion, useBootMode, useBuenosAiresTime } from "./stores";
import { canViewTransition, transition, vt } from "./vt";

type Entry = "morph" | "fresh" | "none";

const BOOT_AT = 950; // ms: el diff se aplica
const LATE_AFTER = 1400; // ms: el failsafe CSS ya mostró el hero
const STRIKE_MS = 520; // ms: tachado antes de regenerar

export function PullRequest({ children }: { children?: ReactNode }) {
  const mode = useBootMode();
  const time = useBuenosAiresTime();

  const [applied, setApplied] = useState(false);
  const [entryAfterBoot, setEntryAfterBoot] = useState<Entry>("morph");
  const [styleIdx, setStyleIdx] = useState(0);
  const [round, setRound] = useState(0);
  const [rejecting, setRejecting] = useState(false);
  const [merged, setMerged] = useState(false);
  const [blame, setBlame] = useState(false);
  const [deleted, setDeleted] = useState<RowKey[]>([]);

  const appliedRef = useRef(false);
  const busyRef = useRef(false);

  const phase = mode === "skip" || applied ? "hero" : "boot";
  const entry: Entry = applied ? entryAfterBoot : mode === "skip" ? "fresh" : "morph";
  const heroNamed = phase === "hero";

  /* ---------- loader → hero ---------- */

  const apply = useCallback((late: boolean) => {
    if (appliedRef.current) return;
    appliedRef.current = true;
    const morph = !late && canViewTransition();
    const update = () => {
      markBooted();
      setApplied(true);
      setEntryAfterBoot(late ? "none" : morph ? "morph" : "fresh");
    };
    if (morph) transition(update);
    else update();
  }, []);

  useEffect(() => {
    if (mode !== "run" || applied) return;
    const t0 = bootStart();
    const fire = () => apply(performance.now() - t0 > LATE_AFTER);
    const wait = Math.max(0, t0 + BOOT_AT - performance.now());
    const id = window.setTimeout(fire, wait);
    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.metaKey || e.ctrlKey || e.altKey)) return;
      apply(false);
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [mode, applied, apply]);

  /* ---------- easter egg: git blame (tecla b) ---------- */

  useEffect(() => {
    if (phase !== "hero") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "b" || e.key === "B") setBlame((b) => !b);
      else if (e.key === "Escape") setBlame(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => {
    console.info(
      "%c+ psst: apretá b (o tocá “hero.tsx”) para ver quién escribió qué.",
      "color:#17652F;font-family:monospace",
    );
  }, []);

  /* ---------- review ---------- */

  const reject = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBlame(false);
    setRejecting(true);
    window.setTimeout(
      () => {
        transition(() => {
          setStyleIdx((i) => (i + 1) % STYLES.length);
          setRound((r) => r + 1);
          setRejecting(false);
          setMerged(false);
          setDeleted([]);
        });
        busyRef.current = false;
      },
      prefersReducedMotion() ? 0 : STRIKE_MS,
    );
  };

  const toggleMerge = () => {
    if (busyRef.current) return;
    transition(() => setMerged((m) => !m));
  };

  const toggleRow = (key: RowKey) =>
    setDeleted((d) => (d.includes(key) ? d.filter((k) => k !== key) : [...d, key]));

  const style = STYLES[styleIdx];
  const message = merged
    ? MERGED
    : rejecting
      ? "Tachando…"
      : round > 0 && styleIdx === 0
        ? BACK_TO_FIRST
        : style.message;

  const adds = ROWS.length - deleted.length;
  const dels = 2 + deleted.length;

  const cell = (key: RowKey): ReactNode => {
    switch (key) {
      case "name":
        return (
          <h1 className="pr-name" id="pr-title">
            <span className="pr-first pr-t" style={vt("pr-first", heroNamed)}>
              {NAME.first}
            </span>{" "}
            <span className="pr-last pr-t" style={vt("pr-last", heroNamed)}>
              {NAME.last}
            </span>
          </h1>
        );
      case "statement":
        return (
          <p className="pr-statement" style={vt("pr-statement", heroNamed)}>
            <span className="pr-t">{STATEMENT}</span>
          </p>
        );
      case "place":
        return (
          <p className="pr-meta" style={vt("pr-place", heroNamed)}>
            <span className="pr-t">
              Buenos Aires · <time className="pr-time">{time ?? "--:--"}</time> (UTC−3)
            </span>
          </p>
        );
      case "coauthor":
        return (
          <p className="pr-meta" style={vt("pr-coauthor", heroNamed)}>
            <span className="pr-t">Co-authored-by: Claude</span>
          </p>
        );
      case "links":
        return (
          <ul className="pr-links" style={vt("pr-links", heroNamed)}>
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <span className="pr-t">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        );
      case "review":
        return (
          <div className="pr-review">
            <p className="pr-q" style={vt("pr-q", heroNamed)}>
              <span className="pr-t" aria-live="polite">
                {message}
              </span>
            </p>
            <div className="pr-actions">
              {merged ? (
                <button type="button" className="pr-btn" onClick={toggleMerge}>
                  <span className="pr-plus is-minus" aria-hidden="true" />
                  Reabrir
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="pr-btn pr-btn--ok"
                    onClick={toggleMerge}
                  >
                    <span className="pr-plus" aria-hidden="true" />
                    Aceptar
                  </button>
                  <button
                    type="button"
                    className="pr-btn pr-btn--no"
                    onClick={reject}
                  >
                    <span className="pr-plus is-minus" aria-hidden="true" />
                    Rechazar
                  </button>
                </>
              )}
            </div>
            <p className="pr-round pr-meta">
              propuesta {styleIdx + 1}/{STYLES.length} · {style.name}
              {!merged && <span className="pr-hint"> · rechazá y te muestro otra</span>}
            </p>
          </div>
        );
    }
  };

  return (
    <main
      className="pr"
      data-phase={phase}
      data-entry={entry}
      data-style={style.id}
      data-merged={merged || undefined}
      data-blame={blame || undefined}
      data-rejecting={rejecting || undefined}
    >
      {phase === "boot" && <Loader named={mode === "run"} time={time} />}

      <section className="pr-hero" aria-labelledby="pr-title">
        <div className="pr-bar" style={vt("pr-bar", heroNamed)}>
          <button
            type="button"
            className="pr-file"
            aria-pressed={blame}
            onClick={() => setBlame((b) => !b)}
          >
            {FILE}
          </button>
          <span className="pr-branch">{BRANCH}</span>
          {merged ? (
            <span className="pr-stat pr-stat--merged">mergeado</span>
          ) : (
            <span className="pr-stat" aria-label={`${adds} líneas agregadas, ${dels} borradas`}>
              <span className="pr-stat-add">+{adds}</span>{" "}
              <span className="pr-stat-del">−{dels}</span>
              <span className="pr-stat-bar" aria-hidden="true">
                <span className="pr-stat-add">{"+".repeat(adds)}</span>
                <span className="pr-stat-del">{"−".repeat(dels)}</span>
              </span>
            </span>
          )}
        </div>

        {blame && (
          <div className="pr-blamebar" role="note">
            <p>
              <b>git blame {FILE}</b> — {BLAME_SUMMARY}
            </p>
            <button type="button" className="pr-link" onClick={() => setBlame(false)}>
              cerrar (b)
            </button>
          </div>
        )}

        <div className="pr-body">
          <div className="pr-rows">
            {ROWS.map((row, i) => {
              const isDel = deleted.includes(row.key);
              const n = i + 1;
              return (
                <div
                  key={row.key}
                  className="pr-row"
                  data-row={row.key}
                  data-del={isDel || undefined}
                  style={{ "--i": i } as CSSProperties}
                >
                  <div className="pr-gut">
                    <span className="pr-n" style={vt(`pr-n${n}`, heroNamed)}>
                      {n}
                    </span>
                    <button
                      type="button"
                      className="pr-sign"
                      style={vt(`pr-s${n}`, heroNamed)}
                      aria-pressed={isDel}
                      aria-label={isDel ? `Restaurar la línea ${n}` : `Borrar la línea ${n}`}
                      onClick={() => toggleRow(row.key)}
                      disabled={merged || rejecting}
                    >
                      <span className="pr-plus" aria-hidden="true" />
                    </button>
                  </div>
                  <span className="pr-label" aria-hidden="true">
                    {row.label}
                  </span>
                  {blame && (
                    <span className="pr-blame">
                      <span className="pr-who" data-who={row.blame.who}>
                        {row.blame.who}
                      </span>{" "}
                      <span>{row.blame.note}</span>
                    </span>
                  )}
                  <div className="pr-cell">{cell(row.key)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}
