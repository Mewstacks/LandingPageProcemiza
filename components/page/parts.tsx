import Link from "next/link";
import { cta, site } from "@/content/site";
import { pages, type PageKey } from "@/content/pages";
import type { Qa } from "@/content/intents";
import "./page.css";

export function PageHero({
  page,
  h1,
  answer,
  primary = "calculadora",
}: {
  page: PageKey;
  h1: string;
  answer: string;
  primary?: PageKey | null;
}) {
  const current = pages[page];
  return (
    <section className="page-hero" aria-labelledby="page-title">
      <div className="wrap page-hero-inner">
        <nav className="crumbs" aria-label="Você está em">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li aria-current="page">{current.name}</li>
          </ol>
        </nav>
        <h1 id="page-title" className="page-title">{h1}</h1>
        <p className="page-answer">{answer}</p>
        <div className="hero-actions">
          {primary ? (
            <Link href={pages[primary].path} className="btn btn-primary">
              {cta.primary}
            </Link>
          ) : null}
          <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="text-link">
            {cta.whatsapp}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function PageSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="page-section" aria-labelledby={`${id}-title`}>
      <div className="wrap page-section-grid">
        <h2 id={`${id}-title`} className="display-md">{title}</h2>
        <div className="page-section-body">{children}</div>
      </div>
    </section>
  );
}

/** Perguntas sempre abertas: lista de definição, legível sem JavaScript e sem clique. */
export function FaqList({ items }: { items: readonly Qa[] }) {
  return (
    <dl className="qa">
      {items.map((item) => (
        <div key={item.q} className="qa-item">
          <dt>{item.q}</dt>
          <dd>{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Related({ current }: { current: PageKey }) {
  const keys: PageKey[] = ["calculadora", "automacao", "integracao", "sobMedida"];
  return (
    <nav className="related theme-light" aria-label="Veja também">
      <div className="wrap">
        <h2 className="related-title">Veja também</h2>
        <ul>
          {keys
            .filter((k) => k !== current)
            .map((k) => (
              <li key={k}>
                <Link href={pages[k].path}>{pages[k].name}</Link>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
}
