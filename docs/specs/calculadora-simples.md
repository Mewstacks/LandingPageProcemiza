# Calculadora simples: 3 controles e um número vivo

Substitui a conversa de `calculadora-chat.md` (03/11/2026: "ainda não tá legal, algo realmente simples e bonito que a pessoa faça em 1 min"). A conta, as faixas e as fontes são as mesmas; muda só a entrada.

## Problema

A conversa pedia 8 respostas em fila e só mostrava o número no fim. Calculadora que a pessoa usa em 1 minuto tem poucas entradas, já nasce preenchida e o resultado se mexe enquanto ela mexe.

## Referências (pesquisa de 03/11/2026)

- Todo ROI de automação resume a conta em 3 entradas: tempo por vez, quantas vezes, custo da hora (Tines, aiagentstore).
- Menos campos, mais conclusão: só fonte de fornecedor de calculadora (Outgrow); vale como direção.
- Wise abre com a calculadora, antes do cadastro, com resultado vivo (análise da 925studios, não da Wise).
- xkcd 1205 (grade frequência × tempo) e a frase com lacunas (Vast.com +25 a 40%, relato de segunda mão; Roselli aponta problemas de acessibilidade) foram descartados.
- Nenhum projeto open source útil encontrado (`gh search`, grep.app): o desenho é hipótese.

## Desenho

- **Trabalho** (um dos 6 tipos), **Duração** (slider por degraus, 1 min a 8 h), **Frequência** (slider por degraus, 1 a 100, mais Dia, Semana ou Mês) e **Custo** (opcional: só horas ou R$ 20, 40, 60, 100 por hora).
- Já nasce preenchida (Copiar, 30 min, 5 por semana): o resultado nunca fica vazio.
- Resultado: o piso é o número grande (Odometer), com "até o teto"; disco de área proporcional; reais só quando há custo.
- A conta aberta numa linha: duração × execuções por mês × percentual do tipo, mais as três fontes. Antes do custo de implantar.
- Mobile: o cartão do resultado fica fixo no alto enquanto a pessoa mexe nos controles. Desktop: cartão à esquerda, controles e conta à direita.
- Estado em `sessionStorage` (`procemiza:rotina:v4`), igual na home e em `/calculadora`.

## Critérios de aceite

1. Três toques levam a um resultado diferente do padrão; nenhuma tela de formulário, nenhum campo de texto.
2. Toda combinação possível de degraus (6 tipos × 16 durações × 14 frequências × 3 períodos × 5 custos) dá resultado `ok`, finito, com piso ≤ teto ≤ horas de hoje.
3. Estado guardado quebrado, de outra versão ou fora dos degraus volta ao padrão ou encaixa no degrau mais próximo, sem `NaN`.
4. Só movimento por `prefers-reduced-motion`; todos os controles por teclado (setas nos sliders e nos grupos de rádio) com foco visível e alvo ≥ 44 px.
5. 375 px sem rolagem horizontal; contraste AA medido.
6. O que vai para o GA é só faixa de horas, uma vez por visita, depois que a pessoa parou de mexer.

## Fora de escopo

Conversa, modelos prontos, vários passos por processo, salário e regime (CLT ou Simples), nome da rotina. A conta por passo e o editor ficam no histórico do git (commit 243c3ee).
