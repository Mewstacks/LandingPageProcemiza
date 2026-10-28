import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hero } from "@/content/site";

export const alt = "Procemiza — automação, integração e sistemas sob medida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/media/procemiza/brand/logo-header.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

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
          color: "#f5f2ec",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={330} height={56} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>{hero.title}</div>
          <div style={{ fontSize: 34, color: "#fc5f02" }}>{hero.support}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#aaa298" }}>www.procemiza.com.br</div>
      </div>
    ),
    size,
  );
}
