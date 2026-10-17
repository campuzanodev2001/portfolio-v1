import { halftoneDisc, type HalftoneOpts } from "./print";

/** A halftone disc. Color comes from `currentColor` (the plate's ink). */
export function Halftone({
  className,
  ...opts
}: HalftoneOpts & { className?: string }) {
  const layers = halftoneDisc(opts);
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {layers.map((l) => (
          <path key={l.w} d={l.d} strokeWidth={l.w} />
        ))}
      </g>
    </svg>
  );
}
