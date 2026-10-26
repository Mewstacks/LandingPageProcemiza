export type Solution = {
  id: "automacao" | "integracao" | "sob-medida";
  title: string;
  description: string;
  example: string;
  visualTitle: string;
  visualCaption: string;
};

export const solutions: readonly Solution[] = [
  {
    id: "automacao",
    title: "Automação de rotinas",
    description:
      "Transforme tarefas que se repetem em um fluxo com critérios claros, do recebimento da informação ao encaminhamento para a pessoa certa.",
    example:
      "Uma solicitação chega, os dados são conferidos e o responsável recebe uma tarefa pronta para seguir.",
    visualTitle: "Uma solicitação encontra seu caminho.",
    visualCaption: "Receber, conferir e encaminhar.",
  },
  {
    id: "integracao",
    title: "Integração de sistemas",
    description:
      "Conecte as ferramentas que a empresa já usa para que a informação circule com contexto, sem depender de copiar e colar entre telas.",
    example:
      "Um pedido conecta atendimento, operação e gestão. Cada equipe acompanha a mesma informação atualizada.",
    visualTitle: "A mesma informação, em todos os lugares.",
    visualCaption: "Ferramentas diferentes. Um processo conectado.",
  },
  {
    id: "sob-medida",
    title: "Sistemas sob medida",
    description:
      "Construa uma ferramenta em torno do seu jeito de trabalhar, com as regras, as permissões e as etapas que a operação precisa.",
    example:
      "Uma central reúne solicitações, responsáveis e aprovações que antes ficavam espalhados em mensagens e planilhas.",
    visualTitle: "Uma visão clara do trabalho em andamento.",
    visualCaption: "O fluxo da sua empresa, em um só ambiente.",
  },
];
