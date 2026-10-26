export type LayerId = "origens" | "regras" | "integracao" | "entrega";
export type Point3D = { x: number; y: number; z: number };
export type Point2D = Pick<Point3D, "x" | "y">;

export type LayerDefinition = {
  id: LayerId;
  n: string;
  name: string;
  headline: string;
  micro: string;
  items: readonly string[];
  result: string;
  startsAt: number;
  anchor: Point2D;
  route: readonly Point2D[];
};

/** Coordinates belong to the same 480 × 300 plane, including connector ports. */
export const LAYERS = [
  {
    id: "origens", n: "01", name: "Origens", startsAt: 0.12,
    headline: "A operação começa em vários lugares.",
    micro: "Mensagens, documentos e planilhas chegam pelos canais que sua equipe já usa. A primeira mudança é reunir o que estava disperso.",
    items: ["Mensagens", "Documentos", "Planilhas", "Sistemas existentes"],
    result: "Solicitação recebida",
    anchor: { x: 480, y: 172 },
    route: [{ x: 47, y: 151 }, { x: 142, y: 151 }, { x: 142, y: 245 }, { x: 440, y: 245 }],
  },
  {
    id: "regras", n: "02", name: "Regras", startsAt: 0.30,
    headline: "O critério vira processo.",
    micro: "Cada entrada ganha contexto, validação e um responsável. Prazos e permissões deixam de depender da memória de alguém.",
    items: ["Validação", "Prazos", "Responsáveis", "Permissões"],
    result: "Contexto validado",
    anchor: { x: 480, y: 172 },
    route: [{ x: 440, y: 245 }, { x: 355, y: 245 }, { x: 195, y: 245 }, { x: 70, y: 245 }],
  },
  {
    id: "integracao", n: "03", name: "Integração", startsAt: 0.48,
    headline: "Os sistemas passam a trabalhar juntos.",
    micro: "A mesma informação atravessa ferramentas e registros. Sem redigitar, copiar de uma tela para outra ou perder o histórico no caminho.",
    items: ["Integrações", "Sincronização", "Automações", "Registros"],
    result: "Sistemas atualizados",
    anchor: { x: 480, y: 172 },
    route: [{ x: 70, y: 245 }, { x: 150, y: 245 }, { x: 150, y: 225 }, { x: 380, y: 225 }, { x: 380, y: 245 }, { x: 440, y: 245 }],
  },
  {
    id: "entrega", n: "04", name: "Entrega", startsAt: 0.66,
    headline: "A informação chega pronta para agir.",
    micro: "Uma resposta enviada, uma tarefa encaminhada, um registro no lugar certo. A operação segue com clareza sobre o próximo passo.",
    items: ["Tarefa encaminhada", "Resposta enviada", "Informação disponível"],
    result: "Entrega organizada",
    anchor: { x: 480, y: 172 },
    route: [{ x: 440, y: 245 }, { x: 340, y: 245 }, { x: 340, y: 218 }, { x: 250, y: 218 }],
  },
] as const satisfies readonly LayerDefinition[];

export const SCENE = {
  width: 480,
  height: 300,
  thickness: 8,
  perspective: 1400,
  rotationX: 57,
  rotationZ: -19,
  openGap: 118,
  compactGap: 40,
  heroGap: 65,
} as const;

export const INFRA_COPY = {
  title: "Da informação à ação.",
  text: "Uma operação conectada, do primeiro contato à entrega. Veja como cada camada transforma a mesma solicitação.",
  conclusion: "Quatro camadas. Uma operação conectada.",
  conclusionText: "A informação encontra um caminho claro. Sua equipe ganha espaço para cuidar do que faz a empresa avançar.",
} as const;
