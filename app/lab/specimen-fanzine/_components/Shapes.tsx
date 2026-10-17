import { halftoneDisc } from "./print";

/**
 * The page has exactly two shapes:
 *   el punto  — the period, which is also the halftone dot
 *   el guion  — the underscore cursor, which is also the ink bar / rule
 * Everything decorative is made of one or both.
 */

export const DISC_ID = "sf-disc";

/** One halftone disc, defined once, reused everywhere via <use>. */
export function DiscDefs() {
  const layers = halftoneDisc({ step: 12, angle: 15, light: [0.3, 0.24] });
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <symbol id={DISC_ID} viewBox="0 0 400 400">
          <g fill="none" stroke="currentColor" strokeLinecap="round">
            {layers.map((l) => (
              <path key={l.w} d={l.d} strokeWidth={l.w} />
            ))}
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

/** A halftone disc. Ink colour = currentColor. */
export function Disc({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <use href={`#${DISC_ID}`} />
    </svg>
  );
}

/**
 * Registration mark built from the two shapes: two bars and a dot.
 * Rendered inside a <button> by the page (print furniture that turns out
 * to be clickable).
 */
export function RegMark() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <rect x="0" y="12.9" width="28" height="2.2" fill="currentColor" />
      <rect x="12.9" y="0" width="2.2" height="28" fill="currentColor" />
      <circle cx="14" cy="14" r="5.2" fill="currentColor" />
    </svg>
  );
}
