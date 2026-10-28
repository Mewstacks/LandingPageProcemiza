import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Busca, consulta de usuário e treino liberados de propósito: o site é vitrine
 * pública. Fontes: developers.openai.com/api/docs/bots,
 * support.claude.com/en/articles/8896518, docs.perplexity.ai.
 */
const AI_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_AGENTS, allow: "/" },
    ],
    sitemap: `${site.domain}/sitemap.xml`,
    host: site.domain,
  };
}
