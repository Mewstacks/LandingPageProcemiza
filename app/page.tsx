import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OperationalStory } from "@/components/OperationalStory";
import { LayeredInfrastructure } from "@/components/layers/LayeredInfrastructure";
import { MarginReality } from "@/components/MarginReality";
import { HiddenCost } from "@/components/HiddenCost";
import { Conta200 } from "@/components/Conta200";
import { Method } from "@/components/Method";
import { PilotCTA } from "@/components/PilotCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-accent focus:text-ink-950 focus:px-4 focus:py-2 focus:font-mono focus:text-xs"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <OperationalStory />
        <LayeredInfrastructure />
        <MarginReality />
        <HiddenCost />
        <Conta200 />
        <Method />
        <PilotCTA />
      </main>
      <Footer />
    </>
  );
}
