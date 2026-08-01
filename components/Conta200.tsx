import Image from "next/image";
import { conta200, site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

export function Conta200() {
  return (
    <section id="conta-200" className="conta-section" aria-labelledby="conta200-title">
      <div className="wrap">
        <div className="conta-grid">
          <div className="conta-copy">
            <Reveal>
              <div className="conta-brand">
                <Image src="/media/procemiza/conta200/simbolo.png" alt="" width={2831} height={2998} />
                <div>
                  <p>{conta200.name}</p>
                  <span>{conta200.tagline}</span>
                </div>
              </div>
              <h2 id="conta200-title" className="display-lg">{conta200.title}</h2>
              <p className="lede mt-7">{conta200.text}</p>
            </Reveal>

            <ol className="conta-flow">
              {conta200.flow.map((step, index) => (
                <Reveal as="li" key={step.name} delay={0.06 + index * 0.05} className="conta-flow-step">
                  <span>{step.n}</span>
                  <div>
                    <h3>{step.name}</h3>
                    <p>{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={0.18}>
              <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Conversar sobre um processo <span className="arrow" aria-hidden="true">→</span>
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="conta-device-wrap">
            <figure className="conta-device">
              <div className="conta-device-speaker" aria-hidden="true" />
              <div className="conta-device-screen">
                <Image
                  src="/media/procemiza/conta200/real-whatsapp.jpeg"
                  alt="Captura real e anonimizada de uma solicitação de nota fiscal enviada pelo WhatsApp."
                  width={590}
                  height={1250}
                  className="conta-real-shot"
                />
                <div className="conta-device-header" aria-hidden="true">
                  <span className="conta-back">‹</span>
                  <Image src="/media/procemiza/conta200/simbolo.png" alt="" width={2831} height={2998} />
                  <div><strong>Conta 200</strong><span>assistente com IA</span></div>
                </div>
              </div>
              <figcaption>{conta200.screenshotNote}</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
