/**
 * Quanto do tempo de uma rotina volta, por tipo de trabalho, com a fonte de cada ponta.
 *
 * `prudent` vem de caso medido ou de experimento; `ceiling` é o potencial técnico (o que a
 * tecnologia já faz quando o dado é digital e a regra é clara). Potencial técnico NÃO é garantia:
 * por isso a faixa se chama Prudente e Teto. Sem dado de PME nem do Brasil: o relatório diz isso.
 *
 * Fontes (lidas nas páginas originais em 04/11/2026):
 * - MIT SMR 2016 (Lacity e Willcocks): verificação de regra, 30 pessoas → cerca de 12 (−60%).
 * - LSE 15/03 (Xchanging, 2015): 93% dos casos sem humano, 7% voltam para pessoas. Um caso, Blue Prism.
 * - MGI 2023, Exhibit 10: processar dados 90,5%, coletar 79%, aplicar expertise 58,5%, interagir 45%.
 * - Dell'Acqua et al. 2026: tarefas dentro da fronteira 25,1% mais rápidas; fora dela, pior.
 * - Brynjolfsson, Li e Raymond (QJE 2025): atendimento +14% por hora, novatos +34%.
 */
export type Kind = "dados" | "conferir" | "avisar" | "buscar" | "decidir" | "pessoas";

export type Evidence = {
  id: Kind;
  label: string;
  short: string;
  prudent: number;
  ceiling: number;
  source: string;
};

export const KINDS: readonly Evidence[] = [
  { id: "dados", label: "Copiar ou digitar", short: "Copiar", prudent: 0.6, ceiling: 0.9, source: "MIT SMR 2016 · MGI 2023 · LSE 2015" },
  { id: "conferir", label: "Conferir com regra", short: "Conferir", prudent: 0.6, ceiling: 0.9, source: "MIT SMR 2016 · MGI 2023 · LSE 2015" },
  { id: "avisar", label: "Avisar ou enviar", short: "Avisar", prudent: 0.6, ceiling: 0.9, source: "MIT SMR 2016 · MGI 2023" },
  { id: "buscar", label: "Procurar ou juntar", short: "Procurar", prudent: 0.25, ceiling: 0.79, source: "Dell'Acqua 2026 · MGI 2023" },
  { id: "decidir", label: "Analisar ou decidir", short: "Analisar", prudent: 0, ceiling: 0.25, source: "Dell'Acqua 2026" },
  { id: "pessoas", label: "Falar com gente", short: "Conversar", prudent: 0, ceiling: 0.34, source: "Brynjolfsson 2025" },
];

export type Source = { name: string; year: number; note: string; url: string };

export const SOURCES: readonly Source[] = [
  { name: "MIT Sloan Management Review", year: 2016, note: "Lacity e Willcocks, 16 casos de automação de serviços", url: "https://sloanreview.mit.edu/article/a-new-approach-to-automating-services/" },
  { name: "LSE, Xchanging", year: 2015, note: "93% dos casos sem humano; um caso, patrocinado por fornecedor", url: "https://researchonline.lse.ac.uk/id/eprint/64518/1/OUWRPS_15_03_published.pdf" },
  { name: "McKinsey Global Institute", year: 2023, note: "Potencial técnico por tipo de atividade (Exhibit 10)", url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier" },
  { name: "Dell'Acqua et al.", year: 2026, note: "Experimento com 758 consultores", url: "https://digitalfluency.mattalldian.com/research/foundational/dell-acqua-et-al-2026-navigating-the-jagged-technological-frontier.pdf" },
  { name: "Brynjolfsson, Li e Raymond (QJE)", year: 2025, note: "Mais de 5.000 atendentes", url: "https://www.nber.org/papers/w31161" },
];

export function evidenceOf(id: Kind): Evidence | undefined {
  return KINDS.find((k) => k.id === id);
}
