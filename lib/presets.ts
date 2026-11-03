import type { StepKind } from "./calculator";

/**
 * Atalhos da primeira pergunta. Trazem o nome, os tipos de passo e o tempo típico de cada um; a
 * frequência e o custo são sempre da pessoa. Dois passos do mesmo tipo somam: a conta é linear por
 * tipo, então o resultado é o mesmo.
 */
export type Preset = { label: string; routine: string; steps: readonly (readonly [minutes: number, kind: StepKind])[] };

export const PRESETS: readonly Preset[] = [
  {
    label: "Notas fiscais",
    routine: "Conferir notas fiscais",
    steps: [[2, "buscar"], [4, "conferir"], [3, "dados"], [1, "avisar"]],
  },
  {
    label: "WhatsApp",
    routine: "Responder pedidos no WhatsApp",
    steps: [[1, "decidir"], [2, "buscar"], [3, "dados"], [2, "avisar"]],
  },
  {
    label: "Entre sistemas",
    routine: "Digitar dados entre sistemas",
    steps: [[2, "dados"], [3, "dados"], [1, "conferir"]],
  },
  {
    label: "Relatório",
    routine: "Montar relatório mensal",
    steps: [[180, "buscar"], [240, "dados"], [120, "conferir"], [180, "decidir"], [20, "avisar"]],
  },
  {
    label: "Cadastros",
    routine: "Cadastrar clientes novos",
    steps: [[2, "buscar"], [4, "dados"], [3, "conferir"], [1, "avisar"]],
  },
  {
    label: "Conciliação",
    routine: "Conciliar o extrato do banco",
    steps: [[5, "buscar"], [25, "conferir"], [15, "dados"], [15, "decidir"]],
  },
  {
    label: "Orçamentos",
    routine: "Montar orçamentos",
    steps: [[5, "decidir"], [8, "buscar"], [12, "dados"], [2, "avisar"]],
  },
];
