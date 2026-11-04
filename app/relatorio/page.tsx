import type { Metadata } from "next";
import { ReportView } from "@/components/report/ReportView";

/** A simulação vem do fragmento da URL, lido no navegador: a rota é estática e fora do índice. */
export const metadata: Metadata = {
  title: "Relatório de ganho com automação",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main id="conteudo" className="theme-light report-page">
      <div className="wrap report-wrap">
        <ReportView />
      </div>
    </main>
  );
}
