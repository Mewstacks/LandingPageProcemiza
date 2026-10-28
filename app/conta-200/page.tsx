import type { Metadata } from "next";
import { Conta200 } from "@/components/Conta200";
import { JsonLd } from "@/components/JsonLd";
import { PilotCTA } from "@/components/PilotCTA";
import { FaqList, PageHero, PageSection, Related } from "@/components/page/parts";
import { conta200Page } from "@/content/intents";
import { pages } from "@/content/pages";
import { absoluteUrl, breadcrumbNode, buildMetadata, graph, webPageNode } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.conta200);

const app = {
  "@type": "SoftwareApplication",
  "@id": `${absoluteUrl(pages.conta200.path)}#app`,
  name: "Conta 200",
  applicationCategory: "BusinessApplication",
  description: pages.conta200.description,
  operatingSystem: "WhatsApp",
  url: absoluteUrl(pages.conta200.path),
};

export default function Page() {
  return (
    <main id="conteudo">
      <JsonLd data={graph(webPageNode(pages.conta200), breadcrumbNode(pages.conta200), app)} />
      <PageHero page="conta200" h1={conta200Page.h1} answer={conta200Page.answer} primary={null} />
      <Conta200 />
      <div className="page-body theme-light">
        <PageSection id="perguntas" title="Perguntas">
          <FaqList items={conta200Page.faq} />
        </PageSection>
        <Related current="conta200" />
      </div>
      <PilotCTA />
    </main>
  );
}
