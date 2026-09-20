import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { business } from "@/config/business";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { ServiceGrid } from "@/components/ServiceGrid";
import { areaSeo } from "@/content/seo";
import { formatDkk } from "@/lib/pricing";
import { isPlaceholderPhone } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

type Params = { omraade: string };

function areaFrom(slug: string) {
  return business.areas.find((a) => a.slug === slug);
}

export function generateStaticParams(): Params[] {
  return business.areas.map((area) => ({ omraade: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const area = areaFrom((await params).omraade);
  if (!area) return {};
  const seo = areaSeo[area.slug];
  if (!seo) return {};
  return pageMetadata(seo, `/frisor/${area.slug}`);
}

export default async function AreaPage({ params }: { params: Promise<Params> }) {
  const area = areaFrom((await params).omraade);
  if (!area) notFound();
  const seo = areaSeo[area.slug];
  if (!seo) notFound();
  const config = await getConfig();
  const bookable = config.services.filter((s) => !s.contactOnly);
  const showPhone = !isPlaceholderPhone(config.phone);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Mobil frisør / hjemmeklip i ${area.name}`,
    serviceType: "Mobile hairdresser",
    provider: {
      "@type": "HairSalon",
      name: config.name,
      url: config.siteUrl,
      ...(showPhone ? { telephone: config.phone } : {}),
    },
    areaServed: {
      "@type": "City",
      name: area.name,
      postalCode: area.postalCodes.join(", "),
    },
    description: seo.description,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Forside" },
          { href: "/omraade", label: "Hvor jeg kører" },
          { label: area.name },
        ]}
      />

      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{seo.h1}</h1>
      <SeoBody paragraphs={seo.paragraphs} />

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/book"
          data-btn
          className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
        >
          Book hjemmeklip i {area.name}
        </Link>
        {showPhone && (
          <a
            href={`tel:${config.phone.replace(/\s/g, "")}`}
            data-btn
            className="inline-flex items-center rounded-lg border-2 border-brand px-8 py-4 text-xl font-semibold text-brand hover:bg-brand-light"
          >
            Ring {config.phone}
          </a>
        )}
      </div>

      <h2 className="mt-12 text-2xl font-bold">Priser på hjemmeklip i {area.name}</h2>
      <ul className="mt-4 space-y-2 text-lg">
        {bookable.map((service) => (
          <li key={service.id}>
            <Link href={`/behandlinger/${service.id}`} className="font-semibold text-brand underline">
              {service.name}
            </Link>
            : {formatDkk(service.price)} · {service.durationMinutes} min. + kørsel
            efter afstand
          </li>
        ))}
      </ul>
      <p className="mt-3 text-ink-soft">
        De første {config.travel.freeRadiusKm} km fra {config.home.city} er uden
        kørselstillæg. Den samlede pris ser du i bookingen, før du bekræfter.
      </p>

      <h2 className="mt-12 text-2xl font-bold">Det klipper jeg i {area.name}</h2>
      <div className="mt-8">
        <ServiceGrid services={config.services} phone={config.phone} />
      </div>

      <h2 className="mt-12 text-2xl font-bold">Plejehjem og bosteder i {area.name}</h2>
      <p className="mt-4 text-lg">
        Jeg kommer gerne på plejehjem, bosteder og i ældreboliger. I booker antal
        beboere — én kørsel, én faktura, samme ugedag.{" "}
        <Link href="/book/plejehjem" className="font-semibold text-brand underline">
          Book plejehjemsbesøg
        </Link>
        .
      </p>

      <FaqList items={seo.faq} heading={`Spørgsmål om frisør i ${area.name}`} />

      <p className="mt-12">
        <Link href="/omraade" className="text-lg font-semibold text-brand underline">
          Se alle de områder, jeg kører til
        </Link>
        {" · "}
        <Link href="/for-parorende" className="text-lg font-semibold text-brand underline">
          Book til en pårørende
        </Link>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </div>
  );
}
