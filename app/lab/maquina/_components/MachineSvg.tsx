import type { CSSProperties } from "react";
import { AFTER, poseAttr, STRING_CUT, STRING_TOP, STRING_X, type PieceId } from "./geometry";

/**
 * The machine, drawn like a patent figure: one ink line weight, flat fills
 * from a 5-colour palette, hatched floor/ceiling, numbered parts.
 * Server component: static markup, the engine only rewrites transforms.
 */

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const HATCH = Array.from({ length: 41 }, (_, i) => i * 10);

const LABEL: Record<PieceId, string> = {
  pad: "Joystick",
  ruler: "Regla con púa",
  book: "Libro",
  seesaw: "Subibaja",
  pot: "Maceta",
};

function Piece({ id, delay, children }: { id: PieceId; delay: number; children: React.ReactNode }) {
  return (
    <g className="mq-in" style={d(delay)}>
      <g
        data-p={id}
        className="mq-piece"
        role="button"
        tabIndex={0}
        aria-label={LABEL[id]}
        aria-describedby="mq-hint"
        transform={poseAttr(AFTER[id], id)}
      >
        {children}
      </g>
    </g>
  );
}

function Num({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <g className="mq-num" aria-hidden="true">
      <circle cx={x} cy={y} r={6} />
      <text x={x} y={y + 3}>
        {n}
      </text>
    </g>
  );
}

export default function MachineSvg() {
  return (
    <svg className="mq-svg" viewBox="0 0 400 300" data-svg="" role="group" aria-label="Máquina de reacción en cadena">
      {/* structure: ceiling, floor, hangers (behind everything) */}
      <g className="mq-struct" aria-hidden="true">
        <path d="M0 6H400M0 294H400" />
        {HATCH.map((x) => (
          <path key={x} className="mq-hatch" d={`M${x} 6L${x + 6} 0M${x} 294L${x - 6} 300`} />
        ))}
        <path className="mq-rod" d="M134 6V96M330 6V96M40 67V294M118 104V294M150 103V134M205 103V161" />
        <path className="mq-trail" d="M31 36L135 85L174 84L177 135L217 155L226 257M231 236L231 196" />
        <path className="mq-trail-head" d="M226 202L231 194L236 202" />
      </g>

      {/* 1 keyboard ramp (static, reacts) */}
      <g className="mq-in" style={d(0)}>
        <g data-s="keys" className="mq-piece" role="button" tabIndex={0} aria-label="Teclado" aria-describedby="mq-hint">
          <g transform="rotate(25.38 12 40)">
            <rect className="p" x={12} y={40} width={131} height={13} rx={3} />
            {Array.from({ length: 10 }, (_, i) => (
              <rect key={i} className={i === 8 ? "b mq-key" : "k mq-key"} x={16 + i * 12.6} y={43} width={10} height={6} rx={1.5} />
            ))}
          </g>
        </g>
      </g>

      {/* shelf with the hole */}
      <g className="mq-in" style={d(40)} aria-hidden="true">
        <rect className="i" x={124} y={96} width={32} height={7} rx={1} />
        <rect className="i" x={192} y={96} width={144} height={7} rx={1} />
      </g>

      {/* 4 guitar string from a tuning peg */}
      <g className="mq-in" style={d(80)}>
        <g data-s="peg" className="mq-piece" role="button" tabIndex={0} aria-label="Cuerda de guitarra" aria-describedby="mq-hint">
          <line data-str="" className="mq-string" x1={STRING_X} y1={STRING_TOP} x2={STRING_X} y2={STRING_CUT} />
          <rect className="i" x={367} y={4} width={10} height={13} rx={2} />
          <ellipse className="p" cx={386} cy={11} rx={7} ry={4.5} />
        </g>
      </g>

      {/* 6 book ramp */}
      <Piece id="book" delay={150}>
        <g transform="rotate(26.57 140 130)">
          <rect className="b" x={140} y={130} width={80} height={12} rx={2} />
          <rect className="p" x={144} y={133} width={73} height={6} />
          <path className="mq-thin" d="M150 135H212M150 137H206" />
          <rect className="y" x={196} y={130} width={7} height={12} />
        </g>
      </Piece>

      {/* 8 speaker as fulcrum (static, reacts) */}
      <g className="mq-in" style={d(200)}>
        <g data-s="speaker" className="mq-piece" role="button" tabIndex={0} aria-label="Parlante" aria-describedby="mq-hint">
          <path className="i" d="M300 263L291 272H309Z" />
          <rect className="i" x={280} y={272} width={40} height={22} rx={3} />
          <g data-cone="">
            <circle className="p" cx={300} cy={284} r={7} />
            <circle className="i" cx={300} cy={284} r={2.5} />
          </g>
        </g>
      </g>

      {/* 7 seesaw */}
      <Piece id="seesaw" delay={230}>
        <rect className="p" x={208} y={258} width={184} height={7} rx={2} />
        <path className="mq-thin" d="M220 261.5H262M300 261.5H350" />
        <circle className="i" cx={300} cy={262} r={2.6} />
      </Piece>

      {/* 2 gamepad */}
      <Piece id="pad" delay={60}>
        <path
          className="i"
          d="M146 88C146 76 154 70 164 70H188C198 70 206 76 206 88C206 97 199 99 195 94L190 88H162L157 94C153 99 146 97 146 88Z"
        />
        <path className="p mq-thin-s" d="M157 79h3v-3h3v3h3v3h-3v3h-3v-3h-3z" />
        <circle className="r mq-btn" cx={193} cy={77} r={2.6} />
        <circle className="b mq-btn" cx={199} cy={82} r={2.6} />
        <circle className="y mq-btn" cx={187} cy={82} r={2.6} />
        <circle className="p" cx={170} cy={87} r={3} />
        <circle className="p" cx={181} cy={87} r={3} />
      </Piece>

      {/* 3 ruler + pick */}
      <Piece id="ruler" delay={100}>
        <rect className="y" x={208} y={86} width={120} height={10} rx={1} />
        <path
          className="mq-thin"
          d={Array.from({ length: 29 }, (_, i) => {
            const x = 212 + i * 4;
            return `M${x} 86V${i % 5 === 0 ? 91 : 88.5}`;
          }).join("")}
        />
        <path className="b" d="M326 84C334 86 340 89 338 91C340 93 334 96 326 98Z" />
        <rect className="p" x={322} y={85} width={6} height={12} />
      </Piece>

      {/* 5 pot hanging from the string */}
      <Piece id="pot" delay={120}>
        <g className="mq-leaves">
          <path className="g" d="M372 152C360 142 355 131 360 123C368 131 372 141 372 152Z" />
          <path className="g" d="M372 152C384 142 389 131 384 123C376 131 372 141 372 152Z" />
          <path className="g" d="M372 150C367 138 368 126 372 118C376 126 377 138 372 150Z" />
        </g>
        <path className="mq-sling" d="M356 150L372 136L388 150" />
        <path className="r" d="M357 157H387L383 184H361Z" />
        <rect className="r" x={354} y={150} width={36} height={7} rx={1.5} />
      </Piece>

      {/* ghost slots (shown when a piece is missing) */}
      <g className="mq-ghosts" aria-hidden="true">
        <rect data-g="pad" x={146} y={70} width={60} height={27} rx={8} />
        <rect data-g="ruler" x={208} y={84} width={131} height={14} rx={2} />
        <rect data-g="book" x={140} y={130} width={80} height={12} rx={2} transform="rotate(26.57 140 130)" />
        <rect data-g="seesaw" x={208} y={258} width={184} height={7} rx={2} transform="rotate(-9 300 262)" />
        <rect data-g="pot" x={354} y={122} width={36} height={62} rx={4} />
      </g>

      <Num n={1} x={22} y={78} />
      <Num n={2} x={176} y={60} />
      <Num n={3} x={268} y={74} />
      <Num n={4} x={360} y={40} />
      <Num n={5} x={344} y={196} />
      <Num n={6} x={130} y={160} />
      <Num n={7} x={250} y={284} />
      <Num n={8} x={332} y={284} />
    </svg>
  );
}
