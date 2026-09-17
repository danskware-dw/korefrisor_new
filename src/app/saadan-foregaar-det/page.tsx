import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getConfig } from "@/lib/runtime-config";
import { visitPrepChecklist } from "@/lib/visit-prep";

export const metadata: Metadata = {
  title: "Sådan foregår et hjemmeklip – trin for trin",
  description:
    "Sådan booker og får du hjemmeklip: vælg behandling, skriv adresse, se prisen inkl. kørsel, og få den udekørende frisør hjem til dig i Kastrup og omegn.",
  keywords: [
    "sådan booker hjemmeklip",
    "udekørende frisør hvordan",
    "mobil frisør hjemme",
    "hvad skal jeg have klar frisør hjemme",
  ],
  alternates: { canonical: "/saadan-foregaar-det" },
  openGraph: {
    title: "Sådan foregår et hjemmeklip",
    description: "Fra booking til betaling — hele forløbet når frisøren kommer hjem til dig.",
    images: [{ url: "/behandlinger/hjemmebesoeg.png" }],
  },
};

const steps = [
  {
    name: "Book behandling og adresse",
    text: "Vælg klip, pensionistklip eller børneklip, og skriv din adresse. Du ser den samlede pris inklusive kørsel, før du bekræfter.",
  },
  {
    name: "Vælg dag og tid",
    text: "Kun ledige tider kan vælges. Du skal booke mindst et døgn i forvejen online — ring, hvis det haster.",
  },
  {
    name: "Bekræft og betal",
    text: "Du betaler med MobilePay, når du booker. Pårørende kan få faktura. Tiden bekræftes, når beløbet er sendt — inden jeg kører. Afbud mindst 24 timer før er gratis — ellers 100 kr.",
  },
  {
    name: "Frisøren kommer hjem til dig",
    text: "Jeg medbringer sakse, maskine, kappe og tæppe. Du skal kun have en stol klar. Jeg fejer op bagefter.",
  },
];

export default async function SaadanPage() {
  const config = await getConfig();

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Sådan får du hjemmeklip hos en udekørende frisør",
    description:
      "Trin for trin: book hjemmeklip online, betal med MobilePay, og få frisøren hjem til dig i Kastrup eller omegn.",
    totalTime: "PT60M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "DKK",
      value: "225-350",
    },
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${config.siteUrl}/saadan-foregaar-det#trin-${index + 1}`,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Forside" },
          { label: "Sådan foregår det" },
        ]}
      />

      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Sådan foregår et hjemmeklip</h1>
      <p className="mt-5 text-xl text-ink-soft">
        Mange spørger, om det bliver rodet, eller om de skal gøre noget særligt
        klar. Det skal du ikke. Her er hele forløbet, fra du booker, til jeg
        kører igen.
      </p>

      <ol className="mt-10 space-y-6">
        {steps.map((step, index) => (
          <li
            key={step.name}
            id={`trin-${index + 1}`}
            className="rounded-card border border-line bg-surface p-6"
          >
            <p className="font-semibold text-brand">Trin {index + 1}</p>
            <h2 className="mt-1 text-2xl font-bold">{step.name}</h2>
            <p className="mt-2 text-lg text-ink-soft">{step.text}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Det tager jeg med</h2>
      <ul className="mt-4 space-y-2 text-lg">
        <li>• Sakse, kamme og klippemaskine — alt rengjort og desinficeret</li>
        <li>• Klippekappe og et tæppe, jeg lægger på gulvet</li>
        <li>• En lille kost og fejebakke</li>
        <li>• Et spejl, så du kan se resultatet fra alle sider</li>
      </ul>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Det skal du have klar</h2>
      <ul className="mt-4 space-y-2 text-lg">
        {visitPrepChecklist.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <p className="mt-4 text-lg text-ink-soft">
        Sidder du i kørestol eller har svært ved at rejse dig, klipper jeg dig,
        hvor du sidder. Det er helt almindeligt for mig, så du skal ikke være
        bekymret for at spørge. Børn klippes i det tempo, der passer barnet.
      </p>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Hvor lang tid tager det?</h2>
      <p className="mt-4 text-lg">
        En klipning tager typisk 30–50 minutter, inklusive at jeg stiller op og
        rydder op igen. Pensionistklip har ekstra tid. Den afsatte tid står ved
        hver behandling, når du booker, så du ved, hvor lang tid jeg er hos dig.
      </p>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Rengøring bagefter</h2>
      <p className="mt-4 text-lg">
        Jeg fejer op og tager hårene med mig. Der skal ikke støvsuges efter mig.
      </p>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Betaling</h2>
      <p className="mt-4 text-lg">
        Du betaler med MobilePay, når du booker — til <strong>{config.mobilePay}</strong>.
        Pårørende kan få faktura. Prisen er den, du fik oplyst i bookingen.
      </p>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Hvis du må aflyse</h2>
      <p className="mt-4 text-lg">
        Mindst {config.cancelFreeHours} timer før: du betaler intet. Senere: gebyr{" "}
        {config.lateCancelFeeKr} kr. Du får et afbuds-link i din bekræftelse.
      </p>

      <p className="mt-12">
        <Link
          href="/book"
          data-btn
          className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
        >
          Book et hjemmeklip
        </Link>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
    </div>
  );
}
