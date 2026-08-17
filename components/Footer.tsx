import Image from "next/image";
import { footer, nav, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="site-footer" aria-label="Rodapé">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <Image src="/media/procemiza/brand/logo-header.png" alt="Procemiza" width={2100} height={356} />
          <p>{footer.line}</p>
        </div>
        <nav aria-label="Navegação do rodapé">
          <ul>{nav.map((item) => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}</ul>
        </nav>
        <a className="footer-contact" href={site.domain} target="_blank" rel="noopener noreferrer">
          procemiza.com.br <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="wrap footer-bottom">
        <p>© {new Date().getFullYear()} {footer.note}</p>
      </div>
    </footer>
  );
}
