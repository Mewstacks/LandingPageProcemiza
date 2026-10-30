/**
 * Texto dos documentos da cena do hero: um pedido de WhatsApp vira linha de planilha, nota
 * fiscal e resposta, sem ninguém digitar. É ilustração: nomes e valores são de exemplo e não
 * dizem nada sobre resultado de cliente. Palavras de uso comum, sem sigla.
 */
export const flow = {
  chat: {
    app: "WhatsApp",
    contact: "Mercado do Vale",
    incoming: { text: "Oi! Preciso de 12 caixas de azeite pra sexta.", time: "09:41" },
    outgoing: { text: "Pedido 1042 confirmado. Nota fiscal emitida. Entrega na sexta.", time: "09:42" },
  },
  sheet: {
    title: "Planilha de pedidos",
    head: ["Pedido", "Cliente", "Qtd", "Status"],
    rows: [["1041", "Loja Rosa", "5", "Entregue"]],
    fresh: ["1042", "Mercado do Vale", "12", "Novo"],
  },
  invoice: {
    kind: "Nota fiscal",
    number: "Nº 512",
    to: "Mercado do Vale",
    item: "12 cx Azeite extra virgem",
    totalLabel: "Valor total",
    total: "R$ 1.440,00",
    statusLabel: "Situação",
    stamp: "Emitida",
  },
  /** Leitor de tela: a cena é decorativa, a frase diz o que ela mostra. */
  alt: "Um pedido chega pelo WhatsApp, entra na planilha, a nota fiscal é emitida e o cliente recebe a confirmação, sem ninguém digitar.",
} as const;
