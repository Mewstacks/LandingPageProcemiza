import { Hero } from "@/components/Hero";
import { CalculatorSection } from "@/components/CalculatorSection";
import { Solutions } from "@/components/Solutions";
import { Clients } from "@/components/Clients";
import { PilotCTA } from "@/components/PilotCTA";
import { JsonLd } from "@/components/JsonLd";
import { graph, webPageNode } from "@/lib/seo";
import { pages } from "@/content/pages";

/** Capítulos: tinta (hero) → papel (calculadora) → laranja (soluções) → papel (clientes) → tinta (fecho). */
export default function Home() {
  return (
    <main id="conteudo">
      <JsonLd data={graph(webPageNode(pages.home))} />
      <Hero />
      <CalculatorSection />
      <Solutions />
      <Clients />
      <PilotCTA />
    </main>
  );
}
