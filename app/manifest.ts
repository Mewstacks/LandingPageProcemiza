import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    lang: "pt-BR",
    start_url: "/",
    display: "browser",
    background_color: "#0c0b0a",
    theme_color: "#0c0b0a",
    icons: [{ src: "/media/procemiza/brand/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
