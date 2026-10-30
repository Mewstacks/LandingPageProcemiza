/**
 * Geometria pura da cena do hero: quatro documentos em cascata (mensagem → planilha → nota →
 * resposta), uma ficha que anda de um ao outro e o que acende em cada chegada.
 * Unidades de projeto (px de um mundo de ~640 × 700); o componente multiplica por --k.
 * Nada aqui toca o DOM: tudo é função do relógio, então dá para testar.
 */

export type Vec3 = { x: number; y: number; z: number };
export type CardId = "in" | "sheet" | "invoice" | "out";
export const CARD_IDS: readonly CardId[] = ["in", "sheet", "invoice", "out"];

export type CardBox = { id: CardId; w: number; h: number; x: number; y: number; z: number; ry: number };
export type Layout = {
  name: "wide" | "narrow";
  width: number;
  height: number;
  /** Distância da câmera, em unidades de projeto. */
  perspective: number;
  tiltX: number;
  tiltY: number;
  cards: readonly CardBox[];
};

/** Posições são o centro de cada documento. Z cresce com a ordem: o resultado chega mais perto. */
export const LAYOUTS: Record<Layout["name"], Layout> = {
  wide: {
    name: "wide",
    width: 640,
    height: 700,
    perspective: 1700,
    tiltX: 7,
    tiltY: -20,
    cards: [
      { id: "in", w: 330, h: 126, x: -150, y: -281, z: -120, ry: 0 },
      { id: "sheet", w: 344, h: 150, x: -36, y: -119, z: -42, ry: 0 },
      { id: "invoice", w: 290, h: 200, x: 76, y: 80, z: 38, ry: 0 },
      { id: "out", w: 330, h: 140, x: 150, y: 274, z: 116, ry: 0 },
    ],
  },
  narrow: {
    name: "narrow",
    width: 340,
    height: 650,
    perspective: 1500,
    tiltX: 6,
    tiltY: -12,
    cards: [
      { id: "in", w: 288, h: 124, x: -12, y: -259, z: -60, ry: 0 },
      { id: "sheet", w: 316, h: 146, x: 8, y: -108, z: -20, ry: 0 },
      { id: "invoice", w: 276, h: 192, x: -8, y: 77, z: 20, ry: 0 },
      { id: "out", w: 292, h: 132, x: 12, y: 255, z: 60, ry: 0 },
    ],
  },
};

/**
 * Abaixo desta largura de cena (px) vale a pilha vertical estreita. Com 600 a escala da cena larga
 * nunca cai de ~0,94, e o texto (piso de 13px) cabe nos documentos.
 */
export const NARROW_BELOW = 600;

export function pickLayout(width: number): Layout {
  return width < NARROW_BELOW ? LAYOUTS.narrow : LAYOUTS.wide;
}

/** Escala projeto→tela que cabe na caixa, com teto para a tela grande não inflar o texto. */
export function fitScale(layout: Layout, width: number, height: number, max = 1.4): number {
  if (width <= 0 || height <= 0) return 1;
  return Math.min(width / layout.width, height / layout.height, max);
}

export const center = (card: CardBox): Vec3 => ({ x: card.x, y: card.y, z: card.z });
/** Ponto no meio da borda de baixo / de cima: onde o fio sai de um documento e entra no seguinte. */
export const bottomEdge = (card: CardBox): Vec3 => ({ x: card.x, y: card.y + card.h / 2, z: card.z });
export const topEdge = (card: CardBox): Vec3 => ({ x: card.x, y: card.y - card.h / 2, z: card.z });

export type Segment = { from: Vec3; length: number; yaw: number; pitch: number };

/**
 * Um fio reto entre dois pontos 3D. O elemento nasce deitado no eixo X; aplicado como
 * `translate3d(from) rotateZ(yaw) rotateY(pitch)` ele aponta de `a` para `b`.
 */
export function segment(a: Vec3, b: Vec3): Segment {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  const length = Math.hypot(dx, dy, dz);
  if (length === 0) return { from: a, length: 0, yaw: 0, pitch: 0 };
  return {
    from: a,
    length,
    yaw: (Math.atan2(dy, dx) * 180) / Math.PI,
    pitch: (-Math.asin(dz / length) * 180) / Math.PI,
  };
}

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Entrada: cada documento chega de longe, um depois do outro. */
export const INTRO_MS = 900;
export const INTRO_STAGGER_MS = 150;
export const INTRO_DEPTH = 520;
/** A ficha começa quando o último documento já chegou quase por inteiro. */
export const START_MS = 1200;
export const CYCLE_MS = 11000;
/** Janelas dentro do ciclo (ms). */
const FADE_IN_MS = 500;
const TRAVEL_FROM = 600;
const TRAVEL_TO = 7200;
const TOKEN_OUT_FROM = 7400;
const TOKEN_OUT_TO = 8000;
const RESET_FROM = 9800;
const RESET_TO = 10600;
/** Quanto o documento da vez avança em Z. */
export const LIFT = 34;
/** A ficha sobe um pouco no meio de cada trecho. */
const ARC = 38;

export type FlowState = {
  /** 0..1 por documento: chegada da entrada. */
  enter: number[];
  /** 0..1 por documento: foco quando a ficha está nele. */
  lift: number[];
  /** Posição da ficha ao longo do caminho: 0 = mensagem, 3 = resposta. */
  progress: number;
  token: Vec3;
  tokenOpacity: number;
  /** Linha nova na planilha, carimbo da nota, resposta no chat. */
  row: number;
  stamp: number;
  reply: number;
};

/** Estado em `clock` ms desde o início. Sem módulo na entrada; o ciclo repete depois dela. */
export function flowState(clock: number, layout: Layout): FlowState {
  const cards = layout.cards;
  const enter = cards.map((_, index) => easeOut(clamp((clock - index * INTRO_STAGGER_MS) / INTRO_MS)));
  const running = clock >= START_MS;
  const c = running ? (clock - START_MS) % CYCLE_MS : 0;

  const travel = clamp((c - TRAVEL_FROM) / (TRAVEL_TO - TRAVEL_FROM));
  const progress = running ? (cards.length - 1) * travel : 0;
  const tokenOpacity = running ? smooth(0, FADE_IN_MS, c) * (1 - smooth(TOKEN_OUT_FROM, TOKEN_OUT_TO, c)) : 0;
  const keep = running ? 1 - smooth(RESET_FROM, RESET_TO, c) : 0;

  const seg = Math.min(cards.length - 2, Math.floor(progress));
  const u = easeInOut(progress - seg);
  const a = center(cards[seg]);
  const b = center(cards[seg + 1]);
  const token: Vec3 = {
    x: mix(a.x, b.x, u),
    y: mix(a.y, b.y, u),
    z: mix(a.z, b.z, u) + 6 + Math.sin(Math.PI * u) * ARC,
  };

  const lift = cards.map((_, index) => (running ? (1 - smooth(0, 0.7, Math.abs(progress - index))) * keep : 0));

  return {
    enter,
    lift,
    progress,
    token,
    tokenOpacity,
    row: smooth(0.8, 1, progress) * keep,
    stamp: smooth(1.8, 2, progress) * keep,
    reply: smooth(2.8, 3, progress) * keep,
  };
}
