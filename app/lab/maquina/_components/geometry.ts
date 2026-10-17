/**
 * Shared coordinates for the machine (SVG viewBox 400×300).
 * The SVG art is drawn at the START pose; every movable piece gets a
 * `transform` = translate(x y) rotate(r px py) built from a Pose.
 */
export const VB_W = 400;
export const VB_H = 300;
export const FLOOR = 294;
export const BALL_R = 12;
/** Ball radius when it is the dot of the "i", in em of the name. */
export const DOT_R_EM = 0.085;

export type Pose = { x: number; y: number; r: number };
export type PieceId = "pad" | "ruler" | "book" | "seesaw" | "pot";
export const PIECES: PieceId[] = ["pad", "ruler", "book", "seesaw", "pot"];

export const NAME: Record<PieceId, string> = {
  pad: "el joystick",
  ruler: "la regla con la púa",
  book: "el libro",
  seesaw: "el subibaja",
  pot: "la maceta",
};

/** Rotation pivots (in start-pose coordinates). */
export const PIVOT: Record<PieceId, [number, number]> = {
  pad: [176, 83],
  ruler: [268, 91],
  book: [176, 148],
  seesaw: [300, 262],
  pot: [372, 184],
};

export const SEESAW_TILT = 9;
export const SEESAW_PX = 300;
export const SEESAW_PY = 262;

export function seesawPoint(deg: number, lx: number, ly: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [SEESAW_PX + lx * c - ly * s, SEESAW_PY + lx * s + ly * c];
}

/** Pot resting on the seesaw's right end, at a given seesaw angle. */
export function potOnSeesaw(deg: number): Pose {
  const [x, y] = seesawPoint(deg, 72, -4);
  return { x: x - PIVOT.pot[0], y: y - PIVOT.pot[1], r: deg };
}

export const PUSH = 50;

export const START: Record<PieceId, Pose> = {
  pad: { x: 0, y: 0, r: 0 },
  ruler: { x: 0, y: 0, r: 0 },
  book: { x: 0, y: 0, r: 0 },
  seesaw: { x: 0, y: 0, r: -SEESAW_TILT },
  pot: { x: 0, y: 0, r: 0 },
};

/** The state after a successful run (also what the server renders). */
export const AFTER: Record<PieceId, Pose> = {
  pad: { x: PUSH, y: 0, r: 0 },
  ruler: { x: PUSH, y: 0, r: 0 },
  book: { x: 0, y: 0, r: 0 },
  seesaw: { x: 0, y: 0, r: SEESAW_TILT },
  pot: potOnSeesaw(SEESAW_TILT),
};

/** Where each piece ends when knocked off (a pile on the floor). */
export const FALLEN: Record<PieceId, Pose> = {
  pad: { x: 38 - 176, y: 281 - 83, r: 180 },
  ruler: { x: 214 - 268, y: 289 - 91, r: 0 },
  book: { x: 112 - 176, y: 288 - 148, r: -26.57 },
  seesaw: { x: 84, y: -54, r: -80 },
  pot: { x: 326 - 372, y: 276 - 184, r: 90 },
};

/** Pot standing on the floor (when the seesaw disappears under it). */
export const POT_FLOOR: Pose = { x: -32, y: FLOOR - 184, r: 0 };

export const STRING_TOP = 16;
export const STRING_FULL = 136;
export const STRING_CUT = 78;
/** x of the guitar string; the pick tip starts at PICK_TIP. */
export const STRING_X = 372;
export const PICK_TIP = 338;

/* Ball keypoints (svg coords). */
const K1 = { x: 12, y: 40, dx: 118, dy: 56 }; // keyboard top surface
const K1L = Math.hypot(K1.dx, K1.dy);
export function onKeyboard(s: number): [number, number] {
  const nx = K1.dy / K1L;
  const ny = -K1.dx / K1L;
  return [K1.x + K1.dx * s + nx * BALL_R, K1.y + K1.dy * s + ny * BALL_R];
}
const B = { x: 140, y: 130, dx: 72, dy: 36 }; // book top surface
const BL = Math.hypot(B.dx, B.dy);
export function onBook(s: number): [number, number] {
  const nx = B.dy / BL;
  const ny = -B.dx / BL;
  return [B.x + B.dx * s + nx * BALL_R, B.y + B.dy * s + ny * BALL_R];
}
export const BALL_START_S = 0.14;
export const SHELF_Y = 96 - BALL_R;
export const HOLE_X = 174;
export const BOOK_S0 = 0.425;
export const BALL_ON_SEESAW: [number, number] = [-72, -16];

export function poseAttr(p: Pose, id: PieceId): string {
  const [px, py] = PIVOT[id];
  return `translate(${round(p.x)} ${round(p.y)}) rotate(${round(p.r)} ${px} ${py})`;
}
const round = (n: number) => Math.round(n * 100) / 100;
