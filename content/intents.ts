import { method } from "./site";
import { solutions } from "./solutions";

/**
 * Rascunho: só fatos já presentes no site (solutions, method, Conta 200) e a
 * regra da calculadora. Qualquer capacidade nova deve ser confirmada antes de publicar.
 */
export type Qa = { q: string; a: string };

export type IntentContent = {
  h1: string;
  /** Resposta direta, 2 frases: é o que Google e IAs citam. */
  answer: string;
  whenTitle: string;
  when: readonly string[];
  exampleTitle: string;
  example: string;
  serviceType: string;
  faq: readonly Qa[];
};

export const methodSteps = method.steps;

const preco: Qa = {
  q: "Quanto custa?",
  a: "Depende da rotina e dos sistemas envolvidos. A primeira conversa define o recorte; o valor vem depois dele.",
};

const semTrocar: Qa = {
  q: "Preciso trocar os sistemas que uso hoje?",
  a: "Não. O ponto de partida é conectar o que já existe, para a informação circular sem copiar e colar entre telas.",
};

export const automacao: IntentContent = {
  h1: "Automação de processos e rotinas para empresas",
  answer:
    "Automação de rotinas transforma tarefas que se repetem em um fluxo com critérios claros: a informação chega, é conferida e segue para a pessoa certa, sem ninguém copiar, digitar ou lembrar. A Procemiza começa por uma rotina real da sua empresa e coloca a automação em uso.",
  whenTitle: "Quando faz sentido",
  when: [
    "A mesma informação é copiada de um lugar para outro.",
    "Alguém confere, tela por tela, o que o sistema já sabe.",
    "O pedido muda de mão, perde contexto e volta para o início.",
    "Uma tarefa só anda quando alguém lembra de fazer.",
  ],
  exampleTitle: "Exemplo",
  example: solutions[0].example,
  serviceType: "Automação de processos",
  faq: [
    {
      q: "Que rotina vale automatizar primeiro?",
      a: "A que se repete, segue regras claras e toma tempo de mais de uma pessoa. Na calculadora, informe o tempo e veja quanto ela devolve para comparar com as outras.",
    },
    {
      q: "Quanto tempo a automação devolve?",
      a: "Depende da rotina. Na calculadora, o cenário esperado considera 80% do tempo devolvido e o otimista 90%, sobre os números que você informa. É estimativa, não promessa.",
    },
    semTrocar,
    {
      q: "Como começa o projeto?",
      a: "Por um diagnóstico: acompanhamos uma rotina real, ouvimos quem faz o trabalho e definimos um primeiro recorte.",
    },
    preco,
  ],
};

export const integracao: IntentContent = {
  h1: "Integração de sistemas: conecte o que sua empresa já usa",
  answer:
    "Integração de sistemas conecta as ferramentas que a empresa já usa para que a informação circule com contexto, sem depender de copiar e colar entre telas. Atendimento, operação e gestão passam a trabalhar sobre a mesma informação atualizada.",
  whenTitle: "Quando faz sentido",
  when: [
    "Cada sistema funciona sozinho e alguém ainda digita, avisa e atualiza entre eles.",
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
      a: "A informação chega com contexto e a equipe deixa de redigitar. Cada área acompanha a mesma informação atualizada.",
    },
    {
      q: "Como saber se vale a pena?",
      a: "Some o tempo que a equipe gasta copiando e conferindo entre sistemas. A calculadora faz essa conta com os seus números.",
    },
    preco,
  ],
};

export const sobMedida: IntentContent = {
  h1: "Sistemas sob medida para a sua operação",
  answer:
    "Um sistema sob medida é uma ferramenta construída em torno do seu jeito de trabalhar, com as regras, as permissões e as etapas que a operação precisa. O sistema nasce do processo, e não o contrário.",
  whenTitle: "Quando faz sentido",
  when: [
    "Solicitações, responsáveis e aprovações ficam espalhados em mensagens e planilhas.",
    "A operação tem regras e permissões próprias.",
    "A equipe precisa de uma visão clara do trabalho em andamento.",
  ],
  exampleTitle: "Exemplo",
  example: solutions[2].example,
  serviceType: "Desenvolvimento de sistemas sob medida",
  faq: [
    {
      q: "Precisa começar grande?",
      a: "Não. Começamos com um recorte claro e colocamos o sistema em uso; depois acompanhamos o uso real, ajustamos as regras e ampliamos.",
    },
    semTrocar,
    preco,
  ],
};

export const conta200Page = {
  h1: "Conta 200: pedidos de contabilidade pelo WhatsApp",
  answer:
    "O Conta 200 é uma aplicação para escritórios de contabilidade. O cliente pede nota, guia ou documento pelo WhatsApp, o pedido ganha contexto e a resposta volta pronta, sem ocupar a equipe do escritório.",
  faq: [
    {
      q: "O que o cliente consegue pedir?",
      a: "Nota, guia ou documento, pelo WhatsApp.",
    },
    {
      q: "O cliente precisa instalar um app novo?",
      a: "Não. Ele pede no canal em que já está, sem novo app e sem novo login.",
    },
    {
      q: "Quais dados o Conta 200 consulta?",
      a: "Apenas dados autorizados. O pedido é identificado por empresa, documento, competência e finalidade antes de seguir para o processo certo.",
    },
  ],
} as const;

export const calculadoraPage = {
  h1: "Calculadora de ganho com automação",
  answer:
    "Informe a rotina, o tempo que ela toma e o custo da hora de quem a faz. A calculadora mostra quantas horas e quantos reais a automação devolve por mês, com a conta aberta.",
  how: [
    "Horas por mês = tempo por pessoa × pessoas, com 21 dias úteis e 52/12 semanas por mês.",
    "Custo da hora = salário × (1 + encargos) ÷ 220. Encargos de 70% (CLT) ou 50% (Simples), regra de bolso editável; ou digite o valor da hora.",
    "Horas devolvidas = horas por mês × redução. O cenário esperado usa 80% e o otimista 90%; a redução é editável.",
    "Ganho por mês = horas devolvidas × custo da hora. Ganho por ano = ganho por mês × 12.",
  ],
  faq: [
    {
      q: "A calculadora guarda meus dados?",
      a: "Não envia nada a servidor. Os números ficam no navegador, nesta aba, e somem ao fechá-la. O texto da rotina só sai daqui se você abrir o WhatsApp.",
    },
    {
      q: "Por que 80% e 90%?",
      a: "São os cenários esperado e otimista para rotinas repetitivas com regras claras. Rotinas com muita exceção devolvem menos: ajuste a redução para o seu caso.",
    },
    {
      q: "O resultado é uma promessa?",
      a: "Não. É uma estimativa sobre os números que você informa. A primeira conversa com a Procemiza confere a rotina real.",
    },
  ],
} as const;
