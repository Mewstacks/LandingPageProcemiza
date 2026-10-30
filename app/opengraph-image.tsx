import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hero, site } from "@/content/site";

export const alt = "Procemiza — automação, integração e sistemas sob medida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const URL_LINE = site.domain.replace("https://", "");

/**
 * Fraunces (a fonte dos títulos do site) só com os glifos usados aqui, pela API do Google Fonts.
 * A imagem é gerada no build; se a rede falhar, cai na fonte padrão em vez de quebrar o build.
 */
async function loadFraunces(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@36,400&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/media/procemiza/brand/logo-header.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  const font = await loadFraunces(`${hero.title}${hero.support}${URL_LINE}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0c0b0a",
          color: "#f4f3f0",
          fontFamily: font ? "Fraunces" : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={330} height={56} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 80, lineHeight: 1.04, letterSpacing: -2, maxWidth: 1000 }}>{hero.title}</div>
          <div style={{ fontSize: 40, color: "#fc5f02" }}>{hero.support}</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#aaa298" }}>{URL_LINE}</div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Fraunces", data: font, weight: 400, style: "normal" }] : undefined,
    },
  );
}
