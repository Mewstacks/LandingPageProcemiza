import type { Metadata } from "next";
import { IntentPage } from "@/components/IntentPage";
import { automacao } from "@/content/intents";
import { pages } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.automacao);

export default function Page() {
  return <IntentPage pageKey="automacao" content={automacao} />;
}
