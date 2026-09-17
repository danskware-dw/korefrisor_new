import type { Metadata } from "next";
import Link from "next/link";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "Kontakt udekørende frisør i Kastrup",
  description:
    "Ring eller skriv til din hjemmefrisør i Kastrup. Book klip, pensionistklip eller børneklip hjemme hos dig.",
  alternates: { canonical: "/kontakt" },
};

export default async function KontaktPage() {
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Kontakt</h1>
      <p className="mt-5 text-xl text-ink-soft">
        Den hurtigste vej er at ringe. Jeg svarer selv telefonen, og hvis jeg er
        midt i en klipning, ringer jeg tilbage så snart jeg kan.
      </p>

      <div className="mt-8 space-y-4">
        <a
          href={`tel:${config.phone.replace(/\s/g, "")}`}
          data-btn
          className="flex items-center justify-center rounded-lg bg-accent px-8 py-5 text-2xl font-bold text-white hover:bg-accent-dark"
        >
          Ring {config.phone}
        </a>
        <a
          href={`mailto:${config.email}`}
          data-btn
          className="flex items-center justify-center rounded-lg border-2 border-brand px-8 py-5 text-xl font-semibold text-brand hover:bg-brand-light"
        >
          Skriv til {config.email}
        </a>
      </div>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Vil du booke en tid?</h2>
      <p className="mt-4 text-lg">
        Det kan du gøre døgnet rundt, også om aftenen.{" "}
        <Link href="/book" className="font-semibold text-brand underline">
          Gå til bookingen
        </Link>{" "}
        — du ser prisen inklusive kørsel. Du betaler med MobilePay, når du booker.
      </p>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Hvor kører jeg ud fra?</h2>
      <p className="mt-4 text-lg">
        {config.home.postalCode} {config.home.city}. Jeg har ikke en salon,
        du kan komme ind i — jeg kommer altid ud til dig.
      </p>

      <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Betaling</h2>
      <p className="mt-4 text-lg">
        MobilePay, når du booker — til{" "}
        <strong>{config.mobilePay}</strong>. Pårørende kan få faktura. Afbud mindst{" "}
        {config.cancelFreeHours} timer før er gratis — ellers {config.lateCancelFeeKr} kr.
        {config.cvr ? ` CVR-nummer ${config.cvr}.` : ""}
      </p>
    </div>
  );
}
