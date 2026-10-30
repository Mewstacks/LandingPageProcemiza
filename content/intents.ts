import { solutions } from "./solutions";

/**
 * Rascunho curto: só fatos já presentes no site e a regra da calculadora.
 * Qualquer capacidade nova deve ser confirmada antes de publicar.
 */
export type Qa = { q: string; a: string };

export type IntentContent = {
  h1: string;
  /** Resposta direta em uma frase: é o que Google e IAs citam. */
  answer: string;
  whenTitle: string;
  when: readonly string[];
  exampleTitle: string;
  example: string;
  serviceType: string;
  faq: readonly Qa[];
};

export const steps = [
  { name: "Diagnóstico", text: "Acompanhamos uma rotina real." },
  { name: "Construção", text: "Um primeiro recorte entra em uso." },
  { name: "Evolução", text: "Ajustamos e ampliamos com o uso." },
] as const;

const preco: Qa = {
  q: "Quanto custa?",
  a: "Depende da rotina. A conversa define o recorte; o valor vem depois.",
};

const semTrocar: Qa = {
  q: "Preciso trocar meus sistemas?",
  a: "Não. Conectamos o que você já usa, sem copiar e colar entre telas.",
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
  faq: [
    {
      q: "Que rotina automatizar primeiro?",
      a: "A que se repete, segue regras claras e toma tempo de várias pessoas.",
    },
    {
      q: "Quanto tempo devolve?",
      a: "Depende da rotina. A calculadora estima 80% e, no cenário otimista, 90%. É estimativa.",
    },
    semTrocar,
    preco,
  ],
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
  faq: [
    semTrocar,
    {
      q: "O que muda para a equipe?",
      a: "Menos digitação. Cada área vê a mesma informação, atualizada.",
    },
    {
      q: "Como saber se vale a pena?",
      a: "Some o tempo gasto copiando e conferindo. A calculadora faz a conta.",
    },
    preco,
  ],
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
  faq: [
    {
      q: "Precisa começar grande?",
      a: "Não. Começamos por um recorte, colocamos em uso e ampliamos.",
    },
    semTrocar,
    preco,
  ],
};

export const calculadoraPage = {
  h1: "Calculadora de ganho com automação",
  answer: "Informe rotina, tempo e custo. Veja quanto a automação devolve por mês.",
  how: [
    "Horas por mês = tempo por pessoa × pessoas (21 dias úteis, 52/12 semanas).",
    "Custo da hora = salário × 1,7 ÷ 220, ou o valor da hora que você digitar.",
    "Horas devolvidas = horas por mês × 80% (90% no cenário otimista).",
    "Ganho = horas devolvidas × custo da hora. Por ano, × 12.",
  ],
  faq: [
    {
      q: "A calculadora guarda meus dados?",
      a: "Não. Os números ficam no seu navegador. O texto da rotina só sai daqui se você abrir o WhatsApp.",
    },
    {
      q: "Por que 80% e 90%?",
      a: "São os cenários esperado e otimista para rotinas repetitivas com regra clara. Rotinas com muita exceção devolvem menos.",
    },
    {
      q: "É uma promessa?",
      a: "Não. É uma estimativa sobre os números que você informa.",
    },
  ],
} as const;
