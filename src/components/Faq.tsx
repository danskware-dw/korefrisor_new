import { FaqList } from "@/components/FaqList";
import { faqItems } from "@/content/faq";
import type { FaqItem } from "@/content/seo";
import { getConfig } from "@/lib/runtime-config";

export async function Faq({
  heading = "Spørgsmål og svar",
  items,
}: {
  heading?: string;
  items?: readonly FaqItem[];
}) {
  const list = items ?? faqItems(await getConfig());

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <FaqList heading={heading} items={list} />
    </div>
  );
}
