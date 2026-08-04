# Procemiza — Site Institucional

Site institucional da **Procemiza** — automação, integração e sistemas para
**escritórios contábeis**. O público da página são sócios e gestores de
escritório; o vocabulário é o da rotina (competência, fechamento, conferência
fiscal, folha, cobrança de documento), organizado por departamento.

> "Transforme processo em margem."

## Stack

- **Next.js 15** (App Router, prerender estático) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (tokens em `@theme` no `app/globals.css`)
- **GSAP 3 + ScrollTrigger** para a narrativa de scroll (única lib de animação)
- Fontes open source via `next/font`: **Fraunces** (display serif editorial),
  **Archivo** (sans de interface), **IBM Plex Mono** (labels/dados)

## Rodar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:3000
npm run build    # build de produção (saída estática em .next)
npm run start    # servir o build de produção
```

## Publicar

O projeto é uma página estática prerenderizada (sem rotas de API). Qualquer
host de Next.js funciona (Vercel é o caminho trivial: importar o repositório e
fazer deploy). Para hosting estático puro, sirva o resultado de `next build`
através de um adapter/export conforme o provedor.

## Arquitetura

```
app/                  layout (fontes, SEO, JSON-LD), página, sitemap, robots, ícones
content/site.ts       TODA a copy do site, com marcadores de dados pendentes
components/           seções na ordem da página: Header, Hero, MarginReality,
                      LayeredInfrastructure, Conta200, Method, PilotCTA, Footer
components/layers/    a seção central (LayeredInfrastructure):
  LayeredInfrastructure.tsx  orquestrador (cena 3D + versão estática) e coreografia
  layers.data.ts      textos das 4 camadas e estágios da timeline
  LayerVisuals.tsx    visualizações internas de cada camada (HTML/SVG puro)
components/ui/        Reveal (fade on scroll)
lib/gsap.ts           registro do GSAP/ScrollTrigger
public/media/procemiza/  marca (logos processados), Conta 200, OG image
```

`MarginReality` é a seção `#custo` inteira: a equação de margem
(honorário − custos de atender = margem por cliente) **e** a lista "onde a
margem se perde", com etiqueta de departamento por item. As duas eram seções
separadas e foram fundidas para encurtar a página.

`components/OperationalStory.tsx` existe mas **não está na página**: repetia o
arco Origens → Regras → Entrega que `LayeredInfrastructure` conta melhor. O
componente e o CSS `.company-story` / `.op-*` foram mantidos para permitir
restauração em um import.

### A seção das camadas (LayeredInfrastructure)

- **Desktop (≥1024px, sem reduced-motion):** trilho de 460vh com cena sticky de
  100svh. Quatro planos 3D (`preserve-3d`, perspectiva 1400px, tilt inicial de
  58°) entram sequencialmente com o scroll (GSAP scrub — todo movimento é
  dirigido pelo progresso, nunca por tempo). A linha laranja é desenhada ao
  longo de toda a trilha e a camada ativa se destaca (superfície e traços
  recoloridos) enquanto as outras recuam. Nos últimos ~18% a câmera achata e a
  pilha assenta. A configuração numérica (starts de cada capítulo, ângulos)
  está no topo de `LayeredInfrastructure.tsx`.
- **Mobile / reduced-motion / sem JS:** as quatro camadas aparecem como cartões
  em sequência vertical, sempre legíveis, no estado final conectado, com trilho
  lateral de progresso. Nenhum pinning. A versão estática é o HTML padrão
  (SEO e no-JS); a cena 3D só é ativada via `gsap.matchMedia`.

### Tokens

Definidos em `app/globals.css` (`@theme`): superfícies `ink-*`, contornos
`line*`, texto `paper/mist/dim/faint`, marca `accent #FC5F02` (laranja oficial,
extraído do vetor da marca), `amber`, `rust`, `navy`, e sinais
(`signal-green/cyan/lilac/red`) usados **somente** dentro de visualizações de
dados. Tipografia, easing, durações e ritmo de seção também são tokens.

## Conteúdo pendente de validação (marcadores em `content/site.ts`)

- **Canal oficial de agendamento** — CTAs apontam temporariamente para
  `procemiza.com.br` (domínio real da proposta). Substituir pelo link de
  agenda/WhatsApp oficial.
- **Número de WhatsApp do Conta 200** — o número no projeto original é um
  placeholder explícito; não foi publicado.
- **Logos de clientes** — nenhum cliente autorizado nos materiais; a página não
  tem faixa de prova (nada fictício).
- **Métricas reais** — nenhuma métrica confirmada. A equação de margem em
  `#custo` é qualitativa de propósito (`aria-label` diz isso): sem números
  inventados até existir dado validado.

## Acessibilidade e performance

- HTML semântico, headings ordenados, skip link, foco visível (anel laranja),
  botões reais, menu mobile com `aria-expanded`/Escape, `aria-live` nas
  alternâncias interativas.
- `prefers-reduced-motion`: sem pinning nem deslocamentos; conteúdo completo
  estático (CSS + `gsap.matchMedia`).
- Hero textual é HTML puro (LCP imediato); animações só em `transform`/`opacity`;
  imagens locais otimizadas; JS first-load ≈ 159 kB.
