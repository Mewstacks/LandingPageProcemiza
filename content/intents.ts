import { solutions } from "./solutions";

/**
 * Rascunho curto: só fatos já presentes no site e a regra da calculadora.
 * Qualquer capacidade nova deve ser confirmada antes de publicar.
 */
export type IntentContent = {
  h1: string;
  /** Resposta direta em uma frase: é o que Google e IAs citam. */
  answer: string;
  whenTitle: string;
  when: readonly string[];
  exampleTitle: string;
  example: string;
  serviceType: string;
};

export const automacao: IntentContent = {
  h1: "Automação de processos e rotinas",
  answer:
    "Transformamos tarefas repetidas em fluxos que andam sozinhos: a informação chega, é conferida e segue para a pessoa certa.",
  whenTitle: "Quando faz sentido",
  when: [
    "A mesma informação é copiada entre telas.",
    "Alguém confere o que o sistema já sabe.",
    "O pedido muda de mão e perde contexto.",
    "A tarefa só anda quando alguém lembra.",
  ],
  exampleTitle: "Exemplo",
  example: solutions[0].example,
  serviceType: "Automação de processos",
};

export const integracao: IntentContent = {
  h1: "Integração de sistemas",
  answer:
    "Conectamos as ferramentas que sua empresa já usa para a informação circular sem copiar e colar.",
  whenTitle: "Quando faz sentido",
  when: [
    "Cada sistema funciona sozinho e alguém digita entre eles.",
    "Equipes olham versões diferentes da mesma informação.",
    "Mensagens, documentos e planilhas guardam partes da mesma história.",
  ],
  exampleTitle: "Exemplo",
  example: solutions[1].example,
  serviceType: "Integração de sistemas",
};

export const sobMedida: IntentContent = {
  h1: "Sistemas sob medida",
  answer:
    "Construímos a ferramenta em torno do seu jeito de trabalhar: regras, permissões e etapas da sua operação.",
  whenTitle: "Quando faz sentido",
  when: [
    "Pedidos e aprovações vivem em mensagens e planilhas.",
    "A operação tem regras e permissões próprias.",
    "A equipe precisa ver o trabalho em andamento.",
  ],
  exampleTitle: "Exemplo",
  example: solutions[2].example,
  serviceType: "Desenvolvimento de sistemas sob medida",
};

export const calculadoraPage = {
  h1: "Calculadora de ganho com automação",
  answer: "Escolha o trabalho, o tempo e a frequência. A faixa de horas que a automação devolve por mês aparece na hora.",
} as const;
