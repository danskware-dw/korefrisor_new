import type { Metadata } from "next";
import Link from "next/link";
import { ServiceGrid } from "@/components/ServiceGrid";
import { formatDkk } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "Behandlinger: hjemmeklip, pensionistklip og børneklip",
  description:
    "Udekørende frisør i Kastrup. Hjemmeklip, pensionistklip til ældre og børneklip i dit eget hjem. Fast pris, nem booking, kørsel til Amager og København.",
  keywords: [
    "hjemmeklip",
    "udekørende frisør",
    "pensionistklip hjemme",
    "børneklip hjemme",
    "mobile hairdresser Copenhagen",
    "senior haircut at home",
  ],
  alternates: { canonical: "/behandlinger" },
};

export default async function BehandlingerPage() {
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Behandlinger</h1>
      <p className="mt-5 max-w-3xl text-xl text-ink-soft">
        Jeg holder det enkelt, så det er nemt at vælge: klip, pensionistklip og
        børneklip. Du kan lægge skæg, pandehår eller bryn til. Alle klip er hjemmeklip
        — jeg kører til dig med mit eget udstyr.
      </p>

      <div className="mt-12">
        <ServiceGrid services={config.services} phone={config.phone} />
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold sm:text-3xl">Hvad er hjemmeklip?</h2>
        <p className="mt-4 text-lg">
          Hjemmeklip — også kaldet udekørende frisør eller mobil frisør — betyder,
          at du bliver klippet i din egen stue. Det er den model, hjemmefrisører i
          Danmark, Storbritannien og USA bruger til ældre, børn og alle, der har
          svært ved at komme i salon. Du booker online, jeg kører fra{" "}
          {config.home.city}, og du ser prisen inklusive kørsel, før du bekræfter.
        </p>
      </section>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {config.services
          .filter((s) => !s.contactOnly && !s.addon)
          .map((service) => (
            <li key={service.id}>
              <Link
                href={`/behandlinger/${service.id}`}
                className="flex min-h-14 items-center justify-between rounded-card border border-line bg-surface px-5 font-semibold hover:border-brand"
              >
                {service.name}
                <span className="font-normal text-ink-soft tabular-nums">
                  {formatDkk(service.price)}
                </span>
              </Link>
            </li>
          ))}
      </ul>

      <section className="mt-16 max-w-3xl rounded-card border border-line bg-surface p-6">
        <h2 className="text-xl font-bold">For English-speaking visitors</h2>
        <p className="mt-3 text-ink-soft">
          Mobile hairdresser based in Kastrup, Copenhagen. Home haircuts for adults,
          seniors (extra time, wheelchair-friendly) and children under 12. I drive
          to your home in Amager, Tårnby, Dragør and greater Copenhagen. Book online
          or call {config.phone}.
        </p>
      </section>
    </div>
  );
}
