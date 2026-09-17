import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "Book frisør til mor, far eller bedsteforældre",
  description:
    "Pårørende booker ofte hjemmeklip for ældre. Udekørende frisør i Kastrup og Amager — pensionistklip siddende, også i kørestol. Nem booking på vegne af andre.",
  keywords: [
    "frisør til ældre pårørende",
    "book frisør til mor",
    "pensionistklip hjemme",
    "frisør plejehjem",
    "hjemmeklip for pårørende",
    "senior haircut for family",
  ],
  alternates: { canonical: "/for-parorende" },
  openGraph: {
    title: "Book hjemmeklip til en pårørende",
    description:
      "Udekørende frisør til ældre i Kastrup og omegn. Du booker — jeg kører hjem til dem.",
    images: [{ url: "/behandlinger/pensionistklip.png" }],
  },
};

export default async function ForParorendePage() {
  const config = await getConfig();
  const tel = config.phone.replace(/\s/g, "");

  const faq = [
    {
      question: "Kan jeg booke hjemmeklip til min mor eller far?",
      answer:
        "Ja. Sæt kryds i «Jeg booker for en pårørende». Skriv deres adresse og dit telefonnummer. Du kan få faktura, fast tid og e-mail dagen før.",
    },
    {
      question: "Klipper du dem, der ikke kan komme ud?",
      answer:
        "Ja. Pensionistklip har ekstra tid. Jeg klipper gerne siddende — også ved gangbesvær, rollator eller i kørestol.",
    },
    {
      question: "Kommer du på plejehjem?",
      answer: `Ja. Book et plejehjemsbesøg: antal beboere, én kørsel, én faktura og fast ugedag. Eller ring på ${config.phone}.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Forside" },
          { label: "For pårørende" },
        ]}
      />

      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
        Book frisør hjem til en pårørende
      </h1>
      <p className="mt-5 text-xl text-ink-soft">
        Mange af mine aftaler bookes af børn og børnebørn. Du arrangerer tiden —
        jeg kører hjem til dem i {config.home.city}, på Amager, i Tårnby, Dragør
        eller det meste af København.
      </p>

      <ul className="mt-8 space-y-3 text-lg">
        <li>• Deres adresse, dit telefonnummer — jeg ringer til dig</li>
        <li>• Faktura til dig, hvis du betaler</li>
        <li>• Fast tid hver 4., 6. eller 8. uge</li>
        <li>• E-mail dagen før, så ingen glemmer stolen</li>
        <li>• Pensionistklip med ekstra tid, også i kørestol</li>
        <li>• Du ser den låste pris inkl. kørsel, før du bekræfter</li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/book?behandling=pensionistklip&parorende=1"
          data-btn
          className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
        >
          Book til mor eller far
        </Link>
        <a
          href={`tel:${tel}`}
          data-btn
          className="inline-flex items-center rounded-lg border-2 border-brand px-8 py-4 text-xl font-semibold text-brand hover:bg-brand-light"
        >
          Ring {config.phone}
        </a>
      </div>

      <h2 className="mt-14 text-2xl font-bold">Sådan gør du</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6 text-lg">
        <li>Åbn bookingen og sæt kryds i «Jeg booker for en pårørende».</li>
        <li>Skriv deres adresse — det er dem, jeg kører til.</li>
        <li>Skriv dit navn, telefon og e-mail. Påmindelse dagen før går til din e-mail.</li>
        <li>Vælg faktura, hvis du betaler, eller MobilePay nu — inden jeg kører.</li>
        <li>Vælg fast tid hver 4. eller 6. uge, hvis det skal gentages.</li>
      </ol>

      <h2 className="mt-14 text-2xl font-bold">Spørgsmål fra pårørende</h2>
      <div className="mt-6 space-y-3">
        {faq.map((item) => (
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

      <p className="mt-10 text-lg">
        Læs også{" "}
        <Link href="/behandlinger/pensionistklip" className="font-semibold text-brand underline">
          mere om pensionistklip
        </Link>
        ,{" "}
        <Link href="/book/plejehjem" className="font-semibold text-brand underline">
          book plejehjemsbesøg
        </Link>{" "}
        eller se{" "}
        <Link href="/omraade" className="font-semibold text-brand underline">
          hvor jeg kører
        </Link>
        .
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
