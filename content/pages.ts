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
    modified: "2026-10-30",
    priority: 1,
  },
  calculadora: {
    path: "/calculadora",
    name: "Calculadora",
    title: "Calculadora de ganho com automação",
    description:
      "Descreva o processo em passos, com o tempo de cada um, e veja quantas horas e quantos reais a automação devolve por mês. A conta fica aberta.",
    modified: "2026-10-30",
    priority: 0.9,
  },
  automacao: {
    path: "/automacao-de-processos",
    name: "Automação de processos",
    title: "Automação de processos e rotinas",
    description:
      "Transforme tarefas que se repetem em fluxos com critérios claros, do recebimento da informação ao encaminhamento para a pessoa certa.",
    modified: "2026-10-28",
    priority: 0.8,
  },
  integracao: {
    path: "/integracao-de-sistemas",
    name: "Integração de sistemas",
    title: "Integração de sistemas para empresas",
    description:
      "Conecte atendimento, operação e gestão para que a informação circule com contexto, sem copiar e colar entre telas.",
    modified: "2026-10-28",
    priority: 0.8,
  },
  sobMedida: {
    path: "/sistemas-sob-medida",
    name: "Sistemas sob medida",
    title: "Sistemas sob medida para a sua operação",
    description:
      "Uma ferramenta construída em torno do seu jeito de trabalhar, com as regras, as permissões e as etapas que a operação precisa.",
    modified: "2026-10-28",
    priority: 0.8,
  },
  privacidade: {
    path: "/privacidade",
    name: "Privacidade",
    title: "Política de privacidade",
    description: "Que dados o site trata, para quê e como exercer seus direitos pela LGPD.",
    modified: "2026-10-30",
    priority: 0.2,
  },
} as const satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pages;
export const pageList: readonly PageMeta[] = Object.values(pages);
