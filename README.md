# Procemiza — Site institucional

Landing page da **Procemiza** para gestores e responsáveis pela operação de
empresas de vários setores. A mensagem central é **“Transforme processo em
margem.”**: automação de rotinas, integração de sistemas e sistemas sob medida.
O Conta 200 aparece como uma aplicação específica para contabilidade.

## Desenvolvimento e verificação

- Next.js 15 (App Router), React 19 e TypeScript.
- Tailwind CSS v4 e CSS próprio para a composição visual.
- GSAP 3 + ScrollTrigger na experiência central; sem WebGL.
- Fraunces nos títulos, Archivo na leitura e IBM Plex Mono em identificadores.

```bash
npm install
npm run dev
npx tsc --noEmit --incremental false
npm run build
npm run start
```

O desenvolvimento usa `http://localhost:3000`. `next build` gera o build de
produção em `.next`; `next start` o serve. A página é prerenderizada, mas o
projeto usa a otimização de imagens do Next.js: uma hospedagem puramente
estática exige configuração adicional.

## Publicação

A produção em `https://www.procemiza.com.br` está ligada à branch `main` de
`Mewstacks/LandingPageProcemiza` pela Vercel, no projeto `landing-page-procemiza`.
Antes de enviar alterações, executar a verificação de tipos e o build. Após o
push, conferir o status Vercel do commit e a atualização no domínio público.
Não é necessário criar uma hospedagem ou projeto novo.

## Conteúdo e estrutura

A ordem da página é: cabeçalho → hero → clientes → custo operacional → camadas
→ soluções → Conta 200 → método → contato → rodapé.

| Local | Responsabilidade |
| --- | --- |
| `app/` | Página, layout, fontes, metadados, JSON-LD, sitemap e robots. |
| `content/site.ts` | Mensagens institucionais, navegação e contato. |
| `content/clients.ts` e `content/solutions.ts` | Dados tipados dos clientes e das três soluções. |
| `components/` | Seções; CSS específico de clientes e soluções em `clients-solutions.css`. |
| `components/layers/` | Modelo físico compartilhado, visuais, conteúdo, geometria e controle da experiência de camadas. |
| `public/media/procemiza/` | Marca, clientes, material real do Conta 200 e imagem de compartilhamento. |

As âncoras `#custo`, `#camadas`, `#conta-200` e `#como-atuamos` foram preservadas.
`#clientes` e `#solucoes` são novos destinos. O WhatsApp continua definido em
`site.contactUrl`; não há formulário, banco de dados ou API de negócio.

### Camadas e movimento

A mesma informação percorre **Origens → Regras → Integração → Entrega**.
`layers.data.ts` define textos, portas e percursos. `scene.geometry.ts` calcula
profundidade, posição da solicitação e projeção dos rótulos. `InfrastructureScene`
renderiza os planos físicos em CSS 3D e SVG; o hero usa uma vista estática do
mesmo modelo, sem criar outra timeline.

O controle da narrativa fica em `LayeredInfrastructure`. A experiência longa
exige largura de pelo menos **1024 px**, altura de pelo menos **700 px** e ausência
de preferência por movimento reduzido. São **500svh**, incluindo o palco fixo de
uma viewport, com abertura (0–12%), quatro capítulos (12–84%) e síntese (84–100%).
Toda a progressão acompanha a rolagem nativa e pode ser revertida; não há
reprodução automática nem captura da roda do mouse.

O índice navega pelos quatro capítulos. “Pular demonstração” leva ao título de
soluções e transfere o foco. Em telas menores, baixas ou com movimento reduzido,
uma composição compacta acompanha a explicação em fluxo normal. O HTML completo
é a base da seção; a animação só o substitui depois da inicialização.

Dimensões são medidas na inicialização e no redimensionamento. A atualização da
animação usa essas medidas, sem consultar layout a cada quadro. Os rótulos ficam
no plano da tela e suas linhas partem da mesma geometria dos planos.

### Clientes e soluções

A faixa de clientes contém **Di Bracco Enopizzeria**, **Roselar Móveis**,
**Fedrizzi Contabilidade & Consultoria**, **Rafael Pandolfo Advogados Associados**,
**Crescer Consultoria em RH** (Caxias do Sul) e **Miolo**. As marcas percorrem uma
única linha contínua, com tamanhos individuais para equilibrar seu peso visual.
A esteira pode ser pausada pelo botão ou ao passar o mouse e fica parada quando está fora da tela.
Com movimento reduzido ou sem JavaScript, a faixa permite rolagem horizontal
manual. A cópia visual usada no loop fica oculta de leitores de tela.
As imagens são locais, com cores e
proporções preservadas. As URLs de origem e o processamento constam em
`public/media/procemiza/clients/provenance.json`; originais foram preservados.

As três soluções usam `<details>` e `<summary>` nativos, com a primeira aberta.
No desktop a seleção troca a visualização à direita; no celular, o exemplo
aparece dentro do item expandido. As demonstrações são identificadas como
ilustrativas e não são atribuídas aos clientes. A interação básica funciona
sem JavaScript.

Não há métricas, depoimentos ou resultados de clientes inventados. A
representação de margem é qualitativa, sem sugerir um cálculo financeiro.

### Identidade e compartilhamento

Os tokens em `app/globals.css` preservam o fundo `#0C0B0A`, superfícies `#121110`
e `#1D1C1A`, texto `#F5F2EC`/`#CBC8C0` e laranja `#FC5F02`. O laranja indica
ação, conexão e estado ativo.

O layout fornece título e descrição multissetoriais, canonical, OpenGraph,
Twitter Card e dados estruturados `ProfessionalService`. A imagem de
compartilhamento é um PNG local de 1200 × 630, com a marca original, Fraunces,
Archivo e um diagrama vetorial das quatro camadas. Para regenerá-la:

```bash
node scripts/quality-og-image.mjs
```

O gerador usa `next/og` e `sharp`, já presentes no projeto, e consulta fontes
oficiais do Google apenas durante essa tarefa. O site entregue não precisa de
uma rota dinâmica para a imagem de compartilhamento.

## Acessibilidade e revisão

- Conteúdo semântico, link para pular ao conteúdo, foco visível e textos
  alternativos; cópias decorativas da cena ficam fora da leitura assistiva.
- Menu móvel com controles nativos, Escape e gerenciamento de foco após a
  inicialização. Soluções expansíveis continuam utilizáveis sem scripts.
- Movimento reduzido, telas baixas e falhas de inicialização mantêm a narrativa
  disponível sem retenção prolongada da rolagem.
- Imagens locais com dimensões reservadas; recursos abaixo da primeira dobra
  usam carregamento adiado. Revelações repetitivas de conteúdo foram removidas.

Revisar 360, 390, 768, 1024, 1440 e 1920 px, incluindo rolagem reversa, índice,
entrada por âncoras, salto de foco, menu móvel, expansão de soluções e mudança de
tamanho durante a navegação. Verificar também zoom de 200%, movimento reduzido,
leitor de tela e ausência de scripts, além de Chrome, Safari e Firefox quando
disponíveis.

As metas de desempenho são **LCP ≤ 2,5 s** e **CLS ≤ 0,1**. Elas devem ser
avaliadas em produção com as condições de medição registradas; um build
concluído, sozinho, não comprova essas metas. Evidências e limitações da revisão
local ficam em `.review/`, diretório ignorado pelo Git.
