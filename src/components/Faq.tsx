import { faqItems, faqSchema } from "@/content/faq";
import { getConfig } from "@/lib/runtime-config";

export async function Faq({ heading = "Spørgsmål og svar" }: { heading?: string }) {
  const config = await getConfig();
  const items = faqItems(config);

  return (
    <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-16">
      <h2 id="faq" className="text-3xl font-bold sm:text-4xl">
        {heading}
      </h2>

      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-card border border-line bg-surface open:border-brand"
          >
            <summary className="flex min-h-14 cursor-pointer items-center gap-4 px-6 py-4 text-lg font-semibold hover:text-brand">
              <span className="flex-1">{item.question}</span>
              <PlusMinusIcon />
            </summary>
            <p className="border-t border-line px-6 py-4 text-ink-soft">{item.answer}</p>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(config)) }}
      />
    </section>
  );
}

/** Streg der bliver til et plus, når svaret er foldet sammen. */
function PlusMinusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="size-6 shrink-0 text-brand"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" className="group-open:hidden" />
    </svg>
  );
}
