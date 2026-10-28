import type { MetadataRoute } from "next";
import { pageList } from "@/content/pages";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return pageList.map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: p.modified,
    changeFrequency: p.path === "/" ? "monthly" : "yearly",
    priority: p.priority,
  }));
}
