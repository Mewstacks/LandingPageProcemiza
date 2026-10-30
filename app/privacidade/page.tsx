import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageHero, PageSection } from "@/components/page/parts";
import { entity, site } from "@/content/site";
import { pages } from "@/content/pages";
import { breadcrumbNode, buildMetadata, graph, webPageNode } from "@/lib/seo";
import { formatPhone } from "@/lib/whatsapp";

export const metadata: Metadata = buildMetadata(pages.privacidade);

/**
 * RASCUNHO técnico do que o site faz hoje. Revisar com assessoria jurídica
 * antes de depender dele; completar controlador, CNPJ e canal do encarregado.
 */
export default function Page() {
  const contact = entity.email ? entity.email : "o WhatsApp da Procemiza";
  return (
    <main id="conteudo">
      <JsonLd data={graph(webPageNode(pages.privacidade), breadcrumbNode(pages.privacidade))} />
      <PageHero
        page="privacidade"
        h1="Política de privacidade"
        answer="O que este site trata, para quê e como você exerce seus direitos pela LGPD (Lei 13.709/2018)."
        primary={null}
      />
      <div className="page-body theme-light">
        <PageSection id="quem" title="Quem trata">
          <p>
            {entity.legalName}
            {entity.cnpj ? `, CNPJ ${entity.cnpj}` : ""}
            {entity.cityState ? `, ${entity.cityState}` : ""}. Contato para assuntos de privacidade: {contact}.
          </p>
        </PageSection>
        <PageSection id="calculadora" title="Calculadora">
          <p>
            Os números e o texto da rotina que você digita ficam só no seu navegador, nesta aba, e somem ao fechá-la. Nada é enviado
            a servidor.
          </p>
        </PageSection>
        <PageSection id="whatsapp" title="WhatsApp">
          <p>
            Ao clicar em “Falar no WhatsApp”, abrimos uma conversa com a Procemiza com uma mensagem pronta, que você pode editar
            antes de enviar. O que você enviar passa a ser tratado pelo WhatsApp e pela Procemiza para responder ao seu contato.
            Número de contato: {formatPhone(site.contactUrl)}.
          </p>
        </PageSection>
        <PageSection id="medicao" title="Medição">
          <p>
            Com o seu aceite, usamos o Google Analytics 4 para saber quais páginas são vistas, quais botões são clicados e se a
            calculadora foi usada (só em faixas de horas, nunca com o texto da rotina). Sem aceite, nada é carregado e nenhum
            cookie de medição é criado.
          </p>
          <p>
            Para mudar a escolha, use “Cookies” no rodapé. Recusar apaga os cookies de medição deste navegador.
          </p>
        </PageSection>
        <PageSection id="direitos" title="Seus direitos">
          <p>
            Você pode pedir confirmação do tratamento, acesso, correção, eliminação, portabilidade e revogação do consentimento
            (LGPD, art. 18). Fale com {contact}.
          </p>
          <p>Última atualização: {pages.privacidade.modified}.</p>
        </PageSection>
      </div>
    </main>
  );
}
