import { JsonLd } from "@/components/JsonLd";
import { PilotCTA } from "@/components/PilotCTA";
import { SolutionVisual } from "@/components/Solutions";
import { FaqList, PageHero, PageSection, Related } from "@/components/page/parts";
import { methodSteps, type IntentContent } from "@/content/intents";
import { pages, type PageKey } from "@/content/pages";
import { solutions } from "@/content/solutions";
import { breadcrumbNode, graph, serviceNode, webPageNode } from "@/lib/seo";

const VISUAL: Partial<Record<PageKey, number>> = { automacao: 0, integracao: 1, sobMedida: 2 };

export function IntentPage({ pageKey, content }: { pageKey: PageKey; content: IntentContent }) {
  const page = pages[pageKey];
  const visualIndex = VISUAL[pageKey];

  return (
    <main id="conteudo">
      <JsonLd data={graph(webPageNode(page), breadcrumbNode(page), serviceNode(page, content.serviceType))} />
      <PageHero page={pageKey} h1={content.h1} answer={content.answer} />
      <div className="page-body theme-light">
        <PageSection id="quando" title={content.whenTitle}>
          <ul className="page-list">
            {content.when.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PageSection>
        <PageSection id="exemplo" title={content.exampleTitle}>
          <div className="page-example">
            <blockquote>{content.example}</blockquote>
            {visualIndex !== undefined ? (
              <div className="page-visual theme-dark">
                <SolutionVisual solution={solutions[visualIndex]} />
              </div>
            ) : null}
          </div>
        </PageSection>
        <PageSection id="como" title="Como começamos">
          <ol className="page-steps">
            {methodSteps.map((step) => (
              <li key={step.n}>
                <strong>{step.name}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </PageSection>
        <PageSection id="perguntas" title="Perguntas">
          <FaqList items={content.faq} />
        </PageSection>
        <Related current={pageKey} />
      </div>
      <PilotCTA />
    </main>
  );
}
