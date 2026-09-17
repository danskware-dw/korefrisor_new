import { FAMILY_EXTRA_PERSON_DISCOUNT_KR, formatDkk, formatDuration, type Quote } from "@/lib/pricing";

export function QuoteBreakdown({
  quote,
  employeeName,
}: {
  quote: Quote;
  employeeName?: string;
}) {
  const sameCut =
    quote.services.length > 1 &&
    quote.services.every((service) => service.id === quote.services[0].id);

  return (
    <dl className="space-y-3 text-lg">
      {sameCut ? (
        <div className="flex justify-between gap-4">
          <dt>
            {quote.services.length} × {quote.services[0].name}
          </dt>
          <dd className="tabular-nums">{formatDkk(quote.servicesTotal)}</dd>
        </div>
      ) : (
        quote.services.map((service, index) => (
          <div key={`${service.id}-${index}`} className="flex justify-between gap-4">
            <dt>{service.name}</dt>
            <dd className="tabular-nums">{formatDkk(service.price)}</dd>
          </div>
        ))
      )}
      {quote.familyDiscount > 0 && (
        <div className="flex justify-between gap-4">
          <dt>
            Flere samme besøg
            <span className="block text-base text-ink-soft">
              {formatDkk(FAMILY_EXTRA_PERSON_DISCOUNT_KR)} rabat pr. ekstra person
            </span>
          </dt>
          <dd className="font-semibold tabular-nums text-accent">
            −{formatDkk(quote.familyDiscount)}
          </dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt>
          Kørsel
          <span className="block text-base text-ink-soft">
            {quote.travelZoneLabel}
            {quote.peopleCount > 1 ? " · kun én gang" : ""}
            {employeeName ? ` · fra ${employeeName}` : ""}
          </span>
        </dt>
        <dd className="tabular-nums">
          {quote.travelFee === 0 ? (
            <span className="font-semibold text-accent">Gratis</span>
          ) : (
            formatDkk(quote.travelFee)
          )}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-t-2 border-ink pt-3 text-2xl font-bold">
        <dt>I alt</dt>
        <dd className="tabular-nums">{formatDkk(quote.total)}</dd>
      </div>
      <p className="text-base text-ink-soft">
        Afsat tid: {formatDuration(quote.durationMinutes)} Prisen er låst, før du bekræfter.
      </p>
    </dl>
  );
}
