/** Conteúdo público da landing Procemiza. Sem métricas, clientes ou resultados inventados. */
export const site = {
  name: "Procemiza",
  legalName: "Procemiza — Inteligência de Negócios",
  domain: "https://procemiza.com.br",
  tagline: "Sistemas para escritórios contábeis que precisam ganhar margem",
  description:
    "A Procemiza constrói automações, integrações e sistemas para escritórios contábeis — menos conferência manual e retrabalho, mais margem por cliente.",
  contactUrl: "https://wa.me/5554999425740",
} as const;

export const nav = [
  { label: "O custo", href: "#custo" },
  { label: "Camadas", href: "#camadas" },
  { label: "Conta 200", href: "#conta-200" },
  { label: "Método", href: "#como-atuamos" },
] as const;

export const cta = {
  primary: "Conversar sobre um gargalo",
  secondary: "Ver como construímos",
} as const;

export const hero = {
  title: "Transforme processo em margem.",
  text: "A Procemiza constrói automações, integrações e sistemas para escritórios contábeis. Nascemos dentro da rotina: do documento que o cliente não envia ao fechamento que sempre aperta no fim do mês.",
} as const;

/** Fora da página desde o foco em contabilidade (OperationalStory desplugado do page.tsx). */
export const companyStory = {
  title: "Uma empresa construída dentro da operação.",
  text: "A Procemiza nasceu observando o trabalho entre mensagens, documentos, planilhas, conferências e sistemas que não conversam. É desse contato com a rotina que surgem soluções feitas para uso real — não para uma apresentação.",
  inputs: [
    "WhatsApp",
    "E-mail",
    "Documento",
    "Planilha",
    "Solicitação",
    "Conferência",
    "Aprovação",
    "Sistema existente",
  ],
  logic: ["Entender contexto", "Validar", "Organizar", "Conectar"],
  outputs: [
    "Informação pronta",
    "Tarefa direcionada",
    "Processo organizado",
    "Registro atualizado",
  ],
} as const;

export const layeredInfrastructure = {
  title: "Infraestrutura operacional em camadas.",
  text: "Cada solução parte dos canais que o escritório já usa, aplica os critérios do departamento, conecta os sistemas e devolve a informação pronta para a equipe agir.",
} as const;

export const marginReality = {
  title: "Honorário mensal não é margem.",
  text: "O contrato é recorrente; o custo de atender também. Horas de conferência, retrabalho de fechamento e cobrança de documento consomem a margem antes de ela aparecer.",
  revenue: "Honorário mensal",
  deductions: [
    "Horas de conferência",
    "Retrabalho de fechamento",
    "Cobrança de documento",
    "Sistemas que não conversam",
  ],
  result: "Margem por cliente",
  note: "O que sobra depois que o escritório entrega.",
} as const;

export const hiddenCost = {
  eyebrow: "Onde a margem se perde",
  intro: "O problema raramente está numa grande falha. Ele se acumula nas pequenas repetições que o mês aprendeu a aceitar.",
  items: [
    {
      n: "01",
      dept: "Atendimento",
      title: "Documento que não chega",
      text: "A equipe cobra o mesmo XML, extrato e comprovante por WhatsApp, e-mail e telefone até o prazo apertar.",
    },
    {
      n: "02",
      dept: "Fiscal",
      title: "Conferência manual",
      text: "Nota, guia e sistema comparados tela a tela para compensar ferramentas que não trocam contexto.",
    },
    {
      n: "03",
      dept: "Contábil",
      title: "Retrabalho no fechamento",
      text: "A mesma informação é digitada, corrigida e reenviada mais de uma vez antes de virar lançamento.",
    },
    {
      n: "04",
      dept: "Pessoal",
      title: "Planilha paralela",
      text: "Regras de folha, prazos e controles vivem em arquivos que só uma pessoa da equipe sabe manter.",
    },
    {
      n: "05",
      dept: "Societário",
      title: "Talento preso no operacional",
      text: "Analista qualificado sustentando rotina em vez de revisar, orientar e segurar o cliente.",
    },
  ],
} as const;

export const conta200 = {
  name: "Conta 200",
  eyebrow: "O que o escritório entrega ao cliente",
  tagline: "Sua contabilidade, onde você estiver.",
  title: "Uma rotina do escritório transformada em sistema.",
  text: "O cliente pede nota, guia ou documento pelo WhatsApp. O pedido ganha contexto — empresa, competência, finalidade —, consulta apenas dados autorizados e volta pronto, sem ocupar a equipe do escritório.",
  flow: [
    {
      n: "01",
      name: "Pedido",
      text: "O cliente pede no canal em que já está — sem novo app, sem novo login.",
    },
    {
      n: "02",
      name: "Contexto",
      text: "Empresa, documento, competência e finalidade são identificados e roteados para o processo certo.",
    },
    {
      n: "03",
      name: "Entrega",
      text: "A resposta volta pronta no WhatsApp. O atendimento deixa de ser fila da equipe.",
    },
  ],
  screenshotNote: "Captura real anonimizada. Conteúdo preservado no canal original.",
} as const;

export const method = {
  title: "Do diagnóstico à melhoria contínua.",
  steps: [
    {
      n: "01",
      name: "Diagnóstico",
      text: "Acompanhar uma rotina real do escritório — fiscal, contábil, pessoal ou atendimento — e ver onde ela perde tempo, contexto e margem.",
      artifact: "Mapa da rotina",
    },
    {
      n: "02",
      name: "Construção",
      text: "Transformar o gargalo em um sistema integrado à rotina, começando pelo recorte que precisa provar valor em semanas.",
      artifact: "Protótipo em uso",
    },
    {
      n: "03",
      name: "Evolução",
      text: "Observar o uso no fechamento seguinte, ajustar regras e ampliar para os outros departamentos.",
      artifact: "Ajuste e expansão",
    },
  ],
} as const;

export const pilot = {
  title: "Comece pela rotina que mais custa ao escritório.",
  text: "Escolhemos uma prioridade concreta — cobrança de documento, conferência fiscal, fechamento —, entendemos o fluxo atual e desenhamos o menor sistema capaz de melhorar o trabalho de verdade.",
  next: [
    "Uma conversa sobre a rotina atual",
    "Definição conjunta do primeiro recorte",
    "Um caminho claro para construir e acompanhar",
  ],
  microcopy: "Sem promessa genérica. O primeiro passo é entender o mês como ele acontece hoje.",
} as const;

export const footer = {
  line: "Automação, integração e sistemas para escritórios contábeis, construídos a partir da rotina real.",
  note: "Procemiza — Inteligência de Negócios",
} as const;
