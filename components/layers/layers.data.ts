export type LayerId = "origens" | "regras" | "integracao" | "entrega";

export type LayerCallout = {
  label: string;
  anchor: { x: number; y: number };
  labelPosition: { x: number; y: number };
  align: "start" | "end";
};

export type LayerDefinition = {
  id: LayerId;
  n: string;
  name: string;
  headline: string;
  micro: string;
  items: readonly string[];
  callouts: readonly LayerCallout[];
};

export const LAYERS = [
  {
    id: "origens",
    n: "01",
    name: "Origens",
    headline: "O mês começa espalhado.",
    micro: "A solução parte dos canais em que o cliente já manda documento — não de um portal novo para ele aprender.",
    items: ["WhatsApp do cliente", "Notas e XML", "E-mail", "Extratos", "Planilhas", "Sistema contábil"],
    callouts: [
      { label: "Mensagens", anchor: { x: 31, y: 32 }, labelPosition: { x: 7, y: 21 }, align: "start" },
      { label: "Notas", anchor: { x: 39, y: 39 }, labelPosition: { x: 7, y: 44 }, align: "start" },
      { label: "Extratos", anchor: { x: 47, y: 44 }, labelPosition: { x: 70, y: 51 }, align: "end" },
    ],
  },
  {
    id: "regras",
    n: "02",
    name: "Regras",
    headline: "O critério sai da cabeça da equipe.",
    micro: "Competência, prazo, regime e responsável viram regra clara, verificável e repetível.",
    items: ["Validação", "Competência", "Prazo", "Responsável", "Permissões", "Conferência"],
    callouts: [
      { label: "Validação", anchor: { x: 45, y: 40 }, labelPosition: { x: 11, y: 25 }, align: "start" },
      { label: "Prazo", anchor: { x: 58, y: 47 }, labelPosition: { x: 75, y: 36 }, align: "end" },
      { label: "Permissões", anchor: { x: 53, y: 53 }, labelPosition: { x: 73, y: 59 }, align: "end" },
    ],
  },
  {
    id: "integracao",
    n: "03",
    name: "Integração",
    headline: "As partes começam a conversar.",
    micro: "Documento, dado e tarefa atravessam os sistemas do escritório sem nova digitação.",
    items: ["Integrações", "Banco de dados", "Automações", "Sincronização", "Avisos de prazo", "Registro do atendimento"],
    callouts: [
      { label: "Integrações", anchor: { x: 39, y: 45 }, labelPosition: { x: 9, y: 30 }, align: "start" },
      { label: "Automações", anchor: { x: 54, y: 51 }, labelPosition: { x: 75, y: 34 }, align: "end" },
      { label: "Registros", anchor: { x: 64, y: 59 }, labelPosition: { x: 76, y: 70 }, align: "end" },
    ],
  },
  {
    id: "entrega",
    n: "04",
    name: "Entrega",
    headline: "A rotina volta organizada.",
    micro: "Cada departamento recebe a informação no formato em que consegue agir: fiscal, contábil, pessoal e atendimento.",
    items: ["Painel de pendências", "Tarefa por departamento", "Documento no lugar certo", "Aviso ao cliente", "Relatório", "Registro atualizado"],
    callouts: [
      { label: "Painel", anchor: { x: 55, y: 42 }, labelPosition: { x: 22, y: 25 }, align: "start" },
      { label: "Tarefa", anchor: { x: 65, y: 52 }, labelPosition: { x: 78, y: 34 }, align: "end" },
      { label: "Pendências", anchor: { x: 70, y: 60 }, labelPosition: { x: 76, y: 72 }, align: "end" },
    ],
  },
] as const satisfies readonly LayerDefinition[];
