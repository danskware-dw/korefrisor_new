import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { business } from "@/config/business";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceGrid } from "@/components/ServiceGrid";
import { formatDkk } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";

/**
 * Lokal landingsside — samme mønster som stærke konkurrenter:
 * "Mobil frisør Amager", "Hjemmeklip Tårnby" i titel + første afsnit.
 */

type Params = { omraade: string };

function areaFrom(slug: string) {
  return business.areas.find((a) => a.slug === slug);
}

export function generateStaticParams(): Params[] {
  return business.areas.map((area) => ({ omraade: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const area = areaFrom((await params).omraade);
  if (!area) return {};

  return {
    title: `Mobil frisør ${area.name} – hjemmeklip og udekørende frisør`,
    description: `Mobil frisør og hjemmeklip i ${area.name} (${area.postalCodes.join(", ")}). Udekørende frisør til klip, pensionistklip og børneklip i dit eget hjem. Book tid eller ring.`,
    keywords: [
      `mobil frisør ${area.name}`,
      `hjemmeklip ${area.name}`,
      `udekørende frisør ${area.name}`,
      `hjemmefrisør ${area.name}`,
      `pensionistklip ${area.name}`,
      `børneklip ${area.name}`,
      `frisør der kommer hjem ${area.name}`,
    ],
    alternates: { canonical: `/frisor/${area.slug}` },
    openGraph: {
      title: `Mobil frisør ${area.name} – hjemmeklip`,
      description: `Udekørende frisør i ${area.name}. Klip hjemme hos dig — også til pensionister og børn.`,
      images: [{ url: "/behandlinger/hjemmebesoeg.png" }],
    },
  };
}

export default async function AreaPage({ params }: { params: Promise<Params> }) {
  const area = areaFrom((await params).omraade);
  if (!area) notFound();
  const config = await getConfig();
  const bookable = config.services.filter((s) => !s.contactOnly);

  const localFaq = [
    {
      question: `Kommer du som mobil frisør til ${area.name}?`,
      answer: `Ja. Jeg er udekørende frisør og kører hjem til dig i ${area.name} (${area.postalCodes.join(", ")}). Du får hjemmeklip i din egen stue — klip, pensionistklip eller børneklip.`,
    },
    {
      question: `Hvad koster hjemmeklip i ${area.name}?`,
      answer: `Behandlingerne koster ${bookable.map((s) => `${s.name.toLowerCase()} fra ${formatDkk(s.price)}`).join(", ")}. Oven i kommer kørselstillæg efter afstanden fra ${config.home.city}. De første ${config.travel.freeRadiusKm} km er gratis. Du ser den samlede pris, før du bekræfter.`,
    },
    {
      question: `Kan pårørende booke frisør hjem til en i ${area.name}?`,
      answer: `Ja, det er meget almindeligt. Book online med adressen i ${area.name}, eller ring på ${config.phone}. Jeg klipper gerne ældre siddende, også i kørestol.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: localFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Mobil frisør / hjemmeklip i ${area.name}`,
    serviceType: "Mobile hairdresser",
    provider: {
      "@type": "HairSalon",
      name: config.name,
      telephone: config.phone,
      url: config.siteUrl,
    },
    areaServed: {
      "@type": "City",
      name: area.name,
      postalCode: area.postalCodes.join(", "),
    },
    description: `Udekørende frisør i ${area.name}. Hjemmeklip, pensionistklip og børneklip i kundens eget hjem.`,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Forside" },
          { href: "/omraade", label: "Hvor jeg kører" },
          { label: area.name },
        ]}
      />

      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
        Mobil frisør {area.name} – hjemmeklip hos dig
      </h1>
      <p className="mt-4 text-xl text-ink-soft">
        Mobil frisør / hjemmeklip i {area.name} betyder, at frisøren kommer til din
        adresse (postnr. {area.postalCodes.join(" og ")}) med sakse og maskine. Hos{" "}
        {config.name} booker du klip, pensionistklip eller børneklip online — uden
        salonbesøg, med pris inkl. kørsel før bekræftelse.
      </p>
      <p className="mt-4 text-lg text-ink-soft">
        Jeg kører ud fra {config.home.city}. Book på få minutter, eller ring hvis du
        hellere vil aftale over telefonen.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/book"
          data-btn
          className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
        >
          Book hjemmeklip i {area.name}
        </Link>
        <a
          href={`tel:${config.phone.replace(/\s/g, "")}`}
          data-btn
          className="inline-flex items-center rounded-lg border-2 border-brand px-8 py-4 text-xl font-semibold text-brand hover:bg-brand-light"
        >
          Ring {config.phone}
        </a>
      </div>

      <h2 className="mt-12 text-2xl font-bold">
        Hvorfor vælge en udekørende frisør i {area.name}?
      </h2>
      <p className="mt-4 text-lg">
        Jeg kører ud fra {config.home.city}, så {area.name} ligger tæt på. Det
        betyder kort kørsel, ofte lavt kørselstillæg, og at jeg oftere kan komme
        med kort varsel end en frisør der kører lang vej. Jeg klipper især
        ældre, børn og dem, for hvem turen til salonen er blevet besværlig —
        men alle er velkomne.
      </p>

      <h2 className="mt-12 text-2xl font-bold">Priser på hjemmeklip i {area.name}</h2>
      <ul className="mt-4 space-y-2 text-lg">
        {bookable.map((service) => (
          <li key={service.id}>
            <Link href={`/behandlinger/${service.id}`} className="font-semibold text-brand underline">
              {service.name}
            </Link>
            : {formatDkk(service.price)} · {service.durationMinutes} min. + kørsel
            efter afstand
          </li>
        ))}
      </ul>
      <p className="mt-3 text-ink-soft">
        De første {config.travel.freeRadiusKm} km fra {config.home.city} er uden
        kørselstillæg. Den samlede pris ser du i bookingen, før du bekræfter.
      </p>

      <h2 className="mt-12 text-2xl font-bold">Det klipper jeg i {area.name}</h2>
      <div className="mt-8">
        <ServiceGrid services={config.services} phone={config.phone} />
      </div>

      <h2 className="mt-12 text-2xl font-bold">Plejehjem og bosteder i {area.name}</h2>
      <p className="mt-4 text-lg">
        Jeg kommer gerne på plejehjem, bosteder og i ældreboliger. I booker antal
        beboere — én kørsel, én faktura, samme ugedag.{" "}
        <Link href="/book/plejehjem" className="font-semibold text-brand underline">
          Book plejehjemsbesøg
        </Link>
        , eller ring på{" "}
        <a
          href={`tel:${config.phone.replace(/\s/g, "")}`}
          className="font-semibold text-brand underline"
        >
          {config.phone}
        </a>
        .
      </p>

      <h2 className="mt-12 text-2xl font-bold">Spørgsmål om frisør i {area.name}</h2>
      <div className="mt-6 space-y-3">
        {localFaq.map((item) => (
          <details
            key={item.question}
            className="group rounded-card border border-line bg-surface open:border-brand"
          >
            <summary className="flex min-h-14 cursor-pointer items-center gap-4 px-6 py-4 text-lg font-semibold hover:text-brand">
              <span className="flex-1">{item.question}</span>
            </summary>
            <p className="border-t border-line px-6 py-4 text-ink-soft">{item.answer}</p>
          </details>
        ))}
      </div>

      <p className="mt-12">
        <Link href="/omraade" className="text-lg font-semibold text-brand underline">
          Se alle de områder, jeg kører til
        </Link>
        {" · "}
        <Link href="/for-parorende" className="text-lg font-semibold text-brand underline">
          Book til en pårørende
        </Link>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </div>
  );
}
