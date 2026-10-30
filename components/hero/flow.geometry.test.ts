import { describe, expect, it } from "vitest";
import {
  CYCLE_MS,
  LAYOUTS,
  START_MS,
  bottomEdge,
  center,
  fitScale,
  flowState,
  pickLayout,
  segment,
  topEdge,
} from "./flow.geometry";

const wide = LAYOUTS.wide;
/** Instante do ciclo (ms depois do início do laço). */
const at = (c: number) => flowState(START_MS + c, wide);
/** Instante do ciclo em que a ficha está em `progress` (espelha as janelas de flow.geometry.ts). */
const whenAt = (progress: number) => 900 + ((progress + 0.4) / 3.6) * 7200;

describe("layout", () => {
  it("quatro documentos, cada um mais perto da câmera que o anterior", () => {
    for (const layout of Object.values(LAYOUTS)) {
      expect(layout.cards).toHaveLength(4);
      const zs = layout.cards.map((card) => card.z);
      expect([...zs].sort((a, b) => a - b)).toEqual(zs);
    }
  });

  it("cada documento cabe na cena e fica abaixo do anterior", () => {
    for (const layout of Object.values(LAYOUTS)) {
      layout.cards.forEach((card, index) => {
        expect(card.x - card.w / 2).toBeGreaterThanOrEqual(-layout.width / 2);
        expect(card.x + card.w / 2).toBeLessThanOrEqual(layout.width / 2);
        expect(card.y - card.h / 2).toBeGreaterThanOrEqual(-layout.height / 2);
        expect(card.y + card.h / 2).toBeLessThanOrEqual(layout.height / 2);
        if (index > 0) {
          const before = layout.cards[index - 1];
          expect(card.y).toBeGreaterThan(before.y);
          // mais forte que o teste antigo: além de mais embaixo, não encosta no de cima
          expect(card.y - card.h / 2).toBeGreaterThan(before.y + before.h / 2);
        }
      });
    }
  });

  it("escolhe a pilha estreita no celular e a larga no resto", () => {
    expect(pickLayout(335).name).toBe("narrow");
    expect(pickLayout(599).name).toBe("narrow");
    expect(pickLayout(600).name).toBe("wide");
    expect(pickLayout(900).name).toBe("wide");
  });

  it("a escala cabe na menor das duas medidas e respeita o teto", () => {
    expect(fitScale(wide, 640, 6800)).toBeCloseTo(1);
    expect(fitScale(wide, 6400, 680)).toBeCloseTo(1);
    expect(fitScale(wide, 6400, 6800)).toBe(1.4);
    expect(fitScale(wide, 0, 680)).toBe(1);
  });
});

describe("segment", () => {
  it("o comprimento é a distância e os ângulos apontam para o destino", () => {
    const a = { x: 10, y: 20, z: 30 };
    const b = { x: 70, y: 100, z: -10 };
    const s = segment(a, b);
    expect(s.length).toBeCloseTo(Math.hypot(60, 80, -40));
    // vetor X unitário depois de rotateY(pitch) e rotateZ(yaw), na ordem do CSS
    const yaw = (s.yaw * Math.PI) / 180;
    const pitch = (s.pitch * Math.PI) / 180;
    const dir = { x: Math.cos(pitch) * Math.cos(yaw), y: Math.cos(pitch) * Math.sin(yaw), z: -Math.sin(pitch) };
    expect(dir.x * s.length).toBeCloseTo(60);
    expect(dir.y * s.length).toBeCloseTo(80);
    expect(dir.z * s.length).toBeCloseTo(-40);
  });

  it("ponto repetido não vira NaN", () => {
    const p = { x: 1, y: 2, z: 3 };
    expect(segment(p, p)).toEqual({ from: p, length: 0, yaw: 0, pitch: 0 });
  });

  it("o fio vai da borda de baixo de um documento à de cima do seguinte", () => {
    const [a, b] = wide.cards;
    const s = segment(bottomEdge(a), topEdge(b));
    expect(s.length).toBeGreaterThan(0);
    expect(bottomEdge(a).y).toBeGreaterThan(center(a).y);
    expect(topEdge(b).y).toBeLessThan(center(b).y);
  });
});

describe("flowState", () => {
  it("no instante zero nada chegou e a ficha não existe", () => {
    const s = flowState(0, wide);
    expect(s.enter).toEqual([0, 0, 0, 0]);
    expect(s.tokenOpacity).toBe(0);
    expect(s.auto).toEqual([0, 0, 0, 0]);
  });

  it("a entrada é escalonada e termina com todos no lugar", () => {
    const early = flowState(600, wide).enter;
    expect(early[0]).toBeGreaterThan(early[1]);
    expect(early[1]).toBeGreaterThan(early[3]);
    expect(flowState(START_MS + 200, wide).enter).toEqual([1, 1, 1, 1]);
  });

  it("começa tudo Manual, com a ficha sobre a primeira rotina", () => {
    const s = at(700);
    expect(s.auto).toEqual([0, 0, 0, 0]);
    expect(s.token.x).toBeCloseTo(center(wide.cards[0]).x);
    expect(s.token.y).toBeCloseTo(center(wide.cards[0]).y);
  });

  it("a ficha para sobre cada documento na ordem, e acende o que chegou", () => {
    const afterFirst = at(whenAt(0.3));
    expect(afterFirst.auto[0]).toBe(1);
    expect(afterFirst.auto[1]).toBe(0);

    const afterSecond = at(whenAt(1.3));
    expect(afterSecond.auto.slice(0, 3)).toEqual([1, 1, 0]);
    expect(afterSecond.auto[3]).toBe(0);

    const end = at(whenAt(3.2));
    expect(end.auto).toEqual([1, 1, 1, 1]);
    // termina sobre o centro da última rotina
    expect(end.token.x).toBeCloseTo(center(wide.cards[3]).x);
    expect(end.token.y).toBeCloseTo(center(wide.cards[3]).y);
    expect(end.lift[3]).toBeGreaterThan(0.75);
    expect(at(whenAt(3)).lift[3]).toBeCloseTo(1);
    expect(end.lift[0]).toBe(0);
  });

  it("o progresso vai de -0,4 a 3,2 entre 900 e 8100 ms do ciclo e para nas pontas", () => {
    expect(flowState(0, wide).progress).toBeCloseTo(-0.4);
    expect(at(0).progress).toBeCloseTo(-0.4);
    expect(at(900).progress).toBeCloseTo(-0.4);
    expect(at(4500).progress).toBeCloseTo(1.4);
    expect(at(8100).progress).toBeCloseTo(3.2);
    expect(at(9500).progress).toBeCloseTo(3.2);
  });

  it("o progresso nunca anda para trás durante a viagem", () => {
    let last = -Infinity;
    for (let c = 0; c <= 8100; c += 100) {
      const { progress } = at(c);
      expect(progress).toBeGreaterThanOrEqual(last);
      last = progress;
    }
  });

  it("no fim do ciclo tudo apaga junto e o ciclo seguinte recomeça igual", () => {
    const quiet = at(11100);
    expect(quiet.auto).toEqual([0, 0, 0, 0]);
    expect(quiet.tokenOpacity).toBe(0);
    expect(quiet.lift.every((value) => value === 0)).toBe(true);

    const a = at(4000);
    const b = flowState(START_MS + 4000 + CYCLE_MS, wide);
    expect(b.progress).toBeCloseTo(a.progress);
    expect(b.token.x).toBeCloseTo(a.token.x);
    expect(b.auto).toEqual(a.auto);
  });

  it("a ficha sobe no meio do trecho e desce ao chegar", () => {
    const mid = at(whenAt(0.5));
    expect(mid.token.z).toBeGreaterThan(center(wide.cards[0]).z + 20);
    const land = at(whenAt(1));
    expect(land.token.z).toBeCloseTo(center(wide.cards[1]).z + 6, 0);
  });
});
