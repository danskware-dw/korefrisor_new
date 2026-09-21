import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { bookSeo } from "@/content/seo";
import { isPlaceholderPhone } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { bookableServicesOf, getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(bookSeo, "/book");

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ behandling?: string; parorende?: string; adresse?: string }>;
}) {
  const config = await getConfig();
  const services = bookableServicesOf(config);
  const { behandling, parorende, adresse } = await searchParams;
  const showPhone = !isPlaceholderPhone(config.phone);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">{bookSeo.h1}</h1>
      <SeoBody paragraphs={bookSeo.paragraphs.slice(0, 3)} />
      {showPhone && (
        <p className="mt-4 text-lg">
          Vil du hellere booke over telefonen, så ring til mig på{" "}
          <a
            href={`tel:${config.phone.replace(/\s/g, "")}`}
            className="font-semibold text-brand underline"
          >
            {config.phone}
          </a>
          .
        </p>
      )}
      <p className="mt-4 text-lg">
        Plejehjem og bosteder:{" "}
        <Link href="/book/plejehjem" className="font-semibold text-brand underline">
          book et fælles besøg
        </Link>
        .
      </p>

      <hr className="my-10 border-line" />

      <BookingForm
        services={services}
        employees={config.employees.filter((employee) => employee.active)}
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
        initialServiceId={behandling}
        initialForRelative={parorende === "1"}
        initialAddressQuery={adresse?.trim() ?? ""}
      />

      <FaqList items={bookSeo.faq} />
    </div>
  );
}
