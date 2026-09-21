import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Faq } from "@/components/Faq";
import { TravelFeeTable } from "@/components/PriceTable";
import { ServiceGrid } from "@/components/ServiceGrid";
import { Testimonials } from "@/components/Testimonials";
import { homeSeo } from "@/content/seo";
import { isPlaceholderName, isPlaceholderPhone } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(homeSeo, "/");

const steps = [
  {
    title: "Vælg behandling og tid",
    text: "Du vælger klip, pensionistklip eller børneklip, skriver adressen og ser den låste pris inkl. kørsel.",
  },
  {
    title: "Find en stol frem",
    text: "Jeg kommer til aftalt tid med sakse, maskine, kappe og tæppe. Du skal kun have en stol klar.",
  },
  {
    title: "Du betaler, når du booker",
    text: "MobilePay inden jeg kører. Pårørende kan få faktura. Afbud mindst 24 timer før er gratis — ellers 100 kr.",
  },
];

const heroTrust = [
  "Pris vises før booking",
  "Gratis kørsel inden for 5 km",
  "MobilePay ved booking",
];

const heroAreas = ["Kastrup", "Tårnby", "Dragør", "Amager"];

const customerPaths = [
  {
    eyebrow: "Til pårørende",
    title: "Book til mor eller far",
    text: "Brug deres adresse og dit telefonnummer. Du kan få faktura og påmindelse dagen før.",
    href: "/for-parorende",
    cta: "Se pårørende-flow",
  },
  {
    eyebrow: "Flere samme sted",
    title: "Saml familie eller naboer",
    text: "I betaler kun kørsel én gang, og hver ekstra person får 50 kr rabat.",
    href: "/book",
    cta: "Book flere personer",
  },
  {
    eyebrow: "Plejehjem og bosted",
    title: "Fast klippedag med én faktura",
    text: "Flere beboere samme formiddag, fast ugedag og roligt tempo.",
    href: "/book/plejehjem",
    cta: "Aftal fælles besøg",
  },
];

export default async function Home() {
  const config = await getConfig();
  const tel = config.phone.replace(/\s/g, "");
  const showPhone = !isPlaceholderPhone(config.phone);
  const showName = !isPlaceholderName(config.ownerName);
  const homeServices = config.services.filter((service) => !service.addon);

  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1.08fr_0.92fr] md:items-center md:py-20">
          <div>
            <p className="inline-flex rounded-full bg-brand-light px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-brand">
              Udekørende frisør i {config.home.city} og omegn
            </p>
            <h1 className="mt-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
              {homeSeo.h1}
            </h1>
            <p className="mt-5 text-xl text-ink-soft">
              Fast pris inkl. kørsel. Rolig klipning i din egen stol — til ældre, børn
              og dig der helst vil blive hjemme.
            </p>

            <ul className="mt-6 grid gap-3 text-lg sm:grid-cols-3">
              {heroTrust.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-card border border-line bg-canvas px-4 py-3 font-semibold text-ink"
                >
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/book"
                data-btn
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-accent px-8 py-4 text-xl font-bold text-white hover:bg-accent-dark sm:flex-none"
              >
                Book hjemmeklip
              </Link>
              {showPhone ? (
                <a
                  href={`tel:${tel}`}
                  data-btn
                  className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-brand px-8 py-4 text-xl font-bold text-brand hover:bg-brand-light sm:flex-none"
                >
                  Ring {config.phone}
                </a>
              ) : (
                <Link
                  href="/priser"
                  data-btn
                  className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-brand px-8 py-4 text-xl font-bold text-brand hover:bg-brand-light sm:flex-none"
                >
                  Se priser
                </Link>
              )}
            </div>

            <div className="mt-7 rounded-card border border-line bg-canvas p-4">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand">
                Kører blandt andet i
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {heroAreas.map((area) => (
                  <li key={area} className="rounded-full bg-surface px-4 py-2 font-semibold">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/behandlinger/hjemmebesoeg.png"
              alt="Frisør reder en ældre kvindes hår i hendes egen lyse stue."
              width={1024}
              height={768}
              priority
              sizes="(min-width: 768px) 30rem, 92vw"
              className="aspect-4/3 w-full rounded-[1.5rem] border border-line object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-surface/95 p-4">
              <p className="font-bold text-ink">
                {showName ? `${config.ownerName} kommer hjem til dig` : "Du skal kun finde en stol frem"}
              </p>
              <p className="mt-1 text-base text-ink-soft">
                Jeg har kappe, tæppe, sakse og maskine med.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showName && (
        <section aria-labelledby="hvem" className="mx-auto max-w-5xl px-4 py-16">
          <div className="grid gap-6 rounded-[1.5rem] border border-line bg-surface p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-semibold text-accent">Hvem kommer ind ad døren</p>
              <h2 id="hvem" className="mt-2 text-3xl font-bold sm:text-4xl">
                Jeg hedder {config.ownerName}
              </h2>
              <p className="mt-3 text-lg text-ink-soft">
                Én frisør, samme person, med eget udstyr i bilen. {config.yearsOfExperience}+ års
                erfaring med rolige klip hjemme hos kunden. Jeg farver ikke — jeg klipper,
                sidder gerne ved en kørestol, og fejer op bagefter.
              </p>
            </div>
            <Link
              href="/om-mig"
              className="inline-flex items-center justify-center rounded-xl border-2 border-brand px-6 py-3 font-bold text-brand hover:bg-brand-light"
            >
              Mere om mig
            </Link>
          </div>
        </section>
      )}

      <section aria-labelledby="vaelg-vej" className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-[1.5rem] border border-line bg-canvas p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="font-semibold text-accent">Vælg den nemmeste vej</p>
            <h2 id="vaelg-vej" className="mt-2 text-3xl font-bold sm:text-4xl">
              Pårørende, familie eller plejehjem
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              De fleste bookinger handler om én af de tre. Vælg den vej, der passer, så
              slipper du for unødige spørgsmål.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {customerPaths.map((path) => (
              <Link
                key={path.title}
                href={path.href}
                className="group flex min-h-full flex-col rounded-card border border-line bg-surface p-5 transition hover:border-brand"
              >
                <span className="text-sm font-bold uppercase tracking-[0.12em] text-brand">
                  {path.eyebrow}
                </span>
                <h3 className="mt-3 text-xl font-bold">{path.title}</h3>
                <p className="mt-2 flex-1 text-ink-soft">{path.text}</p>
                <span className="mt-5 font-bold text-accent group-hover:text-accent-dark">
                  {path.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="behandlinger" className="bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 id="behandlinger" className="text-3xl font-bold sm:text-4xl">
            Klip, pensionistklip og børneklip
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">
            Tre klip. Kørslen lægges oven i efter afstanden, og du ser den samlede pris,
            inden du bekræfter. Skæg, pandehår og bryn vælges som tillæg i bookingen.
          </p>
          <div className="mt-10">
            <ServiceGrid services={homeServices} phone={config.phone} />
          </div>
        </div>
      </section>

      <section aria-labelledby="saadan" className="mx-auto max-w-5xl px-4 py-16">
        <h2 id="saadan" className="text-3xl font-bold sm:text-4xl">
          Sådan foregår det
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-card border border-line bg-surface p-6">
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-full bg-brand-light text-xl font-bold text-brand"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-lg">
          <Link href="/saadan-foregaar-det" className="font-semibold text-brand underline">
            Se hele forløbet
          </Link>
        </p>
      </section>

      <section aria-labelledby="hjemme-vs-salon" className="mx-auto max-w-5xl px-4 pb-16">
        <h2 id="hjemme-vs-salon" className="text-3xl font-bold sm:text-4xl">
          Hjemmeklip eller salon?
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Kort oversigt, hvis du vælger mellem at køre til en frisør eller få frisøren hjem.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-lg">
            <caption className="sr-only">
              Sammenligning af hjemmeklip og traditionel salon
            </caption>
            <thead>
              <tr className="border-b-2 border-line">
                <th scope="col" className="py-3 pr-4 font-semibold">
                  Punkt
                </th>
                <th scope="col" className="py-3 pr-4 font-semibold">
                  Hjemmeklip
                </th>
                <th scope="col" className="py-3 font-semibold">
                  Salon
                </th>
              </tr>
            </thead>
            <tbody className="text-ink-soft">
              <tr className="border-b border-line">
                <th scope="row" className="py-4 pr-4 font-medium text-ink">
                  Transport
                </th>
                <td className="py-4 pr-4">Frisøren kører til dig</td>
                <td className="py-4">Du skal selv frem og tilbage</td>
              </tr>
              <tr className="border-b border-line">
                <th scope="row" className="py-4 pr-4 font-medium text-ink">
                  Gangbesvær / kørestol
                </th>
                <td className="py-4 pr-4">Klip i din stol eller stue</td>
                <td className="py-4">Kan være svært med trapper og venteværelse</td>
              </tr>
              <tr>
                <th scope="row" className="py-4 pr-4 font-medium text-ink">
                  Pris
                </th>
                <td className="py-4 pr-4">Behandling + evt. kørsel (synlig før booking)</td>
                <td className="py-4">Kun behandling — plus din egen transport</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="koersel" className="bg-surface">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2 md:items-start">
          <div>
            <h2 id="koersel" className="text-3xl font-bold sm:text-4xl">
              Hvad koster kørslen?
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              De første {config.travel.freeRadiusKm} km fra {config.home.city} er gratis.
              Derefter et fast tillæg efter zone. Du ser ruten og den låste total, før du
              bekræfter. Flere samme sted: 50 kr rabat pr. ekstra person, kørsel kun én gang.
            </p>
            <p className="mt-4 text-lg">
              <Link href="/omraade" className="font-semibold text-brand underline">
                Se kortet over mit område
              </Link>
              {" · "}
              <Link href="/priser" className="font-semibold text-brand underline">
                Alle priser
              </Link>
            </p>
          </div>

          <div className="rounded-card border border-line bg-canvas p-6">
            <TravelFeeTable travel={config.travel} city={config.home.city} />
          </div>
        </div>
      </section>

      <Testimonials />
      <Faq items={homeSeo.faq} />

      <section className="bg-brand text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Skal jeg komme forbi?</h2>
          <p className="mt-4 text-xl text-white/90">
            Book på to minutter. Du ser prisen, før du bekræfter.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/book"
              data-btn
              className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
            >
              Book hjemmeklip
            </Link>
            <Link
              href="/for-parorende"
              data-btn
              className="inline-flex items-center rounded-lg border-2 border-white px-8 py-4 text-xl font-semibold text-white hover:bg-brand-dark"
            >
              Book til mor eller far
            </Link>
            {showPhone && (
              <a
                href={`tel:${tel}`}
                data-btn
                className="inline-flex items-center rounded-lg border-2 border-white px-8 py-4 text-xl font-semibold text-white hover:bg-brand-dark"
              >
                Ring {config.phone}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-1 size-5 shrink-0 text-accent"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
