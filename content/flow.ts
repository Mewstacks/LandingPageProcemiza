/**
 * Texto dos cartões da cena do hero: quatro rotinas que viram automáticas. São as mesmas rotinas
 * dos atalhos da calculadora, então a cena e a conta logo abaixo falam da mesma coisa. Sem número
 * de resultado: o que muda é o estado, de "Manual" para "Automático".
 */
export const flow = {
  routines: [
    { id: "notas", title: "Conferir notas fiscais", manual: "Comparar cada nota com o pedido.", auto: "Conferência feita sozinha." },
    { id: "pedidos", title: "Responder pedidos no WhatsApp", manual: "Anotar e confirmar um por um.", auto: "Pedido anotado e confirmado sozinho." },
    { id: "sistemas", title: "Digitar dados entre sistemas", manual: "Copiar de uma tela para outra.", auto: "Os dados passam sozinhos." },
    { id: "relatorio", title: "Montar relatório mensal", manual: "Juntar números de várias planilhas.", auto: "Relatório pronto sozinho." },
  ],
  status: { manual: "Manual", auto: "Automático" },
  /** Leitor de tela: a cena é decorativa, a frase diz o que ela mostra. */
  alt: "Quatro rotinas de escritório, como conferir notas fiscais e responder pedidos no WhatsApp, passam de manuais para automáticas.",
} as const;
