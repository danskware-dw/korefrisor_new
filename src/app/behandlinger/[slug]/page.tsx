import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { serviceSeo } from "@/content/seo";
import { formatDkk, formatDuration } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";
import type { Service } from "@/config/types";

type Params = { slug: string };

const addonCopy: Record<
  string,
  { headline: string; lead: string; points: string[]; keywords: string[] }
> = {
  skaegklip: {
    headline: "Skægklip hjemme – tillæg til klippet",
    lead: "Trimning af skæg, når frisøren alligevel er i huset. Bookes sammen med et klip.",
    points: [
      "15 minutter oven i klippet.",
      "Du ser den samlede pris, før du bekræfter.",
      "Betal med MobilePay, når du booker.",
    ],
    keywords: ["skægklip hjemme", "trimme skæg", "hjemmefrisør skæg"],
  },
  pandehaar: {
    headline: "Pandehår hjemme – kort klip",
    lead: "Klip af pandehår hjemme hos dig. Bookes sammen med et klip.",
    points: [
      "Kort tillæg, når jeg alligevel er der.",
      "I betaler kun kørsel én gang.",
    ],
    keywords: ["pandehår klip hjemme", "fringe cut at home"],
  },
  bryn: {
    headline: "Retning af bryn hjemme",
    lead: "Retning af øjenbryn som tillæg til et hjemmeklip.",
    points: [
      "Samme besøg som klippet — ingen ekstra kørsel.",
      "Du ser prisen, før du bekræfter.",
    ],
    keywords: ["retning af bryn hjemme", "øjenbryn frisør"],
  },
  plejehjem: {
    headline: "Frisør på plejehjem og bosted",
    lead: "Flere beboere samme dag, én kørsel, én faktura og fast ugedag. Personalet eller pårørende booker.",
    points: [
      "Pensionistklip med ekstra tid.",
      "Kørsel tælles kun én gang, uanset hvor mange der klippes.",
      "Én faktura til stedet eller pårørende.",
      "Samme ugedag fremover.",
    ],
    keywords: ["frisør plejehjem", "hjemmeklip bosted", "frisør ældrecenter"],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = await getConfig();
  const service = config.services.find((item) => item.id === slug);
  if (!service) return {};
  const seo = serviceSeo[slug];
  if (seo) return pageMetadata(seo, `/behandlinger/${service.id}`, service.image);
  const copy = addonCopy[slug];
  return {
    title: copy?.headline ?? `${service.name} hjemme hos dig`,
    description: copy?.lead ?? service.description,
    keywords: copy?.keywords,
    alternates: { canonical: `/behandlinger/${service.id}` },
    openGraph: {
      title: copy?.headline ?? service.name,
      description: copy?.lead ?? service.description,
      images: [{ url: service.image }],
    },
  };
}

export default async function BehandlingPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const config = await getConfig();
  const service = config.services.find((item) => item.id === slug);
  if (!service) notFound();
  const seo = serviceSeo[slug];
  const copy = addonCopy[slug];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Forside" },
          { href: "/behandlinger", label: "Behandlinger" },
          { label: service.name },
        ]}
      />

      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
        {seo?.h1 ?? copy?.headline ?? service.name}
      </h1>
      {seo ? (
        <SeoBody paragraphs={seo.paragraphs} />
      ) : (
        <p className="mt-5 text-xl text-ink-soft">{copy?.lead ?? service.description}</p>
      )}

      <Image
        src={service.image}
        alt={service.imageAlt}
        width={1024}
        height={768}
        sizes="(min-width: 768px) 42rem, 92vw"
        className="mt-8 aspect-4/3 w-full rounded-card border border-line object-cover"
      />

      <dl className="mt-8 flex flex-wrap gap-8 border-y border-line py-6">
        <div>
          <dt className="text-ink-soft">Pris</dt>
          <dd className="text-2xl font-bold tabular-nums">
            {service.contactOnly ? "Efter aftale" : formatDkk(service.price)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-soft">Varighed</dt>
          <dd className="text-2xl font-bold">{formatDuration(service.durationMinutes)}</dd>
        </div>
      </dl>

      {(seo?.points ?? copy?.points)?.length ? (
        <ul className="mt-8 space-y-3 text-lg">
          {(seo?.points ?? copy?.points ?? []).map((point) => (
            <li key={point}>• {point}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-8 text-lg text-ink-soft">
        Oven i prisen kommer kørselstillæg efter afstanden fra {config.home.city}. De
        første {config.travel.freeRadiusKm} km er gratis. Du ser det samlede beløb, før
        du bekræfter.
      </p>

      {seo && <FaqList items={seo.faq} />}

      <ServiceJsonLd service={service} siteUrl={config.siteUrl} />

      <p className="mt-12">
        {service.contactOnly ? (
          <Link
            href="/book/plejehjem"
            data-btn
            className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
          >
            Book plejehjemsbesøg
          </Link>
        ) : (
          <Link
            href={`/book?behandling=${service.id}`}
            data-btn
            className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
          >
            Book {service.name.toLowerCase()}
          </Link>
        )}
      </p>
    </div>
  );
}

function ServiceJsonLd({ service, siteUrl }: { service: Service; siteUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    serviceType: "Haircut",
    provider: { "@type": "HairSalon", name: "Kørefrisøren", url: siteUrl },
    areaServed: "Kastrup",
    ...(service.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: service.price,
            priceCurrency: "DKK",
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
