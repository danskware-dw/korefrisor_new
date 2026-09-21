import type { Metadata } from "next";
import Link from "next/link";
import { CareHomeForm } from "@/components/CareHomeForm";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { plejehjemSeo } from "@/content/seo";
import { isPlaceholderPhone } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";
import { CARE_HOME_MAX_RESIDENTS } from "@/lib/pricing";

export const metadata: Metadata = pageMetadata(plejehjemSeo, "/book/plejehjem");

export default async function PlejehjemBookPage() {
  const config = await getConfig();
  const showPhone = !isPlaceholderPhone(config.phone);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">{plejehjemSeo.h1}</h1>

      <div className="mt-8 rounded-[1.5rem] border border-line bg-surface p-6">
        <p className="font-semibold text-accent">Til aktivitetsteam og leder</p>
        <h2 className="mt-2 text-2xl font-bold">Fast ugedag — ét besøg, én faktura</h2>
        <ul className="mt-4 space-y-2 text-lg text-ink-soft">
          <li>Flere beboere samme formiddag (op til {CARE_HOME_MAX_RESIDENTS}).</li>
          <li>Kørsel tælles kun én gang. Én samlet faktura til huset eller pårørende.</li>
          <li>Pensionistklip 325 kr som udgangspunkt. 50 kr rabat pr. ekstra person.</li>
          <li>Jeg klipper gerne siddende, også i kørestol, i fællesrum eller på stuen.</li>
        </ul>
        <p className="mt-4 text-lg font-semibold">
          Start med et pilotbesøg en formiddag, så I kan se tempo og kvalitet.
        </p>
        {showPhone ? (
          <p className="mt-4 text-lg">
            Ring{" "}
            <a
              href={`tel:${config.phone.replace(/\s/g, "")}`}
              className="font-semibold text-brand underline"
            >
              {config.phone}
            </a>{" "}
            eller udfyld formularen nedenunder.
          </p>
        ) : null}
      </div>

      <SeoBody paragraphs={plejehjemSeo.paragraphs.slice(1)} />
      <p className="mt-4 text-lg">
        Op til {CARE_HOME_MAX_RESIDENTS} beboere samme dag.{" "}
        <Link href="/book" className="font-semibold text-brand underline">
          Ét klip i et privat hjem booker du her
        </Link>
        .
        {showPhone ? (
          <>
            {" "}
            Eller ring på{" "}
            <a
              href={`tel:${config.phone.replace(/\s/g, "")}`}
              className="font-semibold text-brand underline"
            >
              {config.phone}
            </a>
            .
          </>
        ) : null}
      </p>
      <hr className="my-10 border-line" />
      <CareHomeForm
        employees={config.employees.filter((employee) => employee.active)}
        services={config.services}
        phone={config.phone}
        maxAdvanceDays={config.maxAdvanceDays}
        home={{
          lat: config.home.lat,
          lon: config.home.lon,
          city: config.home.city,
          postalCode: config.home.postalCode,
        }}
        travel={config.travel}
        areaNames={config.areas.map((area) => area.name)}
      />
      <FaqList items={plejehjemSeo.faq} />
    </div>
  );
}
