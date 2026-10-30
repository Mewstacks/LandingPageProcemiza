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
  size = "poster",
  actions = true,
}: {
  page: PageKey;
  h1: string;
  answer: string;
  primary?: PageKey | null;
  /** `poster`: título do tamanho do fecho. `title`: tamanho de capítulo (páginas de ferramenta). */
  size?: "poster" | "title";
  actions?: boolean;
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
        <h1 id="page-title" className={`page-title${size === "title" ? " page-title--sm" : ""}`}>{h1}</h1>
        <p className="page-answer">{answer}</p>
        {actions ? (
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
        ) : null}
      </div>
    </section>
  );
}

/** Texto corrido com rótulo à esquerda (privacidade). */
export function PageSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="page-section" aria-labelledby={`${id}-title`}>
      <div className="wrap page-section-grid">
        <h2 id={`${id}-title`}>{title}</h2>
        <div className="page-section-body">{children}</div>
      </div>
    </section>
  );
}

/** Perguntas sempre abertas, em colunas: lista de definição, legível sem JavaScript e sem clique. */
export function FaqList({ items }: { items: readonly Qa[] }) {
  return (
    <dl className="qa">
      {items.map((item, index) => (
        <div key={item.q} className="qa-item" data-reveal={Math.min(index + 1, 4)}>
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
    <nav className="related" aria-label="Veja também">
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
    </nav>
  );
}
