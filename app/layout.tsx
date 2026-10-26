import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";

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
  title: "Procemiza — Automação, integração e sistemas para empresas",
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Procemiza — Transforme processo em margem",
    description: site.description,
    url: site.domain,
    siteName: "Procemiza",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/media/procemiza/og/og-image.png",
        width: 1200,
        height: 630,
        alt: "Procemiza — transforme processo em margem. Automação, integração e sistemas para empresas.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Procemiza — Transforme processo em margem",
    description: site.description,
    images: ["/media/procemiza/og/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0a",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Procemiza",
  url: site.domain,
  description: site.description,
  logo: `${site.domain}/media/procemiza/brand/logo-horizontal-color.png`,
  areaServed: "BR",
  knowsAbout: [
    "Automação de rotinas operacionais",
    "Integração de sistemas",
    "Desenvolvimento de sistemas sob medida",
    "Organização de processos empresariais",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`no-js ${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.remove('no-js');d.classList.add('js');if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('reduced-motion');}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
