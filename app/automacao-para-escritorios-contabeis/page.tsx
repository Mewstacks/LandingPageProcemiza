import type { Metadata } from "next";
import { IntentPage } from "@/components/IntentPage";
import { contabeis } from "@/content/intents";
import { pages } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.contabeis);

export default function Page() {
  return <IntentPage pageKey="contabeis" content={contabeis} />;
}
