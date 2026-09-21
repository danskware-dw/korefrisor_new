import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { forParorendeSeo } from "@/content/seo";
import { isPlaceholderPhone } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(
  forParorendeSeo,
  "/for-parorende",
  "/behandlinger/pensionistklip.png",
);

export default async function ForParorendePage() {
  const config = await getConfig();
  const tel = config.phone.replace(/\s/g, "");
  const showPhone = !isPlaceholderPhone(config.phone);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Forside" },
          { label: "For pårørende" },
        ]}
      />

      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{forParorendeSeo.h1}</h1>
      <SeoBody paragraphs={forParorendeSeo.paragraphs} />

      <ul className="mt-8 space-y-3 text-lg">
        <li>• Deres adresse, dit telefonnummer</li>
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
        {showPhone && (
          <a
            href={`tel:${tel}`}
            data-btn
            className="inline-flex items-center rounded-lg border-2 border-brand px-8 py-4 text-xl font-semibold text-brand hover:bg-brand-light"
          >
            Ring {config.phone}
          </a>
        )}
      </div>

      <h2 className="mt-14 text-2xl font-bold">Sådan gør du</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6 text-lg">
        <li>Åbn bookingen og sæt kryds i «Jeg booker for en pårørende».</li>
        <li>Skriv deres adresse — det er dem, jeg kører til.</li>
        <li>Skriv dit navn, telefon og e-mail. Påmindelse dagen før går til din e-mail.</li>
        <li>Vælg faktura, hvis du betaler, eller MobilePay nu — inden jeg kører.</li>
        <li>Vælg fast tid hver 4. eller 6. uge, hvis det skal gentages.</li>
      </ol>

      <FaqList items={forParorendeSeo.faq} heading="Spørgsmål fra pårørende" />

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
        . Vil du give klippet som gave i stedet for at booke dagen?{" "}
        <Link href="/gavekort" className="font-semibold text-brand underline">
          Se gavekort
        </Link>
        .
      </p>
    </div>
  );
}
