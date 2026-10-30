import { JsonLd } from "@/components/JsonLd";
import { PilotCTA } from "@/components/PilotCTA";
import { FaqList, PageHero, PageSection, Related } from "@/components/page/parts";
import { steps, type IntentContent } from "@/content/intents";
import { pages, type PageKey } from "@/content/pages";
import { breadcrumbNode, graph, serviceNode, webPageNode } from "@/lib/seo";

export function IntentPage({ pageKey, content }: { pageKey: PageKey; content: IntentContent }) {
  const page = pages[pageKey];

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
          <blockquote className="page-quote">{content.example}</blockquote>
        </PageSection>
        <PageSection id="como" title="Como começamos">
          <ol className="page-steps">
            {steps.map((step) => (
              <li key={step.name}>
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
