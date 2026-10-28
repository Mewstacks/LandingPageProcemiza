import "@/components/page/page.css";
import type { Metadata } from "next";
import Link from "next/link";
import { pages } from "@/content/pages";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "A página que você procurou não existe. Veja as páginas do site.",
  alternates: {},
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="conteudo">
      <section className="page-hero" aria-labelledby="page-title">
        <div className="wrap page-hero-inner">
          <h1 id="page-title" className="page-title">Página não encontrada.</h1>
          <ul className="notfound-links">
            {[pages.home, pages.calculadora, pages.automacao, pages.integracao, pages.sobMedida, pages.conta200].map((p) => (
              <li key={p.path}>
                <Link href={p.path}>{p.name}<span aria-hidden="true"> →</span></Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
