/**
 * Conteúdo público da Procemiza.
 * Números só aparecem quando vêm do visitante (calculadora) ou de dado autorizado
 * (content/cases.ts). Nada de métrica inventada.
 */

export type Entity = {
  legalName: string;
  /** "Cidade, UF". Preencher quando confirmado; vazio não é renderizado. */
  cityState?: string;
  email?: string;
  /** Só dígitos ou formatado; é exibido como vem. */
  cnpj?: string;
  social: readonly { label: string; url: string }[];
};

export const entity: Entity = {
  legalName: "Procemiza — Inteligência de Negócios",
  cityState: undefined,
  email: undefined,
  cnpj: undefined,
  social: [],
};

export const site = {
  name: "Procemiza",
  /** Host canônico. A produção redireciona o apex para www. */
  domain: "https://www.procemiza.com.br",
  tagline: "Inteligência para a operação. Margem para o negócio.",
  description:
    "Automatizamos rotinas, integramos sistemas e criamos sistemas sob medida para empresas. Calcule quanto tempo sua rotina devolve.",
  contactUrl: "https://wa.me/5554999425740",
} as const;

export const nav = [
  { label: "Calculadora", href: "/#calculadora" },
  { label: "Soluções", href: "/#solucoes" },
  { label: "Conta 200", href: "/#conta-200" },
  { label: "Clientes", href: "/#clientes" },
  { label: "Como funciona", href: "/#como-atuamos" },
] as const;

export const cta = {
  primary: "Calcular minha rotina",
  whatsapp: "Conversar no WhatsApp",
  final: "Conversar sobre uma rotina",
} as const;

export const hero = {
  title: "Automatizamos o trabalho repetido da sua empresa.",
  support: "Transforme processo em margem.",
  text: "Automações, integrações e sistemas sob medida para conectar o que hoje está disperso.",
} as const;

export const calculator = {
  title: "Quanto sua rotina devolve?",
} as const;

export const conta200 = {
  name: "Conta 200",
  tagline: "Sua contabilidade, onde você estiver.",
  title: "Da solicitação à resposta. No WhatsApp.",
  text: "O cliente pede nota, guia ou documento pelo WhatsApp. O pedido ganha contexto — empresa, competência, finalidade —, consulta apenas dados autorizados e volta pronto, sem ocupar a equipe do escritório.",
  flow: [
    { n: "01", name: "Pedido", text: "O cliente pede no canal em que já está — sem novo app, sem novo login." },
    { n: "02", name: "Contexto", text: "Empresa, documento, competência e finalidade são identificados e roteados para o processo certo." },
    { n: "03", name: "Entrega", text: "A resposta volta pronta no WhatsApp. O atendimento deixa de ser fila da equipe." },
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

/** Rascunho: só fatos já presentes no site. Confirmar antes de publicar. */
export const faq = [
  {
    q: "O que a Procemiza faz?",
    a: "Automatiza rotinas, integra os sistemas que a empresa já usa e cria sistemas sob medida. Tudo parte do trabalho real da equipe.",
  },
  {
    q: "Como começa?",
    a: "Por uma conversa sobre a rotina que mais custa. Depois acompanhamos o trabalho, definimos um primeiro recorte e colocamos em uso.",
  },
  {
    q: "Preciso trocar os sistemas que uso hoje?",
    a: "Não. O ponto de partida é conectar o que já existe, para a informação circular sem copiar e colar entre telas.",
  },
  {
    q: "De onde vêm os números da calculadora?",
    a: "Do que você informa: tempo, pessoas e custo da hora, com redução de 80% no cenário esperado e 90% no otimista. A conta fica aberta no resultado. É uma estimativa, não uma promessa.",
  },
  {
    q: "Quanto custa?",
    a: "Depende da rotina e dos sistemas envolvidos. A primeira conversa define o recorte; o valor vem depois dele.",
  },
  {
    q: "O Conta 200 é um produto?",
    a: "É uma aplicação real para contabilidade: o cliente pede nota, guia ou documento pelo WhatsApp e recebe a resposta pronta.",
  },
] as const;

export const pilot = {
  title: "Comece pela rotina que mais custa à sua empresa.",
  next: [
    "Uma conversa sobre a rotina atual",
    "Definição conjunta do primeiro recorte",
    "Um caminho claro para construir e acompanhar",
  ],
} as const;

export const footer = {
  line: "Automação, integração e sistemas sob medida. Construídos a partir da rotina real da sua empresa.",
} as const;
