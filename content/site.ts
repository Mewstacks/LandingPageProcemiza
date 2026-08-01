/** Conteúdo público da landing Procemiza. Sem métricas, clientes ou resultados inventados. */
export const site = {
  name: "Procemiza",
  legalName: "Procemiza — Inteligência de Negócios",
  domain: "https://procemiza.com.br",
  tagline: "Sistemas para operações que precisam fluir melhor",
  description:
    "A Procemiza organiza processos dispersos e constrói automações, integrações e sistemas úteis para a operação real.",
  /** [CANAL OFICIAL DE CONTATO NECESSÁRIO] Validar antes de publicar. */
  contactUrl: "https://procemiza.com.br",
} as const;

export const nav = [
  { label: "A empresa", href: "#empresa" },
  { label: "Camadas", href: "#camadas" },
  { label: "O custo", href: "#custo" },
  { label: "Conta 200", href: "#conta-200" },
  { label: "Método", href: "#como-atuamos" },
] as const;

export const cta = {
  primary: "Conversar sobre um gargalo",
  secondary: "Ver como construímos",
} as const;

export const hero = {
  title: "Transforme processo em margem.",
  text: "A Procemiza entende como o trabalho realmente acontece, conecta o que está disperso e constrói sistemas que devolvem clareza, tempo e capacidade para a operação.",
} as const;

export const companyStory = {
  title: "Uma empresa construída dentro da operação.",
  text: "A Procemiza nasceu observando o trabalho entre mensagens, documentos, planilhas, conferências e sistemas que não conversam. É desse contato com a rotina que surgem soluções feitas para uso real — não para uma apresentação.",
  inputs: [
    "WhatsApp",
    "E-mail",
    "Documento",
    "Planilha",
    "Solicitação",
    "Conferência",
    "Aprovação",
    "Sistema existente",
  ],
  logic: ["Entender contexto", "Validar", "Organizar", "Conectar"],
  outputs: [
    "Informação pronta",
    "Tarefa direcionada",
    "Processo organizado",
    "Registro atualizado",
  ],
} as const;

export const layeredInfrastructure = {
  title: "Infraestrutura operacional em camadas.",
  text: "Cada solução parte das origens que a operação já usa, aplica regras claras, conecta sistemas e devolve uma entrega que as pessoas conseguem usar.",
} as const;

export const marginReality = {
  title: "Mensalidade não é lucro.",
  text: "Receita não representa margem quando a operação consome horas, pessoas e conferências que nunca aparecem na linha principal do contrato.",
  revenue: "Receita recorrente",
  deductions: ["Horas invisíveis", "Retrabalho", "Conferências manuais", "Ferramentas desconectadas"],
  result: "Margem real",
  note: "O que sobra depois que a operação acontece.",
} as const;

export const hiddenCost = {
  title: "O custo invisível da ineficiência.",
  intro: "O problema raramente está em uma grande falha. Ele se acumula nas pequenas repetições que a rotina aprendeu a aceitar.",
  items: [
    {
      n: "01",
      title: "Informações dispersas",
      text: "O dado existe, mas está dividido entre conversas, sistemas e pessoas — longe de quem precisa decidir.",
    },
    {
      n: "02",
      title: "Conferências manuais",
      text: "A equipe compara telas, arquivos e versões para compensar ferramentas que não compartilham contexto.",
    },
    {
      n: "03",
      title: "Retrabalho constante",
      text: "A mesma informação é digitada, corrigida e encaminhada mais de uma vez antes de chegar ao destino.",
    },
    {
      n: "04",
      title: "Planilhas frágeis",
      text: "Regras importantes ficam presas a fórmulas, arquivos paralelos e conhecimento concentrado em poucas pessoas.",
    },
    {
      n: "05",
      title: "Documentos fora de contexto",
      text: "Arquivos chegam sem empresa, período, finalidade ou próximo passo claramente registrados.",
    },
    {
      n: "06",
      title: "Talento preso no operacional",
      text: "Pessoas qualificadas gastam energia mantendo a rotina de pé em vez de melhorar a operação.",
    },
  ],
} as const;

export const conta200 = {
  name: "Conta 200",
  tagline: "Sua contabilidade, onde você estiver.",
  title: "Um processo existente transformado em sistema.",
  text: "No Conta 200, o cliente pede documentos e informações pelo WhatsApp. A solicitação ganha contexto, consulta apenas dados autorizados e segue para a entrega no canal que a pessoa já usa.",
  flow: [
    {
      n: "01",
      name: "Pedido",
      text: "O cliente envia a informação no canal em que já está.",
    },
    {
      n: "02",
      name: "Contexto",
      text: "Empresa, documento, período e finalidade são organizados para o processo correto.",
    },
    {
      n: "03",
      name: "Entrega",
      text: "A informação volta pronta para continuar o trabalho, sem criar mais uma ferramenta para aprender.",
    },
  ],
  screenshotNote: "Captura real anonimizada. Conteúdo preservado no canal original.",
} as const;

export const method = {
  title: "Do diagnóstico à melhoria contínua.",
  steps: [
    {
      n: "01",
      name: "Diagnóstico",
      text: "Entender onde o processo perde tempo, contexto e margem — olhando pessoas, ferramentas, regras e exceções.",
      artifact: "Mapa do processo",
    },
    {
      n: "02",
      name: "Construção",
      text: "Transformar o gargalo em uma solução integrada à operação, começando pelo núcleo que precisa provar valor.",
      artifact: "Protótipo funcional",
    },
    {
      n: "03",
      name: "Evolução",
      text: "Observar o uso, ajustar regras e melhorar continuamente o que foi construído.",
      artifact: "Acompanhamento e ajustes",
    },
  ],
} as const;

export const pilot = {
  title: "Comece pelo gargalo que mais custa à sua operação.",
  text: "Escolhemos uma prioridade concreta, entendemos o fluxo atual e desenhamos o menor sistema capaz de melhorar o trabalho de verdade.",
  next: [
    "Uma conversa sobre o processo atual",
    "Definição conjunta do primeiro recorte",
    "Um caminho claro para construir e acompanhar",
  ],
  microcopy: "Sem promessa genérica. O primeiro passo é entender o trabalho como ele acontece hoje.",
} as const;

export const footer = {
  line: "Automação, integração, sistemas e inteligência operacional construídos a partir do trabalho real.",
  note: "Procemiza — Inteligência de Negócios",
} as const;
