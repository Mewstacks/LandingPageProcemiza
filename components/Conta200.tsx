import Image from "next/image";
import { conta200, site } from "@/content/site";

export function Conta200() {
  return (
    <section id="conta-200" className="conta-section" aria-labelledby="conta200-title">
      <div className="wrap">
        <div className="conta-grid">
          <div className="conta-copy">
            <p className="section-note">Uma aplicação real <span aria-hidden="true">/</span> Contabilidade</p>
            <div className="conta-brand">
              <Image src="/media/procemiza/conta200/simbolo.png" alt="" width={64} height={68} sizes="40px" />
              <span>{conta200.name}</span>
            </div>
            <h2 id="conta200-title" className="display-md">{conta200.title}</h2>
            <p>{conta200.text}</p>
            <ol className="conta-flow" aria-label="Como o Conta 200 funciona">
              {conta200.flow.map((step) => <li key={step.n}><span>{step.n}</span>{step.name}</li>)}
            </ol>
            <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="text-link">Conversar sobre uma rotina<span aria-hidden="true">↗</span></a>
          </div>
          <figure className="conta-proof">
            <div className="conta-proof-image">
              <div className="conta-proof-label"><span aria-hidden="true" />Solicitação pelo WhatsApp</div>
              <div className="conta-proof-viewport">
                <Image src="/media/procemiza/conta200/real-whatsapp.jpeg" alt="Solicitação de nota fiscal pelo WhatsApp, com a empresa identificada como X." width={590} height={1280} sizes="(max-width: 767px) 320px, 360px" />
              </div>
            </div>
            <figcaption>{conta200.screenshotNote}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
