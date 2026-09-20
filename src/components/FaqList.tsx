import type { FaqItem } from "@/content/seo";

export function FaqList({
  items,
  heading = "Spørgsmål og svar",
  headingId = "faq",
}: {
  items: readonly FaqItem[];
  heading?: string;
  headingId?: string;
}) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section aria-labelledby={headingId} className="mt-12">
      <h2 id={headingId} className="text-2xl font-bold sm:text-3xl">
        {heading}
      </h2>
      <div className="mt-6 space-y-3">
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}

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
