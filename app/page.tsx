import { Hero } from "@/components/Hero";
import { CalculatorSection } from "@/components/CalculatorSection";
import { RoutineProvider } from "@/components/calculator/RoutineProvider";
import { Conta200 } from "@/components/Conta200";
import { Method } from "@/components/Method";
import { Faq } from "@/components/Faq";
import { PilotCTA } from "@/components/PilotCTA";
import { Clients } from "@/components/Clients";
import { Solutions } from "@/components/Solutions";
import { JsonLd } from "@/components/JsonLd";
import { graph, webPageNode } from "@/lib/seo";
import { pages } from "@/content/pages";

export default function Home() {
  return (
    <main id="conteudo">
      <JsonLd data={graph(webPageNode(pages.home))} />
      <RoutineProvider>
        <Hero />
        <CalculatorSection />
      </RoutineProvider>
      <Clients />
      <Solutions />
      <Conta200 />
      <Method />
      <Faq />
      <PilotCTA />
    </main>
  );
}
