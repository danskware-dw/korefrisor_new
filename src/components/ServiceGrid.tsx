import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/config/types";
import { isPlaceholderPhone } from "@/lib/placeholders";
import { formatDkk, formatDuration } from "@/lib/pricing";

/** Behandlinger vist som kort med foto — bruges på forsiden og under Priser. */
export function ServiceGrid({
  services,
  phone,
}: {
  services: readonly Service[];
  phone: string;
}) {
  const primary = services.filter((service) => !service.addon && !service.contactOnly);
  const addons = services.filter((service) => service.addon);
  const contact = services.filter((service) => service.contactOnly);

  return (
    <div className="space-y-10">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {primary.map((service) => (
          <li key={service.id}>
            <ServiceCard service={service} phone={phone} />
          </li>
        ))}
      </ul>
      {addons.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold">Tillæg til klippet</h3>
          <p className="mt-2 text-ink-soft">
            Vælges sammen med et klip. I betaler kun kørsel én gang.
          </p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {addons.map((service) => (
              <li key={service.id}>
                <ServiceCard service={service} phone={phone} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {contact.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contact.map((service) => (
            <li key={service.id}>
              <ServiceCard service={service} phone={phone} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ServiceCard({ service, phone }: { service: Service; phone: string }) {
  const contactOnly = Boolean(service.contactOnly);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface">
      <Image
        src={service.image}
        alt={service.imageAlt}
        width={1024}
        height={768}
        sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw"
        className="aspect-4/3 w-full object-cover"
      />

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-xl font-bold">{service.name}</h3>
        <p className="flex-1 text-ink-soft">{service.description}</p>

        <dl className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <div>
            <dt className="sr-only">Pris</dt>
            <dd className="text-2xl font-bold tabular-nums">
              {contactOnly ? "Efter aftale" : formatDkk(service.price)}
            </dd>
          </div>
          <div className="text-right">
            <dt className="sr-only">Varighed</dt>
            <dd className="text-ink-soft">{formatDuration(service.durationMinutes)}</dd>
          </div>
        </dl>

        {contactOnly ? (
          <>
            <Link
              href="/book/plejehjem"
              data-btn
              className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark"
            >
              Book plejehjemsbesøg
            </Link>
            {!isPlaceholderPhone(phone) && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="text-center font-semibold text-brand underline"
              >
                Eller ring {phone}
              </a>
            )}
          </>
        ) : (
          <Link
            href={`/book?behandling=${service.id}`}
            data-btn
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark"
          >
            Book {service.addon ? "som tillæg" : service.name.toLowerCase()}
          </Link>
        )}
      </div>
    </article>
  );
}
