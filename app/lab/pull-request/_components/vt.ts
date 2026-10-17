import type { CSSProperties } from "react";
import { flushSync } from "react-dom";

/** view-transition-name sólo cuando corresponde (dos elementos con el mismo
    nombre a la vez abortan la transición). */
export function vt(name: string, on: boolean): CSSProperties | undefined {
  return on ? ({ viewTransitionName: name } as CSSProperties) : undefined;
}

type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => unknown;
};

export function canViewTransition() {
  return typeof (document as VTDocument).startViewTransition === "function";
}

/** Corre `update` dentro de una View Transition si el browser la soporta. */
export function transition(update: () => void) {
  const doc = document as VTDocument;
  if (typeof doc.startViewTransition !== "function") {
    update();
    return;
  }
  doc.startViewTransition(() => {
    flushSync(update);
  });
}
