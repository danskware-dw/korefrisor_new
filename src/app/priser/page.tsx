import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { TravelFeeTable } from "@/components/PriceTable";
import { SeoBody } from "@/components/SeoBody";
import { ServiceGrid } from "@/components/ServiceGrid";
import { priserSeo } from "@/content/seo";
import { FAMILY_EXTRA_PERSON_DISCOUNT_KR, formatDkk } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(priserSeo, "/priser");

export default async function PriserPage() {
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">{priserSeo.h1}</h1>
      <SeoBody paragraphs={priserSeo.paragraphs} />

      <div className="mt-12">
        <ServiceGrid services={config.services} phone={config.phone} />
      </div>

      <h2 className="mt-16 text-2xl font-bold sm:text-3xl">Kørselstillæg</h2>
      <p className="mt-3 text-ink-soft">
        Afstanden regnes fra min adresse i {config.home.city} til din.
      </p>
      <div className="mt-5 max-w-2xl rounded-card border border-line bg-surface p-6">
        <TravelFeeTable travel={config.travel} city={config.home.city} />
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold">Betaling</h2>
          <p className="mt-3 text-lg">
            Du betaler med MobilePay, når du booker. Pårørende kan få faktura. Afbud mindst{" "}
            {config.cancelFreeHours} timer før er gratis; senere er gebyret{" "}
            {config.lateCancelFeeKr} kr.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Flere i samme husstand</h2>
          <p className="mt-3 text-lg">
            Skal flere klippes på samme adresse, betaler I kun kørsel én gang — plus{" "}
            {formatDkk(FAMILY_EXTRA_PERSON_DISCOUNT_KR)} rabat pr. ekstra person.
          </p>
        </section>
      </div>

      <FaqList items={priserSeo.faq} />

      <p className="mt-14">
        <Link
          href="/book"
          data-btn
          className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
        >
          Se din egen pris og book
        </Link>
      </p>
    </div>
  );
}
