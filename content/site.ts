/**
 * Conteúdo público da Procemiza. Texto curto: quem visita varre, não lê.
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
  contactUrl: "https://wa.me/555494898181",
} as const;

/** Mesma ordem da página. */
export const nav = [
  { label: "Calculadora", href: "/#calculadora" },
  { label: "Soluções", href: "/#solucoes" },
  { label: "Clientes", href: "/#clientes" },
] as const;

export const cta = {
  primary: "Ver quanto devolve",
  whatsapp: "Falar no WhatsApp",
  final: "Falar no WhatsApp",
} as const;

export const hero = {
  title: "Automatizamos o trabalho repetido da sua empresa.",
  support: "Transforme processo em margem.",
} as const;

export const calculator = {
  title: "Quanto sua rotina devolve?",
} as const;

/** O fecho da página: a ideia do hero volta como cartaz e um convite. */
export const pilot = {
  title: "Menos repetição. Mais margem.",
  lead: "Comece pela rotina que mais custa.",
} as const;
