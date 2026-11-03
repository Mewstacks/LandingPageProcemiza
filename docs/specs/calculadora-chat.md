# Calculadora em conversa: método e roteiro

> A interface em conversa (seções 3 a 6) foi substituída em 03/11/2026 por `calculadora-simples.md`. A
> seção 2 (a conta, as faixas e as fontes) continua valendo, menos o regime CLT/Simples, que saiu da tela.

Aprovado em 03/11/2026 e implementado (sem commit nem deploy até a ordem). Desvios do rascunho, todos
decididos na implementação: a pergunta de frequência é sempre "Com que frequência?" (os chips mudam
conforme o que já foi respondido); com a conversa completa os balões viram uma lista curta de respostas
tocáveis (`summary` em `lib/chat.ts`); passos do mesmo tipo de um modelo somam num tipo só; o teto de
cada tipo já é líquido de exceções, então a taxa de exceções e o retrabalho saíram da conta.

## 1. Problema e critérios de aceite

O formulário da calculadora é longo e pesado no celular. O pedido: uma conversa guiada, mais visual, em que a pessoa descreve a tarefa, responde poucas perguntas e recebe um cálculo com credibilidade.

Critérios (testáveis):

1. Sem IA e sem servidor: conversa roteirizada, toda a lógica no navegador, custo zero.
2. Cada resposta é um toque ou uma frase curta. Nenhum campo de formulário aberto ao mesmo tempo.
3. Toda premissa da conta tem fonte verificável, e a tela mostra o intervalo, não um número único.
4. Nenhuma entrada, por mais estranha que seja, quebra a conversa, produz `NaN`/`Infinity` ou muda o resultado em silêncio.
5. 375 px sem rolagem horizontal; o campo de texto nunca fica escondido pelo teclado.
6. A conta continua pura e testada (`lib/calculator.ts`); a conversa só preenche os campos que `deriveView` já entende.

## 2. A conta com base em evidências

### 2.1 O que a conta responde

Horas por mês que **deixam de ser trabalho manual** naquele processo, em uma faixa (piso a teto). Não é economia líquida: não desconta custo de implantar nem de manter a automação, e horas liberadas só viram dinheiro se forem reaproveitadas. A tela diz isso em uma linha.

### 2.2 Fórmula

Para cada passo `i`, com `m_i` minutos por execução e tipo `k_i`:

```
horasMês        = execuções/mês × Σ m_i / 60
devolvidas_piso = execuções/mês × Σ (m_i × piso(k_i)) / 60
devolvidas_teto = execuções/mês × Σ (m_i × teto(k_i)) / 60
reais/mês       = devolvidas × custo-hora   (só se a pessoa informar custo)
```

Execuções por mês: por dia útil × 21, por semana × 52/12, por mês × 1. Custo-hora: salário × (1 + encargos) ÷ 220, ou o valor da hora digitado.

### 2.3 Percentual automatizável por tipo de passo

| Tipo | Piso | Teto | Âncora do piso | Âncora do teto |
|---|---|---|---|---|
| Copiar ou digitar | 69% | 93% | MGI: processar dados 69% | Xchanging: 93% sem humano |
| Conferir com regra | 69% | 93% | MGI: processar dados 69% | Xchanging: 93% sem humano |
| Avisar ou enviar | 69% | 93% | MGI: processar dados 69% (classificação nossa) | Xchanging: o robô avisa o corretor ao fim |
| Procurar ou juntar | 64% | 93% | MGI: coletar dados 64% | Xchanging: o robô busca dados online |
| Analisar ou decidir | 0% | 18% | sem evidência de ganho realizado | MGI: aplicar expertise 18% |
| Falar com gente | 0% | 20% | sem evidência de ganho realizado | MGI: interagir com stakeholders 20% |

Mudança em relação ao que está no ar: hoje os percentuais são 95/90/95/75/20/10 com 10% de exceções por cima, sem fonte. O piso novo é mais baixo; o teto de dados é parecido (93% já é líquido de exceções, então a taxa de exceções separada sai da conta).

### 2.4 Fontes e o que cada uma sustenta

Lidas nos documentos originais (texto extraído do PDF), não de resumo.

| Fonte | O que diz | Limite |
|---|---|---|
| McKinsey Global Institute, *A future that works*, jan/2017, Exhibit 8 (p. 42) e texto (p. 43 a 46). [PDF](https://cica.org.au/wp-content/uploads/MGI-A-future-that-works_Full-report.pdf) | Parte do tempo de trabalho que tecnologia já demonstrada consegue automatizar, por categoria: gerir pessoas 9%, aplicar expertise 18%, interagir com stakeholders 20%, físico imprevisível 26%, coletar dados 64%, processar dados 69%, físico previsível 81%. Base: mais de 2.000 atividades em mais de 800 ocupações dos EUA e 18 capacidades. | Potencial técnico, não adoção. O próprio relatório lista custo, mercado de trabalho, benefícios além do trabalho e aceitação regulatória como freios. Média da economia: um passo estruturado e digital tende a ficar acima, então serve de piso conservador. |
| Lacity e Willcocks, *Robotic Process Automation at Xchanging*, LSE OUWP 15/03, jun/2015 | Sucesso de primeira em 93% contra meta de 80% (mai/2015); cerca de 7% dos casos automatizados ficam com humanos; economia de custo de 11% a 30% por processo; humanos ficam com as partes não estruturadas. | Um caso. A pesquisa teve a Blue Prism (fornecedora do software) como patrocinadora de lançamento, dito no próprio texto. O 93% veio depois de melhoria contínua. |
| Lacity e Willcocks, *A new approach to automating services*, MIT Sloan Management Review, outono/2016 (revisado por pares) | Xchanging: 14 processos, 27 robôs, economia média de 30% por processo. Concessionária europeia: de 30 para cerca de 12 pessoas na conferência de leituras de medidores (60% das pessoas liberadas), cerca de 25% do back office automatizado. Telefónica O2: quase 35% do back office em cinco anos. | Casos escolhidos entre adotantes iniciais. Economia de custo e pessoas liberadas não são a mesma medida que horas devolvidas. |

Não conseguimos ler o paper original da Telefónica O2 (link devolve 404); só usamos o número que o artigo da MIT SMR repete.

Dado que não entra como premissa porque a fonte é fraca: taxas de passagem direta de contas a pagar (Ardent Partners, 32,6% de média) vêm de blogs de fornecedores. Taxa de erro de digitação (1% a 5% por campo) também só em fontes secundárias; por isso o retrabalho continua opcional e sem valor padrão.

### 2.5 Custo da hora (encargos)

Trocamos a "regra de bolso" 70% e 50% por uma composição aberta. Base legal: FGTS 8% (Lei 8.036/1990, art. 15), INSS patronal 20% e RAT de 1% a 3% (Lei 8.212/1991, art. 22), terceiros/Sistema S em torno de 5,8% (varia por enquadramento), 13º 8,33% e férias com terço 11,11% como provisão; optantes do Simples ficam dispensados das contribuições a terceiros e, nos anexos I, II, III e V, têm a patronal dentro do DAS (LC 123/2006, art. 13).

Conta nossa (os encargos incidem sobre salário + 13º + férias):

| Regime | Composição | Total | Valor usado |
|---|---|---|---|
| CLT, lucro presumido ou real | 61,0% a 63,4% (RAT 1% a 3%) mais provisão de rescisão (fontes secundárias, em torno de 3% a 4%) | em torno de 66% | **66%** |
| Simples (anexos I, II, III, V) | 29,0% mais a mesma provisão | em torno de 33% | **33%** |

Confiança média: o texto da lei está confirmado por busca em fontes oficiais e secundárias, mas não conferimos a redação consolidada vigente no Planalto, e RAT, FAP e terceiros variam por empresa. A tela mostra o regime escolhido e deixa a pessoa digitar o valor da hora direto. Os dois valores novos são menores que os de hoje, então o reais/mês fica menor (direção conservadora). Anexo IV paga a patronal fora do DAS e fica mais perto do CLT: a pergunta do regime só oferece "CLT" e "Simples" e o rótulo diz "Simples (anexos I, II, III, V)".

Divisor 220 h/mês: jornada legal de 44 h semanais. Mantido porque o custo é por hora paga. A média habitual do Brasil é 39,1 h por semana (IBGE, PNAD Contínua, 3º tri/2025, trabalho principal); como a hora paga é a que o salário cobre, o divisor não muda.

### 2.6 O que a conta não corrige (e por quê)

| Fator | Decisão | Evidência |
|---|---|---|
| Tempo por execução informado de memória | Sem correção escondida. | Planning fallacy (Buehler, Griffin e Ross, 1994) trata de prever o tempo de projetos futuros próprios, não de lembrar tarefas recorrentes. Horas de trabalho autodeclaradas passam 5% a 10% do diário de tempo (Robinson e outros, 2011) e isso é contestado (BLS, 2014). Sem direção confiável, não ajustamos. |
| Custo de interrupção | Fora da conta (conservador). | Gloria Mark: média de 23 min 15 s para retomar o trabalho interrompido, só entre as retomadas (81,9%). Não dá para atribuir a esta tarefa. |
| Custo de implantar e manter | Fora da conta, dito na tela. | MGI cita custo como freio. |
| Benefícios além do tempo (menos erro, rapidez) | Fora da conta. | MGI: podem superar a economia de trabalho, mas não são medidos aqui. |

Sensibilidade: o resultado é linear no tempo informado. A tela mostra uma linha "Com 25% menos tempo: X h" para a pessoa ver o quanto a resposta depende do que ela chutou.

### 2.7 Números de referência (fixtures de teste)

Calculados à mão e conferidos com script; os testes devem repetir.

| Caso | Entrada | Piso | Teto |
|---|---|---|---|
| Notas fiscais | 40 por semana; buscar 2, conferir 4, dados 3, avisar 1 (10 min) | 19,64 h/mês (68%) | 26,87 h/mês (93%) |
| Notas fiscais com R$ 3.500, CLT (R$ 26,41/h) | idem | R$ 518,79/mês | R$ 709,52/mês |
| Notas fiscais com R$ 3.500, Simples (R$ 21,16/h) | idem | R$ 415,66/mês | R$ 568,47/mês |
| WhatsApp | 30 por dia; decidir 1, buscar 2, dados 3, avisar 2 | 49,66 h/mês | 70,25 h/mês |
| Relatório | 1 por mês; buscar 180, dados 240, conferir 120, decidir 180, avisar 20 | 6,29 h/mês | 9,22 h/mês |

Horas antes: 28,89 (notas), 84,00 (WhatsApp), 12,33 (relatório).

## 3. Roteiro da conversa

### 3.1 Regras gerais

- O bot fala pouco: uma pergunta curta por balão, sem apresentação e sem explicar a tela.
- Cada pergunta traz respostas em chips (um toque) e aceita texto livre quando fizer sentido. Chip é resposta, não botão de ação, então não precisa ser verbo.
- Sem pontos de "digitando" e sem atraso artificial. Pesquisa recente mostra que atraso falso aumenta a confiança percebida sem melhorar a resposta, e a literatura critica isso como enganoso; o bot responde na hora, com uma entrada curta (150 ms, só opacidade e 8 px de deslocamento, desligada com `prefers-reduced-motion`).
- Resposta da pessoa vira balão à direita e fica tocável: tocar volta àquela pergunta, mantendo as respostas seguintes que ainda valem. (Desenho nosso; não verificamos se o conversational-form da SPACE10, MIT, faz igual.)
- A caixa de texto fica no fluxo da página, logo abaixo do último balão, nunca fixa no rodapé. Safari no iOS ainda não suporta `interactive-widget=resizes-content` (caniuse, até Safari 26.4), então não dependemos do tamanho da janela com o teclado aberto.
- Entrada de texto: `font-size` 16 px (evita zoom no iOS), `inputmode` certo por pergunta, `enterkeyhint="send"`, foco volta ao campo depois de cada resposta.

### 3.2 Estados

Estado = respostas (`name`, `kinds[]`, `minutes{kind}`, `runs`, `period`, `cost`, `costMode`, `regime`, `model?`). O resultado é derivado, nunca guardado. Ordem fixa: **N0 → N1 → N2 → N3(por tipo) → N4 → N5**. Voltar a um nó mantém o resto; um nó só é perguntado de novo se a resposta que o alimentava mudou ou deixou de ser válida.

| Nó | Pergunta | Respostas | Texto livre | Regra |
|---|---|---|---|---|
| N0 Tarefa | "O que se repete?" | 7 modelos (Notas fiscais, WhatsApp, Entre sistemas, Relatório, Cadastros, Conciliação, Orçamentos) | nome, 1 a 80 caracteres | Modelo preenche nome, tipos e minutos e pula N2 e N3; o resultado leva a etiqueta "Tempos do modelo" até a pessoa mexer em algum. |
| N1 Frequência | "Quantas vezes?" | "Todo dia", "Toda semana", "Todo mês", depois número em chips (1, 5, 10, 20, 50) | "40 por semana", "3x ao dia" | Período vem junto do número; se só o período vier, pergunta o número; se só o número vier, pergunta o período. |
| N2 Tipos | "O que você faz nela?" | Copiar, Conferir, Avisar, Procurar, Analisar, Conversar (várias), mais "Pronto" | nenhum | Mínimo 1. "Pronto" desligado enquanto vazio. Um passo por tipo. |
| N3 Minutos (um por tipo marcado, na ordem da lista de tipos) | "Quanto leva copiar?" | 1, 2, 5, 10, 30 min, 1 h, 3 h | "1h30", "meia hora" | 0 < minutos ≤ 600. |
| N4 Custo | "E a hora de quem faz?" | "R$ 20/h", "R$ 40/h", "R$ 60/h", "Salário", "Pular" | valor | "Salário" abre N4b (valor do salário) e N4c (CLT ou Simples). "Pular" mostra só horas. |
| N5 Resultado | (cartão) | "Corrigir", "Falar no WhatsApp", "Recomeçar" | — | Cartão: faixa de horas, faixa de reais, antes e depois, A conta por passo, fontes. |

### 3.3 Leitura de texto livre (puro, com teste por tabela)

Normalização: minúsculas, remover acentos para comparar, trocar vírgula por ponto só depois de validar o formato pt-BR (`parseDecimalPtBR`), colapsar espaços, cortar em 40 caracteres para a leitura.

**Duração** (resultado em minutos):

| Entrada | Saída |
|---|---|
| `15`, `15 min`, `15min`, `15 minutos` | 15 |
| `1h`, `1 h`, `1 hora`, `uma hora` | 60 |
| `1h30`, `1:30`, `1 h 30 min`, `1h 30` | 90 |
| `1,5 h`, `1,5h`, `1.5h` | 90 |
| `meia hora`, `30 min` | 30 |
| `duas horas`, `2 horas`, `2h` | 120 |
| `90 minutos` | 90 |
| número sozinho acima de 600 | recusa com pergunta se foram segundos |
| `0`, `-5`, `abc`, vazio, `1h99` | recusa |
| `10 horas`, `601` | recusa (teto 600 min) |

**Frequência** (resultado: número e período):

| Entrada | Saída |
|---|---|
| `40 por semana`, `40 na semana`, `40/semana` | 40, semana |
| `3x ao dia`, `3 vezes por dia`, `3 por dia` | 3, dia |
| `todo dia`, `diariamente`, `diario` | 1, dia |
| `toda semana`, `semanalmente`, `toda segunda` | 1, semana |
| `todo mes`, `mensal`, `mensalmente` | 1, mês |
| `2x por mes` | 2, mês |
| `de vez em quando`, `varia` | recusa e mostra os chips |
| execuções por mês acima de 100.000, 0, negativo | recusa |

**Valores em reais:** `3500`, `3.500`, `R$ 3.500`, `3,5 mil`, `3.500,50`; `R$ 0` recusa; hora acima de R$ 10.000 recusa; salário acima de R$ 200.000 recusa.

**Nome:** `trim`, colapsa espaços, remove caracteres de controle, 1 a 80 caracteres; renderizado só como texto (nunca HTML).

### 3.4 Erros (o que aconteceu, por que, o que fazer)

Uma linha, no balão do bot, sem culpar a pessoa e sempre com saída:

| Caso | Texto do bot |
|---|---|
| Duração ilegível | "Não entendi o tempo. Toque ou escreva, como 15 min." |
| Duração fora da faixa | "Passos vão até 10 h. Quanto leva cada vez?" |
| Frequência ilegível | "Não entendi a frequência." e chips Dia, Semana, Mês |
| Frequência alta demais | "Isso passa de 100 mil por mês. Quantas por dia?" |
| Valor ilegível | "Não entendi o valor. Escreva, como 3500." |
| Nome vazio | "Escreva o nome, ou toque num modelo." |

O erro não avança o estado, não apaga nada e mantém o foco no campo.

### 3.5 Resultado

Cartão único, reaproveitando `Result`, `Timeline` e `Account`:

- Número grande: o **piso**, com "até o teto" ao lado (por exemplo "19,6 h por mês, até 26,9 h"). Se houver custo, a mesma faixa em reais.
- Barra Hoje e Depois com a faixa; A conta por passo com a faixa de cada tipo e a fonte (rótulo curto, "MGI 2017" ou "Xchanging 2015").
- Linha de sensibilidade (tempo 25% menor).
- Linha: "Antes do custo de implantar."
- Rodapé: três fontes com link.
- Se o piso for 0 (só passos de analisar ou conversar): mensagem própria, "Esses passos pedem gente. O ganho aqui é pequeno.", sem faixa e sem apelo de venda.
- CTA do WhatsApp com a mensagem já montada (nome, faixa, execuções); texto dos balões nunca vai na URL além do nome da tarefa truncado em 60 caracteres.

### 3.6 Persistência e retomada

`sessionStorage` `procemiza:rotina:v3` guarda só as respostas (não o transcrito). Ao reabrir, a conversa é remontada de uma vez, sem animação, no ponto em que parou. Se o JSON estiver quebrado ou for da versão 2, descarta e recomeça. `sanitize` valida tipo, tamanho e valor de cada campo.

## 4. Casos de borda (matriz de teste)

1. Nome com emoji, 80 caracteres, 81 caracteres, só espaços, `<script>`, quebra de linha.
2. Duração: todas as linhas da tabela, mais `1e3`, `Infinity`, `NaN`, `0,0001`, `９０` (algarismos largos), colar texto com espaço de largura zero.
3. Frequência: todas as linhas, mais `40 por semana por dia`, `quarenta`, `0,5 por dia` (meia execução por dia, válida).
4. Sequência: voltar ao N0 e trocar o modelo; voltar ao N2 e tirar um tipo (o minuto do tipo removido some); voltar ao N2 e acrescentar um tipo (só ele é perguntado).
5. Dois toques rápidos no mesmo chip; Enter em campo vazio; colar valor com R$.
6. Todos os 6 tipos, 600 min cada, 100.000 execuções por mês (limites de `K`): sem `NaN`, sem notação científica na tela.
7. Só "Analisar": piso 0, mensagem própria.
8. Custo: pular, hora 0, hora 10.001, salário 1, salário 200.001, regime trocado depois do resultado.
9. Recarregar a página no meio: retoma; storage bloqueado: segue sem persistir; JSON adulterado: recomeça.
10. Propriedades (gerador pseudoaleatório fixo, 1.000 sequências): toda sequência de entradas termina sem exceção; piso ≤ teto ≤ horas antes; horas e reais finitos; reais = horas × custo-hora; resultado idêntico ao recalcular do zero.
11. Teclado e leitor de tela: Tab chega aos chips e ao campo, Esc não perde resposta, a região de mensagens anuncia cada balão uma vez (sem `aria-live` duplicado quando o foco muda), chips têm `aria-pressed` quando são multisseleção.
12. 375 px, 768 px e 1280 px, tema claro e escuro, `prefers-reduced-motion`, zoom 200%.

## 5. Acessibilidade e celular (decisões com fonte)

- Log das mensagens: `role="log"` com nome acessível (técnica ARIA23 do W3C). Quem já tem região viva própria evita `role="log"` para não duplicar (Cognigy); aqui só há um mecanismo.
- Chips são `<button>`, estão na ordem de Tab (Telerik, Orange).
- Ao responder, o foco fica no campo, não vai para a mensagem nova (evita leitura dupla).
- Alvo de toque dos chips de 44 px; fileiras de chips quebram linha em vez de rolar de lado.
- Contraste AA calculado em cada par de balão, chip e estado antes de entregar.

## 6. O que muda no código

| Arquivo | Mudança |
|---|---|
| `lib/calculator.ts` | Cada tipo ganha `floor` e `ceiling`; resultado devolve piso e teto; `exceptions` sai do padrão; `ENCARGOS` 0,66 e 0,33. |
| `lib/chat.ts` (novo) | Máquina de estados pura: respostas, próximo nó, rebobinar, validação. |
| `lib/parse.ts` (novo) | `parseDuration`, `parseFrequency`, `parseMoney`, `cleanName`. |
| `lib/routine.ts` | Adaptar `deriveView` à faixa; `sanitize` v3. |
| `components/calculator/` | `Chat`, `Bubble`, `Chips`, `Composer`; reaproveita `Result`, `Timeline`, `Account`, `Odometer`, `Orb`. O editor completo sai da tela (decisão em aberto abaixo). |
| Testes | `parse.test.ts`, `chat.test.ts`, propriedades, fixtures da seção 2.7. |

## 7. Decisões em aberto (uma por vez)

1. Decidido: o número grande é o piso, com "até o teto" ao lado.
2. Decidido: a conversa é o único caminho. O editor de passos e os percentuais editáveis saem; corrigir é tocar no balão. Premissas fixas e citadas.
3. Decidido: a conversa aparece na home e em `/calculadora`, com o mesmo estado (`sessionStorage`).
4. Decidido: fontes no rodapé do cartão (três links) e um rótulo curto por passo na conta. Sem página de método por ora.

## 8. Fora de escopo

IA generativa; envio da conversa ao servidor; preço, payback e custo de implantação; benchmarks por setor; cadastro ou e-mail para ver o resultado.
