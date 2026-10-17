import { SPR_H, SPR_W, spritePaths, type FrameName } from "./sprites";

type Props = {
  /** Uno o más frames; con varios, el CSS los alterna (`data-f` = índice). */
  frames: FrameName[];
  crew?: number;
  flip?: boolean;
  className?: string;
};

/**
 * Laburante en SVG servido: cero JS. El tamaño lo da el CSS en múltiplos de
 * --u (11 x 10 art px), así comparte el pixel con el canvas del hero.
 */
export default function Sprite({ frames, crew = 0, flip = false, className }: Props) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${SPR_W} ${SPR_H}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {frames.map((f, i) => (
        <g key={`${f}-${i}`} data-f={i}>
          {spritePaths(f, crew, flip).map((p) => (
            <path key={p.fill} d={p.d} fill={p.fill} />
          ))}
        </g>
      ))}
    </svg>
  );
}
