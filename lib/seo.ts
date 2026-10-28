import type { Metadata } from "next";
import { entity, site } from "@/content/site";
import { pages, type PageMeta } from "@/content/pages";

export function absoluteUrl(path: string): string {
  return new URL(path, site.domain).toString().replace(/\/$/, path === "/" ? "/" : "");
}

/**
 * Metadata completa por página. `openGraph`/`twitter` de uma página substituem
 * os do layout por inteiro, então cada objeto sai completo aqui, imagem incluída
 * (gerada por app/opengraph-image.tsx).
 */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Procemiza — automação, integração e sistemas sob medida" };

export function buildMetadata(page: PageMeta): Metadata {
  const url = absoluteUrl(page.path);
  return {
    title: page.path === "/" ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: site.name,
      title: page.title,
      description: page.description,
      url,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: [OG_IMAGE.url] },
  };
}

type Json = Record<string, unknown>;

const ORG_ID = `${site.domain}/#organization`;
const SITE_ID = `${site.domain}/#website`;

function omitEmpty<T extends Json>(o: T): T {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

/** Organização + site. Campo sem valor confirmado é omitido, nunca inventado. */
export function organizationNodes(): Json[] {
  const org = omitEmpty({
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: site.name,
    legalName: entity.legalName,
    url: site.domain,
    description: site.description,
    logo: `${site.domain}/media/procemiza/brand/logo-horizontal-color.png`,
    areaServed: "BR",
    taxID: entity.cnpj,
    email: entity.email,
    address: entity.cityState
      ? { "@type": "PostalAddress", addressLocality: entity.cityState.split(",")[0]?.trim(), addressRegion: entity.cityState.split(",")[1]?.trim(), addressCountry: "BR" }
      : undefined,
    contactPoint: [
      omitEmpty({
        "@type": "ContactPoint",
        contactType: "customer support",
        url: site.contactUrl,
        email: entity.email,
        availableLanguage: "pt-BR",
      }),
    ],
    sameAs: entity.social.map((s) => s.url),
    knowsAbout: [
      "Automação de processos",
      "Integração de sistemas",
      "Desenvolvimento de sistemas sob medida",
    ],
  });
  const web = {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: site.domain,
    name: site.name,
    inLanguage: "pt-BR",
    publisher: { "@id": ORG_ID },
  };
  return [org, web];
}

export function breadcrumbNode(page: PageMeta): Json | null {
  if (page.path === "/") return null;
  const items = [pages.home, page];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      item: absoluteUrl(p.path),
    })),
  };
}

export function webPageNode(page: PageMeta): Json {
  return {
    "@type": "WebPage",
    "@id": `${absoluteUrl(page.path)}#webpage`,
    url: absoluteUrl(page.path),
    name: page.title,
    description: page.description,
    inLanguage: "pt-BR",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    dateModified: page.modified,
  };
}

export function serviceNode(page: PageMeta, serviceType: string): Json {
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(page.path)}#service`,
    name: page.name,
    serviceType,
    description: page.description,
    provider: { "@id": ORG_ID },
    areaServed: "BR",
    url: absoluteUrl(page.path),
  };
}

export function graph(...nodes: (Json | null)[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes.filter((n): n is Json => n !== null) };
}

/** Escapa `<` para o JSON-LD não fechar o <script> (recomendação da doc do Next). */
export function serializeJsonLd(data: Json): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
