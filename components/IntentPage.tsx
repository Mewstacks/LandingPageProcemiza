import type { CSSProperties } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PilotCTA } from "@/components/PilotCTA";
import { FaqList, PageHero, Related } from "@/components/page/parts";
import type { IntentContent } from "@/content/intents";
import { pages, type PageKey } from "@/content/pages";
import { breadcrumbNode, graph, serviceNode, webPageNode } from "@/lib/seo";

/**
 * Página de solução em quatro capítulos de cor: título em cartaz (tinta), quando faz sentido (papel),
 * o exemplo com os outros caminhos (laranja) e as perguntas (papel). Só o que ajuda a decidir.
 */
export function IntentPage({ pageKey, content }: { pageKey: PageKey; content: IntentContent }) {
  const page = pages[pageKey];

  return (
    <main id="conteudo">
      <JsonLd data={graph(webPageNode(page), breadcrumbNode(page), serviceNode(page, content.serviceType))} />
      <PageHero page={pageKey} h1={content.h1} answer={content.answer} />

      <section className="page-when theme-light" aria-labelledby="quando-title">
        <div className="wrap">
          <h2 id="quando-title" className="page-h2" data-reveal>{content.whenTitle}</h2>
          <ul className="when-grid" role="list" style={{ "--n": content.when.length } as CSSProperties}>
            {content.when.map((item, index) => (
              <li key={item} data-reveal={Math.min(index + 1, 4)}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-example theme-orange" aria-label={content.exampleTitle}>
        <div className="wrap example-grid">
          <p className="example-text" data-reveal>
            <span className="sr-only">{content.exampleTitle}: </span>
            {content.example}
          </p>
          <div data-reveal="2">
            <Related current={pageKey} />
          </div>
        </div>
      </section>

      <section className="page-faq theme-light" aria-labelledby="perguntas-title">
        <div className="wrap">
          <h2 id="perguntas-title" className="page-h2" data-reveal>Perguntas</h2>
          <FaqList items={content.faq} />
        </div>
      </section>

      <PilotCTA compact />
    </main>
  );
}
