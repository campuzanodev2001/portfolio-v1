import { halftoneDisc, type HalftoneOpts } from "./print";
import { boxRuns, risoRuns, SPR_H, SPR_W, workerRuns, type FrameName, type Run } from "./art";

/** A halftone disc. Colour comes from `currentColor` (the plate's ink). */
export function Halftone({ className, ...opts }: HalftoneOpts & { className?: string }) {
  const layers = halftoneDisc(opts);
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {layers.map((l) => (
          <path key={l.w} d={l.d} strokeWidth={l.w} />
        ))}
      </g>
    </svg>
  );
}

function Paths({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) => (
        <path key={i} d={r.d} className={r.cls} fill={r.fill} />
      ))}
    </>
  );
}

/**
 * A worker as an SVG sprite strip: frames side by side, so CSS can flip
 * between them with `steps()` (no JS, no canvas).
 */
export function WorkerStrip({
  frames,
  crew,
  className,
  mirror,
}: {
  frames: FrameName[];
  crew: number;
  className?: string;
  mirror?: boolean;
}) {
  const w = SPR_W * frames.length;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${SPR_H}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      style={{ width: `calc(var(--u) * ${w})`, height: `calc(var(--u) * ${SPR_H})` }}
    >
      {frames.map((f, i) => (
        <Paths key={i} runs={workerRuns(f, crew, i * SPR_W, 0, mirror)} />
      ))}
    </svg>
  );
}

/** The riso duplicator that lives on the hero floor. */
export function Riso({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <Paths runs={risoRuns()} />
    </svg>
  );
}

/**
 * "En prensa": the crew working on Moreno Herramientas, the one project that
 * is still being built. Frames flip with CSS; nothing here needs JS.
 */
export function WipScene() {
  // 72×34 art px. Floor at y=30.
  const fy = 30;
  const boxes: [number, number][] = [
    [6, fy - 6],
    [13, fy - 6],
    [20, fy - 6],
    [9, fy - 12],
    [16, fy - 12],
    [12, fy - 18],
    [50, fy - 6],
    [57, fy - 6],
    [53, fy - 12],
  ];
  return (
    <svg
      className="imp-wip__svg"
      viewBox="0 0 72 34"
      shapeRendering="crispEdges"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      {/* floor: the same vainilla tiles as the hero, in two inks */}
      <path d={`M0 ${fy}h72v4h-72z`} fill="#E7DCC4" />
      <path
        d={Array.from({ length: 9 }, (_, i) => `M${i * 8} ${fy}h1v4h-1z`).join("") + `M0 ${fy}h72v1h-72z`}
        fill="#C9B994"
      />
      {boxes.map(([x, y], i) => (
        <Paths key={i} runs={boxRuns(x, y)} />
      ))}
      {/* the foreman, nailing a box shut */}
      <g className="imp-wip__f1">
        <Paths runs={workerRuns("hamUp", 1, 26, fy - SPR_H)} />
      </g>
      <g className="imp-wip__f2">
        <Paths runs={workerRuns("hamDown", 1, 26, fy - SPR_H)} />
      </g>
      {/* someone carrying a box from one pile to the other */}
      <g className="imp-wip__carry">
        <g className="imp-wip__bob">
          <Paths runs={boxRuns(35, fy - SPR_H - 6)} />
          <Paths runs={workerRuns("up", 0, 33, fy - SPR_H)} />
        </g>
      </g>
    </svg>
  );
}

/** Registration mark: print furniture (and, here, a button). */
export function RegMark() {
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
