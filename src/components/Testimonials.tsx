import { business } from "@/config/business";

/**
 * Vises kun, når der står rigtige udtalelser i business.ts.
 * Skriv aldrig noget her, som en kunde ikke selv har sagt.
 */
export function Testimonials() {
  if (business.testimonials.length === 0) return null;

  return (
    <section aria-labelledby="anbefalinger" className="bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h2 id="anbefalinger" className="text-3xl font-bold sm:text-4xl">
          Det siger mine kunder
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {business.testimonials.map((item) => (
            <li
              key={item.name}
              className="rounded-card border border-line bg-canvas p-6"
            >
              <blockquote className="text-lg">&bdquo;{item.quote}&ldquo;</blockquote>
              <p className="mt-4 font-semibold">
                {item.name}
                <span className="block font-normal text-ink-soft">{item.area}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
