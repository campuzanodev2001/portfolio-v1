"use client";

import { useRef, useState } from "react";

type Kind = "net" | "leaf" | "chord" | "pad";

/** Am7 (x02010): A2 E3 G3 C4 E4 — rasguido hacia abajo. */
const AM7 = [110, 164.81, 196, 261.63, 329.63];

function useStrum() {
  const ctx = useRef<AudioContext | null>(null);
  return () => {
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ac = (ctx.current ??= new AC());
      void ac.resume();
      const t0 = ac.currentTime + 0.02;
      const out = ac.createGain();
      out.gain.value = 0.32;
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2400;
      lp.connect(out).connect(ac.destination);
      AM7.forEach((f, n) => {
        const t = t0 + n * 0.032;
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "triangle";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.5, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
        o.connect(g).connect(lp);
        o.start(t);
        o.stop(t + 1.75);
      });
    } catch {
      /* sin audio, sin drama */
    }
  };
}

export function Doodles() {
  const [play, setPlay] = useState<Record<Kind, number>>({ net: 0, leaf: 0, chord: 0, pad: 0 });
  const strum = useStrum();
  const hit = (k: Kind) => setPlay((p) => ({ ...p, [k]: p[k] + 1 }));
  const on = (k: Kind) => (play[k] ? "is-on" : undefined);

  return (
    <ul className="cq-doodles" data-who="daniel" data-who-label="D.">
      <li className="cq-dd cq-dd--net">
        <button type="button" aria-label="Red de vóley: sacar" onClick={() => hit("net")}>
          <svg key={play.net} className={on("net")} viewBox="0 0 132 84" aria-hidden="true">
            <path d="M6 74 C 40 72, 90 75, 126 73" />
            <path d="M28 74 L 29 22 M 104 74 L 103 22" />
            <path className="cq-thin" d="M29 25 C 55 28, 80 27, 103 24 M29 43 C 55 45, 80 45, 103 42 M29 34 C 55 36, 80 36, 103 33" />
            <path className="cq-thin" d="M38 26 v18 M48 27 v18 M58 27 v18 M68 27 v18 M78 26 v18 M88 26 v18 M97 25 v18" />
            <g className="cq-ball">
              <circle cx="12" cy="62" r="6.5" />
              <path className="cq-thin" d="M6.5 59 C 10 62, 14 62, 17.5 59 M12 55.5 C 10 60, 10 64, 12 68.5" />
            </g>
          </svg>
          <span key={play.net} className={`cq-dd__say cq-hand ${on("net") ?? ""}`}>ace.</span>
        </button>
        <span className="cq-dd__cap">vóley</span>
      </li>

      <li className="cq-dd cq-dd--chord">
        <button type="button" aria-label="Acorde La menor séptima: tocar" onClick={() => { strum(); hit("chord"); }}>
          <svg key={play.chord} className={on("chord")} viewBox="0 0 92 84" aria-hidden="true">
            <text x="4" y="30" className="cq-hand-svg">Am7</text>
            <g transform="translate(44 12)">
              <path d="M0 10 h40" strokeWidth="2.4" />
              <path className="cq-thin" d="M0 20 h40 M0 30 h40 M0 40 h40 M0 50 h40 M0 10 v40 M8 10 v40 M16 10 v40 M24 10 v40 M32 10 v40 M40 10 v40" />
              <path className="cq-thin" d="M-2.5 1.5 l5 5 m0 -5 l-5 5" />
              <circle className="cq-thin" cx="8" cy="4" r="2.6" />
              <circle className="cq-thin" cx="24" cy="4" r="2.6" />
              <circle className="cq-thin" cx="40" cy="4" r="2.6" />
              <circle className="cq-dot" cx="16" cy="25" r="3.4" />
              <circle className="cq-dot" cx="32" cy="15" r="3.4" />
            </g>
            <path className="cq-notes cq-thin" d="M12 60 v-14 l10 -3 v14 M12 60 a3 2.4 0 1 1 -0.1 0 M22 57 a3 2.4 0 1 1 -0.1 0" />
          </svg>
        </button>
        <span className="cq-dd__cap">Am7 · x02010</span>
      </li>

      <li className="cq-dd cq-dd--leaf">
        <button type="button" aria-label="Hoja: soplar" onClick={() => hit("leaf")}>
          <svg key={play.leaf} className={on("leaf")} viewBox="0 0 70 84" aria-hidden="true">
            <g className="cq-leaf">
              <path d="M35 10 C 14 22, 10 48, 33 66 C 58 50, 56 22, 35 10 Z" />
              <path className="cq-thin" d="M35 12 C 34 30, 34 50, 33 78 M34 30 l-9 -6 M34 40 l10 -7 M34 50 l-12 -7 M33.6 58 l11 -8" />
            </g>
          </svg>
        </button>
        <span className="cq-dd__cap">afuera</span>
      </li>

      <li className="cq-dd cq-dd--pad">
        <button type="button" aria-label="Joystick: jugar" onClick={() => hit("pad")}>
          <svg key={play.pad} className={on("pad")} viewBox="0 0 104 84" aria-hidden="true">
            <path d="M28 26 C 14 26, 8 40, 6 56 C 4 70, 16 74, 24 64 L 32 54 H 72 L 80 64 C 88 74, 100 70, 98 56 C 96 40, 90 26, 76 26 Z" />
            <path className="cq-dpad" d="M22 39 h6 v-6 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 z" />
            <circle className="cq-btn-a" cx="78" cy="38" r="3.6" />
            <circle className="cq-btn-b" cx="70" cy="46" r="3.6" />
            <path className="cq-thin" d="M46 41 h4 M56 41 h4" />
          </svg>
          <span key={play.pad} className={`cq-dd__say cq-hand ${on("pad") ?? ""}`}>+1 vida</span>
        </button>
        <span className="cq-dd__cap">pausa</span>
      </li>
    </ul>
  );
}
