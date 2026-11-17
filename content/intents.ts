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
  answer: "Informe rotinas, tempo e salário. O ganho sai em faixa, com fonte.",
} as const;

export const distribuidoras: IntentContent = {
  h1: "Automação para distribuidoras e atacado",
  answer: "O pedido que chega por WhatsApp vira pedido no sistema, a nota de entrada é lançada e o cadastro fiscal é conferido, sem digitar de novo.",
  whenTitle: "Quando faz sentido",
  when: [
    "O pedido chega por WhatsApp e alguém digita no sistema.",
    "A nota de entrada é lançada à mão, item por item.",
    "O cadastro fiscal dos produtos muda e ninguém confere tudo.",
    "Preço e estoque são conferidos em planilha antes de confirmar.",
  ],
  exampleTitle: "Exemplo",
  example: "O pedido do cliente chega no WhatsApp, é conferido contra preço e estoque e entra no sistema para o responsável aprovar.",
  serviceType: "Automação de processos para distribuidoras e atacado",
};

export const transportadoras: IntentContent = {
  h1: "Automação para transportadoras e logística",
  answer: "CT-e, canhoto e fatura de frete passam a ser conferidos e baixados sozinhos, sem digitar a mesma viagem em três lugares.",
  whenTitle: "Quando faz sentido",
  when: [
    "O canhoto volta por foto ou correio e alguém dá baixa.",
    "A fatura do frete é conferida CT-e por CT-e.",
    "O embarcador manda o pedido em um formato e o sistema pede outro.",
    "O motorista avisa por WhatsApp e a informação fica solta.",
  ],
  exampleTitle: "Exemplo",
  example: "Cada CT-e emitido entra na conferência da fatura e o canhoto recebido dá baixa na viagem certa.",
  serviceType: "Automação de processos para transportadoras e logística",
};

export const industrias: IntentContent = {
  h1: "Automação para indústrias",
  answer: "Pedido de cliente, nota de entrada e cotação de compras passam entre os sistemas da fábrica sem ninguém copiar de uma tela para outra.",
  whenTitle: "Quando faz sentido",
  when: [
    "O pedido do cliente é lançado à mão no ERP.",
    "Compras cotam por e-mail e planilha.",
    "Cada setor olha uma versão diferente do mesmo pedido.",
    "A nota de entrada é conferida contra o pedido de compra manualmente.",
  ],
  exampleTitle: "Exemplo",
  example: "O pedido recebido do cliente entra no ERP, gera a tarefa de produção e avisa compras do que falta.",
  serviceType: "Automação de processos para indústrias",
};

export const clinicas: IntentContent = {
  h1: "Automação para clínicas e laboratórios",
  answer: "O faturamento de convênio, o recurso de glosa e o repasse médico são conferidos sem montar planilha a cada fechamento.",
  whenTitle: "Quando faz sentido",
  when: [
    "O faturamento de convênio é feito guia por guia.",
    "A glosa vira planilha de recurso.",
    "O repasse médico é conferido à mão no fim do mês.",
    "O paciente confirma consulta por WhatsApp e alguém atualiza a agenda.",
  ],
  exampleTitle: "Exemplo",
  example: "As guias do mês são conferidas contra o atendimento e as glosas já saem separadas para recurso.",
  serviceType: "Automação de processos para clínicas e laboratórios",
};

export const contabeis: IntentContent = {
  h1: "Automação para escritórios contábeis",
  answer: "A nota baixada é conferida e vira lançamento no sistema do escritório, e o pedido de documento do cliente é respondido sem digitar.",
  whenTitle: "Quando faz sentido",
  when: [
    "Notas e extratos viram lançamento digitado.",
    "O cliente pede documento pelo WhatsApp e alguém responde um por um.",
    "A conferência de notas e guias consome o fechamento.",
    "O cadastro de cliente novo é repetido em cada sistema.",
  ],
  exampleTitle: "Exemplo",
  example: "A nota baixada do portal é conferida, o lançamento entra no sistema do escritório e o cliente recebe a confirmação.",
  serviceType: "Automação de processos para escritórios contábeis",
};

