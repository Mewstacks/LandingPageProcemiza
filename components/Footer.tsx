import Image from "next/image";
import Link from "next/link";
import { entity, footer, nav, site } from "@/content/site";
import { CookiePreferences } from "@/components/consent/Analytics";

export function Footer() {
  const details = [entity.legalName, entity.cityState, entity.cnpj ? `CNPJ ${entity.cnpj}` : undefined].filter(Boolean);
  return (
    <footer className="site-footer" aria-label="Rodapé">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <Image src="/media/procemiza/brand/logo-header.png" alt="Procemiza" width={2100} height={356} sizes="168px" />
          <p>{footer.line}</p>
        </div>
        <nav aria-label="Navegação do rodapé">
          <ul>{nav.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
        </nav>
        <ul className="footer-contact">
          <li>
            <a href={site.contactUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp<span aria-hidden="true"> ↗</span>
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </li>
          <li><Link href="/privacidade">Privacidade</Link></li>
          <li><CookiePreferences /></li>
          {entity.email ? <li><a href={`mailto:${entity.email}`}>{entity.email}</a></li> : null}
          {entity.social.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}<span className="sr-only"> (abre em nova aba)</span></a>
            </li>
          ))}
        </ul>
      </div>
      <div className="wrap footer-bottom">
        <p>© {new Date().getFullYear()} {details.join(" · ")}</p>
      </div>
    </footer>
  );
}
