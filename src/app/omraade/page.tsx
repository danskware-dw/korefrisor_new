import type { Metadata } from "next";
import Link from "next/link";
import { TravelFeeTable } from "@/components/PriceTable";
import { ServiceAreaMap } from "@/components/map/TravelMap";
import { formatDkk } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "Hvor jeg kører hen – hjemmeklip i Kastrup og København",
  description:
    "Udekørende frisør fra Kastrup. Hjemmeklip i Tårnby, Dragør, Amager og det meste af København. Se kortet over mit område og kørselstillægget.",
  alternates: { canonical: "/omraade" },
};

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
      <h1 className="text-4xl font-bold sm:text-5xl">Hvor jeg kører hen</h1>
      <p className="mt-5 text-xl text-ink-soft">
        Jeg kører ud fra {home.postalCode} {home.city} og op til {travel.maxServiceRadiusKm}{" "}
        km derfra. De første {travel.freeRadiusKm} km er uden kørselstillæg.
      </p>

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
        Ring alligevel på{" "}
        <a
          href={`tel:${config.phone.replace(/\s/g, "")}`}
          className="font-semibold text-brand underline"
        >
          {config.phone}
        </a>
        . Er jeg i forvejen i nærheden på en anden opgave, kan jeg ofte lægge et besøg ind.
        Det samme gælder, hvis I er flere på samme adresse — så betaler I kun kørsel én gang.
      </p>
    </div>
  );
}
