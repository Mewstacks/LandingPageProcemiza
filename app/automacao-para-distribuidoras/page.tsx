import type { Metadata } from "next";
import { IntentPage } from "@/components/IntentPage";
import { distribuidoras } from "@/content/intents";
import { pages } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.distribuidoras);

export default function Page() {
  return <IntentPage pageKey="distribuidoras" content={distribuidoras} />;
}
