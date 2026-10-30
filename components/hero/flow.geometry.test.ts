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
        if (index > 0) expect(card.y).toBeGreaterThan(layout.cards[index - 1].y);
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
    expect(fitScale(wide, 640, 7000)).toBeCloseTo(1);
    expect(fitScale(wide, 6400, 700)).toBeCloseTo(1);
    expect(fitScale(wide, 6400, 7000)).toBe(1.4);
    expect(fitScale(wide, 0, 700)).toBe(1);
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
    expect(s.row + s.stamp + s.reply).toBe(0);
  });

  it("a entrada é escalonada e termina com todos no lugar", () => {
    const early = flowState(600, wide).enter;
    expect(early[0]).toBeGreaterThan(early[1]);
    expect(early[1]).toBeGreaterThan(early[3]);
    expect(flowState(START_MS + 200, wide).enter).toEqual([1, 1, 1, 1]);
  });

  it("a ficha para sobre cada documento na ordem, e acende o que chegou", () => {
    const at = (c: number) => flowState(START_MS + c, wide);
    const start = at(700);
    expect(start.progress).toBeCloseTo(0, 1);
    expect(start.row).toBe(0);

    const end = at(7300);
    expect(end.progress).toBeCloseTo(3);
    expect(end.row).toBe(1);
    expect(end.stamp).toBe(1);
    expect(end.reply).toBe(1);
    expect(end.lift[3]).toBeCloseTo(1);
    expect(end.lift[0]).toBe(0);
    // pousa no centro do último documento
    expect(end.token.x).toBeCloseTo(center(wide.cards[3]).x);
    expect(end.token.y).toBeCloseTo(center(wide.cards[3]).y);
  });

  it("o progresso nunca anda para trás durante a viagem", () => {
    let last = -1;
    for (let c = 0; c <= 7300; c += 100) {
      const { progress } = flowState(START_MS + c, wide);
      expect(progress).toBeGreaterThanOrEqual(last);
      last = progress;
    }
  });

  it("no fim do ciclo tudo apaga junto e o ciclo seguinte recomeça igual", () => {
    const quiet = flowState(START_MS + 10700, wide);
    expect(quiet.row + quiet.stamp + quiet.reply + quiet.tokenOpacity).toBe(0);
    expect(quiet.lift.every((value) => value === 0)).toBe(true);

    const a = flowState(START_MS + 3000, wide);
    const b = flowState(START_MS + 3000 + CYCLE_MS, wide);
    expect(b.progress).toBeCloseTo(a.progress);
    expect(b.token.x).toBeCloseTo(a.token.x);
  });

  it("a ficha sobe no meio do trecho e desce ao chegar", () => {
    const mid = flowState(START_MS + 600 + 1100, wide);
    expect(mid.token.z).toBeGreaterThan(center(wide.cards[0]).z + 20);
    const land = flowState(START_MS + 600 + 2200, wide);
    expect(land.token.z).toBeCloseTo(center(wide.cards[1]).z + 6, 0);
  });
});
