import { describe, expect, it } from "vitest";
import { pages, pageList } from "@/content/pages";
import { absoluteUrl, breadcrumbNode, buildMetadata, graph, organizationNodes, serializeJsonLd } from "./seo";

describe("seo", () => {
  it("URLs usam o host www, sem barra final exceto a raiz", () => {
    expect(absoluteUrl("/")).toBe("https://www.procemiza.com.br/");
    expect(absoluteUrl("/calculadora")).toBe("https://www.procemiza.com.br/calculadora");
  });

  it("canonical e og:url de cada página batem", () => {
    for (const p of pageList) {
      const m = buildMetadata(p);
      expect(m.alternates?.canonical).toBe(absoluteUrl(p.path));
      expect((m.openGraph as { url: string }).url).toBe(absoluteUrl(p.path));
    }
  });

  it("title e description únicos e dentro de limites razoáveis", () => {
    const titles = new Set(pageList.map((p) => p.title));
    const descs = new Set(pageList.map((p) => p.description));
    expect(titles.size).toBe(pageList.length);
    expect(descs.size).toBe(pageList.length);
    for (const p of pageList) {
      expect(p.title.length).toBeLessThanOrEqual(60);
      expect(p.description.length).toBeLessThanOrEqual(170);
    }
  });

  it("og:image e twitter:image presentes em toda página", () => {
    for (const p of pageList) {
      const m = buildMetadata(p);
      expect((m.openGraph as { images: unknown[] }).images).toHaveLength(1);
      expect((m.twitter as { images: string[] }).images).toEqual(["/opengraph-image"]);
    }
  });

  it("organização omite campos sem valor (nada vazio ou inventado)", () => {
    const [org] = organizationNodes() as Record<string, unknown>[];
    expect(org).not.toHaveProperty("taxID");
    expect(org).not.toHaveProperty("address");
    expect(org).not.toHaveProperty("sameAs");
    expect(org["@id"]).toBe("https://www.procemiza.com.br/#organization");
  });

  it("breadcrumb: home não tem; subpágina tem Início → página", () => {
    expect(breadcrumbNode(pages.home)).toBeNull();
    const b = breadcrumbNode(pages.calculadora) as { itemListElement: { position: number; name: string }[] };
    expect(b.itemListElement.map((i) => i.name)).toEqual(["Início", "Calculadora"]);
  });

  it("serialização escapa < para não fechar o script", () => {
    const out = serializeJsonLd(graph({ "@type": "Thing", name: "</script><b>" }));
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
  });
});
