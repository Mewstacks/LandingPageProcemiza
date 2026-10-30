# Procemiza — Site institucional

Site da **Procemiza**: automação de rotinas, integração de sistemas e sistemas sob medida.
O hero mostra, em 3D, um pedido de WhatsApp virando linha de planilha, nota fiscal e resposta;
logo abaixo, uma calculadora devolve quantas horas e quantos reais a automação libera na rotina
do visitante.

- Next.js 15 (App Router), React 19, TypeScript, Tailwind v4 (tokens em `@theme static`) e CSS próprio.
- Fraunces nos títulos, Archivo na leitura.
- Site 100% estático (todas as rotas pré-renderizadas).

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run lint
npm test             # Vitest: calculadora, formatação, WhatsApp, SEO, geometria da cena
npm run build && npm run start
```

Node 22 LTS (`.nvmrc`). O build baixa as fontes do Google, então precisa de rede.

Build de produção com o `dev` aberto: `next build` em `.next` derruba o servidor de dev. Use
outra pasta com `NEXT_DIST_DIR` (`next.config.ts`):

```bash
NEXT_DIST_DIR=.next-prod npm run build
NEXT_DIST_DIR=.next-prod npx next start -p 3100
```

No PowerShell: `$env:NEXT_DIST_DIR = '.next-prod'`. Esse build faz o Next acrescentar
`.next-prod/types` ao `tsconfig.json`: descartar a mudança. `.next-prod` está no `.gitignore`.

## Publicação

Produção em `https://www.procemiza.com.br`, ligada à branch `main` de
`Mewstacks/LandingPageProcemiza` pela Vercel (projeto `landing-page-procemiza`). O apex
`procemiza.com.br` redireciona para `www`; o canonical, o sitemap e o robots usam `www`
(`site.domain` em `content/site.ts`). **Push na `main` publica em produção.** Antes de enviar:
`typecheck`, `lint`, `test` e `build`.

## Direção visual

A home é uma sequência de capítulos de cor cheia, de ponta a ponta: **tinta** (hero) → **papel**
(calculadora) → **laranja** (soluções) → **papel** (clientes) → **tinta** (fecho). Cada capítulo
troca os tokens semânticos (`.theme-dark`, `.theme-light`, `.theme-orange` em `app/globals.css`);
o componente só lê `--surface`, `--text` e companhia. Sem gradiente, sem sombra.

Regras que valem para qualquer tela nova:

- Um só gráfico fora da calculadora: a cena do hero. Soluções, clientes e fecho são tipografia.
- Sem ícone, sem seta (`→ ↗ ↓`), sem bolinha decorativa. Botão e link são texto.
- Sem acordeão. As perguntas das páginas internas ficam sempre abertas (`<dl class="qa">`);
  a home não tem FAQ.
- Texto curto: rótulo é substantivo, botão é verbo, nenhuma frase que explique a tela.
- Laranja nunca como texto sobre papel (2,77:1): destaque em texto é o rust (5,1:1).

## Estrutura

| Local | Responsabilidade |
| --- | --- |
| `app/` | Rotas, layout (Header, Footer, JSON-LD de organização), `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx`, `not-found.tsx`. |
| `app/page.tsx` | Home: Hero → Calculadora → Soluções → Clientes → Fecho. |
| `content/site.ts` | Mensagens, navegação, fecho e dados da empresa (`entity`). |
| `content/flow.ts` | Texto dos cartões da cena do hero: quatro rotinas que passam de Manual para Automático (exemplo ilustrativo, sem resultado de cliente). |
| `content/pages.ts` | Registro único das páginas indexáveis (título, descrição, data de modificação). Alimenta metadata, sitemap e breadcrumb. |
| `content/intents.ts`, `content/solutions.ts` | Texto das páginas de solução, da calculadora e das linhas de soluções da home. |
| `content/clients.ts` | Logos: arquivo, tamanho intrínseco e altura de exibição. Só o logo, sem legenda; origem de cada arquivo em `public/media/procemiza/clients/provenance.json`. |
| `lib/calculator.ts`, `lib/routine.ts` | Conta pura, sem React: `calculator` faz a conta por passo; `routine` leva o texto digitado até ela, guarda os atalhos e valida o que vem do `sessionStorage`. Testadas em `lib/*.test.ts`. |
| `lib/seo.ts` | `buildMetadata`, nós de JSON-LD e serialização segura. |
| `lib/consent.ts`, `lib/analytics.ts` | Consentimento (LGPD) e eventos do GA4. |
| `lib/motion.ts` | `useReducedMotion` (lê `prefers-reduced-motion`). |
| `components/hero/` | Cena 3D: `FlowScene` (componente), `flow.geometry.ts` (geometria pura e testada), `flow.css`. |
| `components/calculator/` | `RoutineProvider` (estado), `Calculator` (monta a tela), `Steps` e `Adjust` (entrada), `Result` com `Odometer`, `Orb` e `Timeline` (saída) e `Account` (a conta aberta, em barras). |
| `components/page/`, `components/IntentPage.tsx` | Páginas internas: título em cartaz, quando faz sentido, exemplo, perguntas e faixa de convite. |

Páginas: `/`, `/calculadora`, `/automacao-de-processos`, `/integracao-de-sistemas`,
`/sistemas-sob-medida`, `/privacidade`. Nova página: entrada em `content/pages.ts` + rota;
sitemap e metadata saem do registro.

## Calculadora

Uma só (`CalculatorSection`), na home e em `/calculadora` (lá o título da página já é o H1, então a
seção não repete outro). Serve para qualquer processo: a pessoa lista os passos, cada um com
minutos por execução e um tipo (copiar ou digitar, conferir com regra, avisar ou enviar, procurar
ou juntar, analisar ou decidir, falar com gente) e diz quantas vezes roda por dia, semana ou mês.

- Cada tipo tem um percentual automatizável de partida (95% a 10%, `STEP_KINDS`). São premissas, não
  medições, e todas são editáveis em "Ajustes". Nenhum estudo é citado: os percentuais de consultorias
  não foram verificados.
- Volta por passo = minutos × automatizável × (1 − exceções). Exceções: 10% por padrão (editável).
  Retrabalho é opcional e devolve a mesma fração automatizada. Horas por mês = soma × execuções por
  mês (21 dias úteis ou 52/12 semanas). Custo da hora = salário × (1 + encargos) ÷ 220 (70% CLT,
  50% Simples) ou valor da hora digitado. Sem custo informado, só horas.
- Validação nunca ajusta valor em silêncio: o campo errado (e o passo) mostra a mensagem.
- Descrever é tocar: sete modelos de processo (faixa que rola de lado no celular); "Novo passo" tem um
  botão por tipo de trabalho (Copiar, Conferir, Avisar, Procurar, Analisar, Conversar) que já põe o
  passo com o tempo de partida do tipo (`STEP_KINDS[].minutes`) e leva o foco ao número; período e
  unidade do custo são botões (radios nativos), não listas.
- Saída: o número cresce até 10 rem e encolhe com a quantidade de dígitos (`cqw` sobre o bloco do
  número, `--chars`), rola (`Odometer`, dígitos em `content` do CSS para não entrar no HTML), ao lado
  do disco laranja de área proporcional à parte que volta (`Orb`). Faixa Hoje × Depois com um bloco
  por passo e o nome dentro dos maiores (`Timeline`; passar o mouse ou focar um passo acende o bloco
  e a linha da conta).
- "A conta": uma barra por passo (cinza = tempo do passo, laranja = parte que volta) com a
  multiplicação e o resultado ao lado, a soma, a fórmula e as contas do mês e do dinheiro em colunas.
  No celular um número fixo acompanha a rolagem enquanto o cartão está fora da tela.
- O formulário é uma linha por passo (container query: duas linhas quando a coluna é estreita).

Os números vêm do visitante. Nada é enviado a servidor; o estado fica em `sessionStorage`
(`procemiza:rotina:v2`, validado ao ler). O link do WhatsApp (`?text=`) leva o processo, o número de
passos e o que volta. Sem número digitado (exemplo na tela) a mensagem é genérica.

## Cena do hero e movimento

- Quatro rotinas de escritório em cartões de papel em CSS 3D (`perspective`, `rotateX`/`rotateY`,
  `translateZ`): conferir notas fiscais, responder pedidos no WhatsApp, digitar dados entre sistemas
  e montar o relatório mensal (as mesmas dos atalhos da calculadora). Todas começam "Manual"; uma
  ficha passa por cada uma e a vira "Automático" (barra e etiqueta laranja). A frase antiga sai e a
  nova entra, nunca as duas ao mesmo tempo. Só texto, nenhum ícone. Sem canvas, sem biblioteca.
- **Nitidez:** todo comprimento é "px de projeto × `--k`", com `--k` medido em JS. O mundo nunca é
  escalado por `transform: scale()`, então cada documento rasteriza no tamanho final. Texto nunca
  abaixo de 13px.
- Por quadro, só `transform` e `opacity`. O layout (tamanho dos documentos, `--k`, perspectiva) só
  é escrito quando a caixa muda de tamanho. Larguras de cena abaixo de 600 px usam a pilha
  vertical estreita (`NARROW_BELOW` em `flow.geometry.ts`).
- Laço de 11 s, entrada de ~1,3 s, balanço leve da câmera. Pausa fora da tela e com a aba oculta.
- `prefers-reduced-motion: reduce` mantém a entrada e o laço da ficha; remove balanço, flutuação e
  a subida do texto do hero. Não há chave de movimento na interface, por decisão do dono do
  projeto. No Windows, "Efeitos de animação" desligado conta como `reduce`.
- A cena é decorativa: `aria-hidden` e `inert`, com uma frase para leitor de tela (`flow.alt`).
  Sem JavaScript, a composição estática do CSS aparece completa.
- Limite conhecido: o laço do hero não tem botão de pausa (WCAG 2.2.2 pede um para movimento
  acima de 5 s).

## Ritmo, espaço e texto

- Seções a 48 px (celular) e 80 px (desktop) de padding (`--section-y`). Para comparar: Supabase usa
  64 a 96 px (`SectionContainer`, Apache-2.0), mas com visual de produto enchendo a seção; aqui a
  seção é texto, então menos. A faixa de clientes e os convites compactos ficam um passo abaixo.
- Nada de texto que explique a tela. Cada seção diz uma coisa; o que já aparece em outro lugar não
  se repete (o rodapé não repete o que o hero diz; a página da calculadora não repete o título e não
  tem perguntas nem "como calculamos", porque a conta aberta já mostra a conta; o que a calculadora
  faz com os dados está em `/privacidade`).
- Páginas de solução: título em cartaz (tinta), "quando faz sentido" em colunas (papel), exemplo e
  outros caminhos (laranja), perguntas em colunas (papel) e uma faixa só com o convite. O cartaz de
  fecho (`PilotCTA`) aparece uma vez, na home.
- Entrada das seções: `[data-reveal]` sobe 1,25 rem e aparece conforme a rolagem, com
  `animation-timeline: view()` (só `transform` e `opacity`). Sem suporte, ou com
  `prefers-reduced-motion: reduce`, o conteúdo já está no lugar; nada fica escondido esperando script.

## Conteúdo e números

Não há métrica, depoimento ou resultado de cliente inventado; nomes e valores da cena do hero são
de exemplo. Casos só entram com dado autorizado. Textos das páginas de solução e as perguntas
delas são rascunhos feitos a partir do que o site já dizia; confirmar antes de ampliar qualquer
promessa.

`entity` em `content/site.ts` (cidade/UF, e-mail, CNPJ, redes) é opcional: campo vazio não é
renderizado nem vai para o JSON-LD.

## SEO e busca por IA

- Canonical único em `www`; `title`/`description`/OG por página (`buildMetadata`).
- JSON-LD: Organization + ProfessionalService, WebSite, WebPage, BreadcrumbList, Service e
  WebApplication (calculadora).
- `robots.txt` libera busca, consulta de usuário e treino das IAs (lista em `app/robots.ts`).
- Todo o conteúdo está no HTML do servidor (robôs de IA em geral não executam JavaScript).
- `public/llms.txt` é opcional e inofensivo (o Google o ignora).
- Depois do deploy: Search Console (propriedade de domínio, enviar sitemap, conferir o controle de
  IA generativa), Bing Webmaster Tools, Rich Results Test e PageSpeed.

## Medição (GA4) e LGPD

`NEXT_PUBLIC_GA_ID` (ver `.env.example`) liga o GA4 **só depois do "Aceitar"**. Sem ID não há
banner nem script. "Cookies" no rodapé reabre a escolha; recusar apaga os cookies do GA.
Eventos: `calculator_used` (faixa de horas, nunca o texto da rotina) e `whatsapp_click`.
`/privacidade` é um rascunho técnico: revisar com assessoria jurídica.

`lib/resend.ts` é um scaffold de e-mail sem uso hoje.

## Acessibilidade e desempenho

Contraste AA medido (tokens semânticos em `app/globals.css`; ink sobre laranja 6,35:1). Alvos
≥ 44 px no celular, foco visível (anel ≥ 6:1 em todo capítulo), `prefers-reduced-motion`
respeitado, 375 px sem rolagem horizontal.

Medido em build de produção local (29/10/2026): Lighthouse Acessibilidade, Boas práticas e SEO
100 (desktop e celular); LCP 88 ms e CLS 0 no desktop; axe sem violações na home e nas páginas
internas; a cena roda a ~57 fps com CPU 4× mais lenta e tela 2× (celular emulado), sem tarefa
longa. Meta de campo: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; dado de campo só existe depois do
deploy.
