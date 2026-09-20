import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { TravelFeeTable } from "@/components/PriceTable";
import { SeoBody } from "@/components/SeoBody";
import { ServiceAreaMap } from "@/components/map/TravelMap";
import { omraadeSeo } from "@/content/seo";
import { formatDkk } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(omraadeSeo, "/omraade");

export default async function OmraadePage() {
  const config = await getConfig();
  const { home, travel } = config;

  const rings = [
    { radiusKm: travel.freeRadiusKm, label: `${travel.freeRadiusKm} km — gratis kørsel` },
    ...travel.zones.map((zone) => ({
      radiusKm: zone.maxKm,
      label: `${zone.maxKm} km — ${formatDkk(zone.fee)}`,
    })),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">{omraadeSeo.h1}</h1>
      <SeoBody paragraphs={omraadeSeo.paragraphs} />

      <div className="mt-8">
        <ServiceAreaMap home={home} rings={rings} />
        <p className="mt-3 text-ink-soft">
          Den blå nål viser, hvor jeg kører ud fra. Ringene er mine zoner — den inderste er
          gratis kørsel.
        </p>
      </div>

      <h2 className="mt-14 text-2xl font-bold">Zoner og kørselstillæg</h2>
      <div className="mt-5 overflow-hidden rounded-card border border-line bg-surface p-6">
        <TravelFeeTable travel={travel} city={home.city} />
      </div>
      <p className="mt-5 text-lg">
        Du behøver ikke selv regne noget ud.{" "}
        <Link href="/book" className="font-semibold text-brand underline">
          Skriv din adresse i bookingen
        </Link>
        , så viser kortet ruten hjem til dig og lægger det rigtige tillæg til prisen.
      </p>

      <h2 className="mt-14 text-2xl font-bold">Områder jeg kommer i</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {config.areas.map((area) => (
          <li key={area.slug}>
            <Link
              href={`/frisor/${area.slug}`}
              className="flex min-h-14 items-center gap-3 rounded-card border border-line bg-surface px-5 font-semibold hover:border-brand"
            >
              Frisør i {area.name}
              <span className="ml-auto font-normal text-ink-soft tabular-nums">
                {area.postalCodes.join(", ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl font-bold">Bor du længere væk?</h2>
      <p className="mt-4 text-lg">
        Radius er {travel.maxServiceRadiusKm} km fra {home.city}. Start bookingen med
        adressen — den viser, om jeg kommer. Er I flere på samme adresse, betaler I kun
        kørsel én gang.
      </p>

      <FaqList items={omraadeSeo.faq} />

      <p className="mt-12">
        <Link
          href="/book"
          data-btn
          className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
        >
          Book en tid
        </Link>
      </p>
    </div>
  );
}
