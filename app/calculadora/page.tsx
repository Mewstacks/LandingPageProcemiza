import type { Metadata } from "next";
import { CalculatorSection } from "@/components/CalculatorSection";
import { JsonLd } from "@/components/JsonLd";
import { PilotCTA } from "@/components/PilotCTA";
import { FaqList, PageHero, PageSection, Related } from "@/components/page/parts";
import { calculadoraPage } from "@/content/intents";
import { pages } from "@/content/pages";
import { absoluteUrl, breadcrumbNode, buildMetadata, graph, webPageNode } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.calculadora);

const app = {
  "@type": "WebApplication",
  "@id": `${absoluteUrl(pages.calculadora.path)}#app`,
  name: "Calculadora de ganho com automação",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Qualquer",
  description: pages.calculadora.description,
  url: absoluteUrl(pages.calculadora.path),
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
};

export default function Page() {
  return (
    <main id="conteudo">
      <JsonLd data={graph(webPageNode(pages.calculadora), breadcrumbNode(pages.calculadora), app)} />
      <PageHero page="calculadora" h1={calculadoraPage.h1} answer={calculadoraPage.answer} primary={null} />
      <CalculatorSection />
      <div className="page-body theme-light">
        <PageSection id="conta" title="Como calculamos">
          <ul className="page-list">
            {calculadoraPage.how.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </PageSection>
        <PageSection id="perguntas" title="Perguntas">
          <FaqList items={calculadoraPage.faq} />
        </PageSection>
        <Related current="calculadora" />
      </div>
      <PilotCTA />
    </main>
  );
}
