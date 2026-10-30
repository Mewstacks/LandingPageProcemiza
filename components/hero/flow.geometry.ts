/**
 * Geometria pura da cena do hero: quatro rotinas em cascata (conferir notas, responder pedidos,
 * digitar entre sistemas, montar relatório), uma ficha que anda de uma à outra e vira cada
 * uma de "Manual" em "Automático" ao passar.
 * Unidades de projeto (px de um mundo de ~640 × 680); o componente multiplica por --k.
 * Nada aqui toca o DOM: tudo é função do relógio, então dá para testar.
 */

export type Vec3 = { x: number; y: number; z: number };
export type CardId = "notas" | "pedidos" | "sistemas" | "relatorio";
export const CARD_IDS: readonly CardId[] = ["notas", "pedidos", "sistemas", "relatorio"];

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

/** Posições são o centro de cada cartão. Z cresce com a ordem: a última rotina chega mais perto. */
export const LAYOUTS: Record<Layout["name"], Layout> = {
  wide: {
    name: "wide",
    width: 640,
    height: 680,
    perspective: 1700,
    tiltX: 7,
    tiltY: -20,
    cards: [
      { id: "notas", w: 340, h: 132, x: -150, y: -258, z: -120, ry: 0 },
      { id: "pedidos", w: 340, h: 132, x: -50, y: -86, z: -42, ry: 0 },
      { id: "sistemas", w: 340, h: 132, x: 50, y: 86, z: 38, ry: 0 },
      { id: "relatorio", w: 340, h: 132, x: 150, y: 258, z: 116, ry: 0 },
    ],
  },
  narrow: {
    name: "narrow",
    width: 340,
    height: 600,
    perspective: 1500,
    tiltX: 6,
    tiltY: -12,
    cards: [
      { id: "notas", w: 300, h: 126, x: -16, y: -225, z: -60, ry: 0 },
      { id: "pedidos", w: 300, h: 126, x: -5, y: -75, z: -20, ry: 0 },
      { id: "sistemas", w: 300, h: 126, x: 5, y: 75, z: 20, ry: 0 },
      { id: "relatorio", w: 300, h: 126, x: 16, y: 225, z: 60, ry: 0 },
    ],
  },
};

/**
 * Abaixo desta largura de cena (px) vale a pilha vertical estreita. Com 600 a escala da cena larga
 * nunca cai de ~0,94, e o texto (piso de 13px) cabe nos cartões.
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
/** Ponto no meio da borda de baixo / de cima: onde o fio sai de um cartão e entra no seguinte. */
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

/** Entrada: cada cartão chega de longe, um depois do outro. */
export const INTRO_MS = 900;
export const INTRO_STAGGER_MS = 150;
export const INTRO_DEPTH = 520;
/** O laço começa quando o último cartão já chegou quase por inteiro. */
export const START_MS = 1200;
export const CYCLE_MS = 12000;
/**
 * Janelas dentro do ciclo (ms). O estado "tudo Manual" aparece no fim do ciclo e no começo do
 * seguinte (~2 s); depois a ficha vira as rotinas uma a uma; o "tudo Automático" fica ~2 s.
 */
const FADE_IN_MS = 500;
const TRAVEL_FROM = 900;
const TRAVEL_TO = 8100;
const TOKEN_OUT_FROM = 8300;
const TOKEN_OUT_TO = 8900;
const RESET_FROM = 10200;
const RESET_TO = 11000;
/** Progresso vai de -0,4 (ficha parada na primeira rotina) a 3,2 (ficha parada na última). */
const PROGRESS_FROM = -0.4;
const PROGRESS_TO = 3.2;
/** Quanto o cartão da vez avança em Z. */
export const LIFT = 34;
/** A ficha sobe um pouco no meio de cada trecho. */
const ARC = 38;

export type FlowState = {
  /** 0..1 por cartão: chegada da entrada. */
  enter: number[];
  /** 0..1 por cartão: foco quando a ficha está nele. */
  lift: number[];
  /** Posição da ficha: 0 = primeira rotina, 3 = última (de -0,4 a 3,2 no ciclo). */
  progress: number;
  token: Vec3;
  tokenOpacity: number;
  /** 0..1 por cartão: já virou "Automático". */
  auto: number[];
};

/** Estado em `clock` ms desde o início. Sem módulo na entrada; o ciclo repete depois dela. */
export function flowState(clock: number, layout: Layout): FlowState {
  const cards = layout.cards;
  const last = cards.length - 1;
  const enter = cards.map((_, index) => easeOut(clamp((clock - index * INTRO_STAGGER_MS) / INTRO_MS)));
  const running = clock >= START_MS;
  const c = running ? (clock - START_MS) % CYCLE_MS : 0;

  const travel = clamp((c - TRAVEL_FROM) / (TRAVEL_TO - TRAVEL_FROM));
  const progress = running ? mix(PROGRESS_FROM, PROGRESS_TO, travel) : PROGRESS_FROM;
  const tokenOpacity = running ? smooth(0, FADE_IN_MS, c) * (1 - smooth(TOKEN_OUT_FROM, TOKEN_OUT_TO, c)) : 0;
  const keep = running ? 1 - smooth(RESET_FROM, RESET_TO, c) : 0;

  // a ficha nasce sobre a primeira rotina e termina sobre a última
  const along = clamp(progress, 0, last);
  const seg = Math.min(last - 1, Math.floor(along));
  const u = easeInOut(along - seg);
  const a = center(cards[seg]);
  const b = center(cards[seg + 1]);
  const token: Vec3 = {
    x: mix(a.x, b.x, u),
    y: mix(a.y, b.y, u),
    z: mix(a.z, b.z, u) + 6 + Math.sin(Math.PI * u) * ARC,
  };

  const lift = cards.map((_, index) => (running ? (1 - smooth(0, 0.7, Math.abs(progress - index))) * keep : 0));
  const auto = cards.map((_, index) => (running ? smooth(index - 0.2, index + 0.1, progress) * keep : 0));

  return { enter, lift, progress, token, tokenOpacity, auto };
}
