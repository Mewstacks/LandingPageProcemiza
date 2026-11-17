/**
 * Registro único de rotas indexáveis: alimenta sitemap, metadata, breadcrumb e links.
 * `modified` é a data do conteúdo (ISO), não a do build: só muda quando o texto muda.
 */
export type PageMeta = {
  path: string;
  /** Rótulo curto para breadcrumb e links. */
  name: string;
  title: string;
  description: string;
  modified: string;
  priority: number;
};

export const pages = {
  home: {
    path: "/",
    name: "Início",
    title: "Procemiza | Automação, integração e sistemas sob medida",
    description:
      "Automatizamos rotinas, integramos sistemas e criamos sistemas sob medida para empresas. Calcule quanto tempo sua rotina devolve.",
    modified: "2026-11-09",
    priority: 1,
  },
  calculadora: {
    path: "/calculadora",
    name: "Calculadora",
    title: "Calculadora de ganho com automação",
    description:
      "Informe rotinas, tempo e salário e veja o ganho por ano em faixa, com fontes. Relatório completo por e-mail.",
    modified: "2026-11-05",
    priority: 0.9,
  },
  automacao: {
    path: "/automacao-de-processos",
    name: "Automação de processos",
    title: "Automação de processos e rotinas",
    description:
      "Transforme tarefas que se repetem em fluxos com critérios claros, do recebimento da informação ao encaminhamento para a pessoa certa.",
    modified: "2026-10-31",
    priority: 0.8,
  },
  integracao: {
    path: "/integracao-de-sistemas",
    name: "Integração de sistemas",
    title: "Integração de sistemas para empresas",
    description:
      "Conecte atendimento, operação e gestão para que a informação circule com contexto, sem copiar e colar entre telas.",
    modified: "2026-10-31",
    priority: 0.8,
  },
  sobMedida: {
    path: "/sistemas-sob-medida",
    name: "Sistemas sob medida",
    title: "Sistemas sob medida para a sua operação",
    description:
      "Uma ferramenta construída em torno do seu jeito de trabalhar, com as regras, as permissões e as etapas que a operação precisa.",
    modified: "2026-10-31",
    priority: 0.8,
  },
  distribuidoras: {
    path: "/automacao-para-distribuidoras",
    name: "Distribuidoras e atacado",
    title: "Automação para distribuidoras e atacado",
    description:
      "Pedido por WhatsApp que vira pedido no sistema, nota de entrada sem digitar e cadastro fiscal conferido. Calcule quanto tempo a rotina devolve.",
    modified: "2026-11-17",
    priority: 0.7,
  },
  transportadoras: {
    path: "/automacao-para-transportadoras",
    name: "Transportadoras",
    title: "Automação para transportadoras e logística",
    description:
      "CT-e, canhoto e fatura de frete conferidos sem digitar de novo. Calcule quanto tempo a rotina da sua transportadora devolve.",
    modified: "2026-11-17",
    priority: 0.7,
  },
  industrias: {
    path: "/automacao-para-industrias",
    name: "Indústrias",
    title: "Automação para indústrias",
    description:
      "Pedido de cliente, nota de entrada e compras sem lançamento manual entre sistemas. Calcule quanto tempo a rotina da fábrica devolve.",
    modified: "2026-11-17",
    priority: 0.7,
  },
  clinicas: {
    path: "/automacao-para-clinicas",
    name: "Clínicas e laboratórios",
    title: "Automação para clínicas e laboratórios",
    description:
      "Faturamento de convênio, glosa e repasse conferidos sem planilha. Calcule quanto tempo a rotina da clínica devolve.",
    modified: "2026-11-17",
    priority: 0.7,
  },
  contabeis: {
    path: "/automacao-para-escritorios-contabeis",
    name: "Escritórios contábeis",
    title: "Automação para escritórios contábeis",
    description:
      "Nota baixada, conferida e lançada sem digitar; pedido de documento respondido no WhatsApp. Calcule quanto tempo o fechamento devolve.",
    modified: "2026-11-17",
    priority: 0.7,
  },
  privacidade: {
    path: "/privacidade",
    name: "Privacidade",
    title: "Política de privacidade",
    description: "Que dados o site trata, para quê e como exercer seus direitos pela LGPD.",
    modified: "2026-11-05",
    priority: 0.2,
  },
} as const satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pages;
export const pageList: readonly PageMeta[] = Object.values(pages);

/** Páginas por setor: uma por tipo de empresa com rotina repetida; alimentam o rodapé e o sitemap. */
export const sectorKeys = ["distribuidoras", "transportadoras", "industrias", "clinicas", "contabeis"] as const satisfies readonly PageKey[];
