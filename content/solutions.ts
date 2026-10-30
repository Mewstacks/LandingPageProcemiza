import { pages } from "./pages";

export type Solution = {
  id: "automacao" | "integracao" | "sob-medida";
  title: string;
  /** Uma linha: é tudo que o cartão da home diz. */
  line: string;
  example: string;
  href: string;
};

export const solutions: readonly Solution[] = [
  {
    id: "automacao",
    title: "Automação de rotinas",
    line: "A tarefa repetida vira fluxo automático.",
    example: "Um pedido chega, é conferido e vira tarefa para o responsável.",
    href: pages.automacao.path,
  },
  {
    id: "integracao",
    title: "Integração de sistemas",
    line: "Seus sistemas trocam dados sozinhos.",
    example: "Atendimento, operação e gestão enxergam o mesmo pedido, sempre atualizado.",
    href: pages.integracao.path,
  },
  {
    id: "sob-medida",
    title: "Sistemas sob medida",
    line: "A ferramenta feita para o seu processo.",
    example: "Uma central reúne pedidos, responsáveis e aprovações que viviam em mensagens e planilhas.",
    href: pages.sobMedida.path,
  },
];
