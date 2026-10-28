import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CalculatorSection } from "@/components/CalculatorSection";
import { RoutineProvider } from "@/components/calculator/RoutineProvider";
import { Conta200 } from "@/components/Conta200";
import { Method } from "@/components/Method";
import { Faq } from "@/components/Faq";
import { PilotCTA } from "@/components/PilotCTA";
import { Footer } from "@/components/Footer";
import { Clients } from "@/components/Clients";
import { Solutions } from "@/components/Solutions";

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
      <Footer />
    </>
  );
}
