import type { Metadata } from "next";
import { CareHomeForm } from "@/components/CareHomeForm";
import { getConfig } from "@/lib/runtime-config";
import { CARE_HOME_MAX_RESIDENTS, formatDkk } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Book frisør til plejehjem og bosted",
  description:
    "Flere beboere samme dag, én kørsel og én faktura. Fast ugedag. Udekørende frisør til plejehjem i Kastrup og omegn.",
  alternates: { canonical: "/book/plejehjem" },
};

export default async function PlejehjemBookPage() {
  const config = await getConfig();
  const pensionist = config.services.find((service) => service.id === "pensionistklip");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Book plejehjemsbesøg</h1>
      <p className="mt-5 text-xl text-ink-soft">
        N beboere, én kørsel, én faktura, samme ugedag. Pensionistklip
        {pensionist ? ` à ${formatDkk(pensionist.price)}` : ""} pr. beboer, rabat fra person 2.
        Op til {CARE_HOME_MAX_RESIDENTS} samme dag. Menuen er kort — ikke 15 sider med
        balayage.
      </p>
      <p className="mt-4 text-lg">
        Personale og pårørende booker her, eller ring på{" "}
        <a href={`tel:${config.phone.replace(/\s/g, "")}`} className="font-semibold text-brand underline">
          {config.phone}
        </a>
        .
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
    </div>
  );
}
