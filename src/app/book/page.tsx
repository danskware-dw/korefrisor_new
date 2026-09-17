import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { bookableServicesOf, getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "Book hjemmeklip hos din udekørende frisør",
  description:
    "Book klip, pensionistklip eller børneklip hjemme hos dig i Kastrup og omegn. Skriv din adresse og se den samlede pris inkl. kørsel med det samme.",
  alternates: { canonical: "/book" },
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ behandling?: string; parorende?: string }>;
}) {
  const config = await getConfig();
  const services = bookableServicesOf(config);
  const { behandling, parorende } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Book en tid</h1>
      <p className="mt-5 text-xl text-ink-soft">
        Et trin ad gangen. Vælg behandling, så hvem der skal komme. Skriv adressen, se
        den låste pris inkl. kørsel, og vælg tid på samme trin. Du betaler med
        MobilePay, når du booker. Pårørende kan booke med deres telefon og få faktura.
        Afbud mindst 24 timer før er gratis; senere koster det 100 kr.
      </p>
      <p className="mt-4 text-lg">
        Vil du hellere booke over telefonen, så ring til mig på{" "}
        <a
          href={`tel:${config.phone.replace(/\s/g, "")}`}
          className="font-semibold text-brand underline"
        >
          {config.phone}
        </a>
        . Det er helt i orden.
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
        initialServiceId={behandling}
        initialForRelative={parorende === "1"}
      />
    </div>
  );
}
