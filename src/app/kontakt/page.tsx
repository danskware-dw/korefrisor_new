import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { kontaktSeo } from "@/content/seo";
import { isPlaceholderEmail, isPlaceholderPhone } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(kontaktSeo, "/kontakt");

export default async function KontaktPage() {
  const config = await getConfig();
  const showPhone = !isPlaceholderPhone(config.phone);
  const showEmail = !isPlaceholderEmail(config.email);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">{kontaktSeo.h1}</h1>
      <SeoBody paragraphs={kontaktSeo.paragraphs} />

      <div className="mt-8 space-y-4">
        <Link
          href="/book"
          data-btn
          className="flex items-center justify-center rounded-lg bg-accent px-8 py-5 text-2xl font-bold text-white hover:bg-accent-dark"
        >
          Book en tid
        </Link>
        {showPhone && (
          <a
            href={`tel:${config.phone.replace(/\s/g, "")}`}
            data-btn
            className="flex items-center justify-center rounded-lg border-2 border-brand px-8 py-5 text-xl font-semibold text-brand hover:bg-brand-light"
          >
            Ring {config.phone}
          </a>
        )}
        {showEmail && (
          <a
            href={`mailto:${config.email}`}
            data-btn
            className="flex items-center justify-center rounded-lg border-2 border-brand px-8 py-5 text-xl font-semibold text-brand hover:bg-brand-light"
          >
            Skriv til {config.email}
          </a>
        )}
        {!showEmail && (
          <p className="text-center text-lg text-ink-soft">
            E-mail kommer snart. Book online, eller ring {config.phone}.
          </p>
        )}
      </div>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Hvor kører jeg ud fra?</h2>
      <p className="mt-4 text-lg">
        {config.home.postalCode} {config.home.city}. Jeg har ikke en salon,
        du kan komme ind i — jeg kommer altid ud til dig.
      </p>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Betaling</h2>
      <p className="mt-4 text-lg">
        MobilePay, når du booker. Pårørende kan få faktura. Afbud mindst{" "}
        {config.cancelFreeHours} timer før er gratis — ellers {config.lateCancelFeeKr} kr.
        {config.cvr ? ` CVR-nummer ${config.cvr}.` : ""}
      </p>

      <FaqList items={kontaktSeo.faq} />

      <p className="mt-10 text-lg">
        <Link href="/book/plejehjem" className="font-semibold text-brand underline">
          Book frisør til plejehjem
        </Link>
        {" · "}
        <Link href="/omraade" className="font-semibold text-brand underline">
          Se områder
        </Link>
      </p>
    </div>
  );
}
