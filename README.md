# Procemiza — Site institucional

Site da **Procemiza**: automação de rotinas, integração de sistemas e sistemas sob medida.
A home pede a rotina do visitante e o tempo que ela toma, e mostra quanto a automação devolve.

- Next.js 15 (App Router), React 19, TypeScript, Tailwind v4 (tokens em `@theme`) e CSS próprio.
- Fraunces nos títulos, Archivo na leitura, IBM Plex Mono em rótulos.
- Site 100% estático (todas as rotas pré-renderizadas).

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run lint
npm test             # Vitest: calculadora, formatação, WhatsApp, SEO
npm run build && npm run start
```

Node 22 LTS (`.nvmrc`). O build baixa as fontes do Google, então precisa de rede.

## Publicação

Produção em `https://www.procemiza.com.br`, ligada à branch `main` de
`Mewstacks/LandingPageProcemiza` pela Vercel (projeto `landing-page-procemiza`). O apex
`procemiza.com.br` redireciona para `www`; o canonical, o sitemap e o robots usam `www`
(`site.domain` em `content/site.ts`). Antes de enviar: `typecheck`, `lint`, `test` e `build`.

## Estrutura

| Local | Responsabilidade |
| --- | --- |
| `app/` | Rotas, layout (Header, Footer, JSON-LD de organização), `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx`, `not-found.tsx`. |
| `content/site.ts` | Mensagens, navegação, FAQ e dados da empresa (`entity`). |
| `content/pages.ts` | Registro único das páginas indexáveis (título, descrição, data de modificação). Alimenta metadata, sitemap e breadcrumb. |
| `content/intents.ts` | Texto das páginas de solução, Conta 200 e calculadora. |
| `lib/calculator.ts` | Conta pura, sem React. Testada em `lib/*.test.ts`. |
| `lib/seo.ts` | `buildMetadata`, nós de JSON-LD e serialização segura. |
| `lib/consent.ts`, `lib/analytics.ts` | Consentimento (LGPD) e eventos do GA4. |
| `components/calculator/` | `RoutineProvider` (estado compartilhado), painel do hero e calculadora. |
| `components/page/` | Blocos das páginas internas. |

Páginas: `/`, `/calculadora`, `/automacao-de-processos`, `/integracao-de-sistemas`,
`/sistemas-sob-medida`, `/conta-200`, `/privacidade`. Nova página: entrada em
`content/pages.ts` + rota; sitemap e metadata saem do registro.

## Calculadora

Horas por mês = tempo por pessoa × pessoas (21 dias úteis, 52/12 semanas). Custo da hora =
salário × (1 + encargos) ÷ 220 (encargos 70% CLT, 50% Simples; regra de bolso editável) ou
valor da hora digitado. Horas devolvidas = horas × redução (esperado 80%, otimista = esperado
+ 10 pontos, máximo 95%). Validação nunca ajusta valor em silêncio. Sem custo informado, só horas.

Os números vêm do visitante. Nada é enviado a servidor; o estado fica em `sessionStorage`.
O link do WhatsApp (`?text=`) leva a rotina e os números.

## Conteúdo e números

Não há métrica, depoimento ou resultado de cliente inventado. Casos só entram com dado
autorizado. Textos das páginas de solução e o FAQ são rascunhos feitos a partir do que o site
já dizia; confirmar antes de ampliar qualquer promessa.

`entity` em `content/site.ts` (cidade/UF, e-mail, CNPJ, redes) é opcional: campo vazio não é
renderizado nem vai para o JSON-LD.

## SEO e busca por IA

- Canonical único em `www`; `title`/`description`/OG por página (`buildMetadata`).
- JSON-LD: Organization + ProfessionalService, WebSite, WebPage, BreadcrumbList, Service,
  SoftwareApplication (Conta 200), WebApplication (calculadora).
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

Contraste AA medido (tokens semânticos em `app/globals.css`: escuro por padrão, `.theme-light`
nas seções claras; laranja nunca como texto sobre claro). Alvos ≥ 44 px, foco visível,
`prefers-reduced-motion` respeitado. Meta de campo: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1.
