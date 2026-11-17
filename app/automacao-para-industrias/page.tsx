import type { Metadata } from "next";
import { IntentPage } from "@/components/IntentPage";
import { industrias } from "@/content/intents";
import { pages } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.industrias);

export default function Page() {
  return <IntentPage pageKey="industrias" content={industrias} />;
}
