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
      <SeoBody paragraphs={plejehjemSeo.paragraphs} />
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
        phone={config.phone}
        maxAdvanceDays={config.maxAdvanceDays}
        home={{
          lat: config.home.lat,
          lon: config.home.lon,
          city: config.home.city,
          postalCode: config.home.postalCode,
        }}
      />
      <FaqList items={plejehjemSeo.faq} />
    </div>
  );
}
