import type { Metadata } from "next";
import { IntentPage } from "@/components/IntentPage";
import { transportadoras } from "@/content/intents";
import { pages } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.transportadoras);

export default function Page() {
  return <IntentPage pageKey="transportadoras" content={transportadoras} />;
}
