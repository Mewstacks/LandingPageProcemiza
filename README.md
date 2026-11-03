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
- Sem FAQ em nenhuma página, nem acordeão: a decisão se apoia em "Quando faz sentido" e no exemplo.
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
| `lib/calculator.ts`, `lib/estimate.ts` | Sem React: `calculator` faz a conta em faixa; `estimate` guarda os degraus dos controles, valida o estado do `sessionStorage` e monta a frase falada. Testadas em `lib/*.test.ts`. |
| `lib/seo.ts` | `buildMetadata`, nós de JSON-LD e serialização segura. |
| `lib/consent.ts`, `lib/analytics.ts` | Consentimento (LGPD) e eventos do GA4. |
| `lib/motion.ts` | `useReducedMotion` (lê `prefers-reduced-motion`). |
| `components/hero/` | Cena 3D: `FlowScene` (componente), `flow.geometry.ts` (geometria pura e testada), `flow.css`. |
| `components/calculator/` | `Calculator` (controles, número e conta), `Live` (número com `Odometer`), `Slider`, `Choice`, `useEstimate` (estado e storage). |
| `components/page/`, `components/IntentPage.tsx` | Páginas internas: título em cartaz, quando faz sentido, exemplo, perguntas e faixa de convite. |

Páginas: `/`, `/calculadora`, `/automacao-de-processos`, `/integracao-de-sistemas`,
`/sistemas-sob-medida`, `/privacidade`. Nova página: entrada em `content/pages.ts` + rota;
sitemap e metadata saem do registro.

## Calculadora

Uma só (`CalculatorSection`), na home e em `/calculadora` (lá o título da página já é o H1, então a
seção não repete outro). Três controles e um número vivo, sem IA e sem servidor: **Trabalho** (copiar,
conferir, avisar, procurar, analisar ou conversar), **Duração** (slider por degraus, 1 min a 8 h) e
**Frequência** (slider de 1 a 100 mais Dia, Semana ou Mês), e **Custo** opcional (só horas ou R$ 20, 40,
60, 100 por hora). Nasce preenchida (copiar, 30 min, 5 por semana) e o painel de tinta mexe junto.
Spec, pesquisa e critérios em `docs/specs/calculadora-simples.md`; método e fontes da conta em
`docs/specs/calculadora-chat.md` (seção 2).

- A conta devolve sempre uma faixa. Cada tipo tem piso e teto (`STEP_KINDS`): piso = potencial técnico
  médio da categoria (McKinsey Global Institute, jan/2017, Exhibit 8: processar dados 69%, coletar
  dados 64%); teto = o que um processo estruturado entregou sem humano depois de melhoria contínua
  (Xchanging, LSE 2015: 93%). Analisar e conversar: piso 0, teto 18% e 20% (MGI). As fontes aparecem
  no painel. Nenhuma premissa é editável na tela.
- Horas por mês = minutos × percentual × execuções por mês (21 dias úteis ou 52/12 semanas). Reais =
  horas × custo da hora escolhido. Fora da conta e dito na tela: custo de implantar e manter a
  automação, custo de interrupção e ganhos de qualidade.
- Toda entrada é um degrau (`MINUTE_STOPS`, `RUN_STOPS`, `HOURLY_STOPS` em `lib/estimate.ts`): não há
  texto para ler nem valor impossível, e toda combinação dá resultado (testado nas 20.160 combinações).
- Saída: o piso é o número grande (até 9 rem, encolhe com os dígitos, `Odometer`) e a conta aberta em
  barra (cinza = hoje, laranja suave = até o teto, laranja cheio = piso) com a multiplicação e as
  fontes. Só analisar e conversar: "Isso pede gente".
- Desktop: tinta e papel viram um objeto só (número e conta à esquerda, controles à direita). Celular:
  o cartão do número fica fixo sob o cabeçalho enquanto se mexe nos controles.
- Acessibilidade: sliders e rádios nativos (setas, Tab, foco visível); o resultado vai para uma região
  `aria-live` educada, que só muda depois de 700 ms sem mexer.

Arquivos: `lib/calculator.ts` (a conta), `lib/estimate.ts` (degraus, estado guardado e frase falada) e
`components/calculator/` (`Calculator`, `Live`, `Slider`, `Choice`, `Odometer`, `useEstimate`).

Os números vêm do visitante. Nada é enviado a servidor; só as escolhas ficam em `sessionStorage`
(`procemiza:rotina:v4`, validado ao ler; home e `/calculadora` compartilham). O link do WhatsApp
(`?text=`) leva o tipo, a duração, a frequência e as faixas.

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
  tem perguntas nem "como calculamos", porque a conta aberta e as fontes já estão no cartão; o que a calculadora
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
