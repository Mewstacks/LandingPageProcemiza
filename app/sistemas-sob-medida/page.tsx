import type { Metadata } from "next";
import { IntentPage } from "@/components/IntentPage";
import { sobMedida } from "@/content/intents";
import { pages } from "@/content/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.sobMedida);

export default function Page() {
  return <IntentPage pageKey="sobMedida" content={sobMedida} />;
}
