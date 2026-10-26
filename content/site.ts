/** Conteúdo público da Procemiza. Resultados quantitativos dependem de evidência. */
export const site = {
  name: "Procemiza",
  legalName: "Procemiza — Inteligência de Negócios",
  domain: "https://procemiza.com.br",
  tagline: "Inteligência para a operação. Margem para o negócio.",
  description:
    "Automações, integrações e sistemas sob medida para conectar sua operação, reduzir retrabalho e transformar processo em margem.",
  contactUrl: "https://wa.me/5554999425740",
} as const;

export const nav = [
  { label: "Soluções", href: "#solucoes" },
  { label: "Camadas", href: "#camadas" },
  { label: "Clientes", href: "#clientes" },
  { label: "Método", href: "#como-atuamos" },
] as const;

export const cta = {
  primary: "Conversar sobre um gargalo",
  secondary: "Ver como construímos",
} as const;

export const hero = {
  title: "Transforme processo em margem.",
  text: "Automações, integrações e sistemas sob medida para conectar o que hoje está disperso. Menos trabalho repetido. Mais espaço para o seu negócio.",
} as const;

/** Conteúdo institucional disponível para futuras páginas. */
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
  text: "Dos canais que sua empresa já usa à informação pronta para agir. Quatro níveis conectados, uma operação que faz sentido.",
} as const;

export const marginReality = {
  title: "O custo está nas repetições.",
  text: "Uma informação copiada. Uma conferência refeita. Um pedido que depende de alguém lembrar. A margem se perde nas pequenas interrupções que viraram rotina.",
  revenue: "Receita",
  deductions: [
    "Horas de conferência",
    "Retrabalho",
    "Busca por informação",
    "Sistemas que não conversam",
  ],
  result: "Margem",
  note: "Uma operação melhor também constrói um negócio mais eficiente.",
} as const;

export const hiddenCost = {
  eyebrow: "Onde a margem se perde",
  intro: "O problema raramente está numa grande falha. Ele se acumula nas pequenas repetições que o mês aprendeu a aceitar.",
  items: [
    {
      n: "01",
      dept: "Informação",
      title: "Tudo em lugares diferentes",
      text: "Mensagens, documentos e planilhas guardam partes da mesma história. A equipe precisa juntar tudo de novo.",
    },
    {
      n: "02",
      dept: "Conferência",
      title: "Conferência manual",
      text: "Telas comparadas uma a uma, validações repetidas e decisões que dependem da memória de uma pessoa.",
    },
    {
      n: "03",
      dept: "Processos",
      title: "O mesmo trabalho, outra vez",
      text: "O pedido muda de mão, perde contexto e volta para o início. O tempo da equipe vai embora com ele.",
    },
    {
      n: "04",
      dept: "Sistemas",
      title: "Ferramentas que não conversam",
      text: "Cada sistema funciona sozinho. Entre eles, alguém ainda copia, digita, avisa e atualiza.",
    },
  ],
} as const;

export const conta200 = {
  name: "Conta 200",
  eyebrow: "Uma aplicação real / Contabilidade",
  tagline: "Sua contabilidade, onde você estiver.",
  title: "Da solicitação à resposta. No WhatsApp.",
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
  screenshotNote: "Recorte da solicitação original. Empresa identificada como X.",
} as const;

export const method = {
  title: "Do diagnóstico à melhoria contínua.",
  steps: [
    {
      n: "01",
      name: "Diagnóstico",
      text: "Acompanhar uma rotina real, ouvir quem faz o trabalho e identificar onde sua empresa perde tempo, contexto e margem.",
      artifact: "Mapa da rotina",
    },
    {
      n: "02",
      name: "Construção",
      text: "Transformar o gargalo em uma solução integrada à operação. Começar com um recorte claro e colocar o sistema em uso.",
      artifact: "Protótipo em uso",
    },
    {
      n: "03",
      name: "Evolução",
      text: "Acompanhar o uso real, ajustar as regras e ampliar a solução conforme as necessidades do negócio.",
      artifact: "Ajuste e expansão",
    },
  ],
} as const;

export const pilot = {
  title: "Comece pela rotina que mais custa à sua empresa.",
  text: "Um processo repetitivo, uma integração que falta, uma equipe sobrecarregada. Conte onde o trabalho trava. Vamos entender o fluxo e encontrar um primeiro passo concreto.",
  next: [
    "Uma conversa sobre a rotina atual",
    "Definição conjunta do primeiro recorte",
    "Um caminho claro para construir e acompanhar",
  ],
  microcopy: "A primeira conversa é sobre sua operação, seus desafios e o que vale a pena resolver primeiro.",
} as const;

export const footer = {
  line: "Automação, integração e sistemas sob medida. Construídos a partir da rotina real da sua empresa.",
  note: "Procemiza — Inteligência de Negócios",
} as const;
