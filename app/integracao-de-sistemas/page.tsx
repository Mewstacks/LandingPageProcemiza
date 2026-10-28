import type { Metadata } from "next";
import { IntentPage } from "@/components/IntentPage";
import { integracao } from "@/content/intents";
import { pages } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.integracao);

export default function Page() {
  return <IntentPage pageKey="integracao" content={integracao} />;
}
