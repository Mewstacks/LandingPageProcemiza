import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { pages } from "@/content/pages";
import { buildMetadata, graph, organizationNodes } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/consent/Analytics";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  ...buildMetadata(pages.home),
  title: { default: pages.home.title, template: `%s | ${site.name}` },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`no-js ${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.replace('no-js','js');",
          }}
        />
        <JsonLd data={graph(...organizationNodes())} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-accent focus:text-ink-950 focus:px-4 focus:py-2 focus:font-mono focus:text-xs"
        >
          Pular para o conteúdo
        </a>
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
