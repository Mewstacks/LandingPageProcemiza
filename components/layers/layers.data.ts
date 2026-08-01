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
    headline: "O trabalho começa espalhado.",
    micro: "A solução parte dos canais, arquivos e sistemas que a operação já usa todos os dias.",
    items: ["WhatsApp", "Documentos", "E-mail", "Planilhas", "Sistemas existentes", "Solicitações internas"],
    callouts: [
      { label: "Mensagens", anchor: { x: 31, y: 32 }, labelPosition: { x: 7, y: 21 }, align: "start" },
      { label: "Documentos", anchor: { x: 39, y: 39 }, labelPosition: { x: 7, y: 44 }, align: "start" },
      { label: "Solicitações", anchor: { x: 47, y: 44 }, labelPosition: { x: 70, y: 51 }, align: "end" },
    ],
  },
  {
    id: "regras",
    n: "02",
    name: "Regras",
    headline: "A lógica ganha forma.",
    micro: "Critérios antes guardados na cabeça das pessoas passam a ser claros, verificáveis e repetíveis.",
    items: ["Validação", "Conferência", "Permissões", "Roteamento", "Contexto", "Critérios operacionais"],
    callouts: [
      { label: "Validação", anchor: { x: 45, y: 40 }, labelPosition: { x: 11, y: 25 }, align: "start" },
      { label: "Permissões", anchor: { x: 58, y: 47 }, labelPosition: { x: 75, y: 36 }, align: "end" },
      { label: "Roteamento", anchor: { x: 53, y: 53 }, labelPosition: { x: 73, y: 59 }, align: "end" },
    ],
  },
  {
    id: "integracao",
    n: "03",
    name: "Integração",
    headline: "As partes começam a conversar.",
    micro: "Dados e ações atravessam sistemas sem depender de novas digitações ou conferências manuais.",
    items: ["APIs", "Banco de dados", "Automações", "Sincronização", "Notificações", "Registros"],
    callouts: [
      { label: "APIs", anchor: { x: 39, y: 45 }, labelPosition: { x: 9, y: 30 }, align: "start" },
      { label: "Automações", anchor: { x: 54, y: 51 }, labelPosition: { x: 75, y: 34 }, align: "end" },
      { label: "Registros", anchor: { x: 64, y: 59 }, labelPosition: { x: 76, y: 70 }, align: "end" },
    ],
  },
  {
    id: "entrega",
    n: "04",
    name: "Entrega",
    headline: "O trabalho volta organizado.",
    micro: "A informação chega no formato em que a equipe consegue agir, acompanhar e decidir.",
    items: ["Sistema", "Painel", "Atendimento", "Tarefa", "Relatório", "Informação pronta"],
    callouts: [
      { label: "Sistema", anchor: { x: 55, y: 42 }, labelPosition: { x: 22, y: 25 }, align: "start" },
      { label: "Tarefa", anchor: { x: 65, y: 52 }, labelPosition: { x: 78, y: 34 }, align: "end" },
      { label: "Informação pronta", anchor: { x: 70, y: 60 }, labelPosition: { x: 76, y: 72 }, align: "end" },
    ],
  },
] as const satisfies readonly LayerDefinition[];
