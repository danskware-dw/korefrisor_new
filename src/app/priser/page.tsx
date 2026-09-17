import type { Metadata } from "next";
import Link from "next/link";
import { TravelFeeTable } from "@/components/PriceTable";
import { ServiceGrid } from "@/components/ServiceGrid";
import { FAMILY_EXTRA_PERSON_DISCOUNT_KR, formatDkk } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "Priser på hjemmeklip, pensionistklip og børneklip",
  description:
    "Se priser på klip, pensionistklip og børneklip hos en udekørende frisør i Kastrup. Kørsel er gratis inden for 5 km. Betal med MobilePay, når du booker.",
  alternates: { canonical: "/priser" },
};

export default async function PriserPage() {
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Priser</h1>
      <p className="mt-5 max-w-2xl text-xl text-ink-soft">
        Jeg laver klip, pensionistklip og børneklip hjemme hos dig. Prisen er den samme
        som i en salon. Oven i kommer et kørselstillæg efter afstanden — og du får den
        samlede pris at vide, inden du bekræfter din booking.
      </p>

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
            Du betaler med MobilePay, når du booker — til{" "}
            <strong>{config.mobilePay}</strong>. Pårørende kan få faktura. Afbud mindst{" "}
            {config.cancelFreeHours} timer før er gratis; senere er gebyret{" "}
            {config.lateCancelFeeKr} kr.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Flere i samme husstand</h2>
          <p className="mt-3 text-lg">
            Skal flere klippes på samme adresse, betaler I kun kørsel én gang — plus{" "}
            {formatDkk(FAMILY_EXTRA_PERSON_DISCOUNT_KR)} rabat pr. ekstra person. Så
            sammenligner I ikke kun 350 kr. med salonens 200 kr.: I betaler én tur, ser
            den låste total, og får rabat fra person 2.
          </p>
        </section>
      </div>

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
