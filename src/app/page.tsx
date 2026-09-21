import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Faq } from "@/components/Faq";
import { TravelFeeTable } from "@/components/PriceTable";
import { ServiceGrid } from "@/components/ServiceGrid";
import { Testimonials } from "@/components/Testimonials";
import { homeSeo } from "@/content/seo";
import { isPlaceholderName, isPlaceholderPhone } from "@/lib/placeholders";
import { formatDkk } from "@/lib/pricing";
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

const heroAreas = ["Kastrup", "Tårnby", "Dragør", "Amager"];

const customerPaths = [
  {
    eyebrow: "Til pårørende",
    title: "Book til mor eller far",
    text: "Brug deres adresse og dit telefonnummer. Du kan få faktura og påmindelse dagen før.",
    href: "/for-parorende",
    cta: "Se hvordan pårørende booker",
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
  const people = config.employees.filter((employee) => employee.active);
  const fromPrice = Math.min(
    ...config.services
      .filter((service) => !service.addon && !service.contactOnly && service.price > 0)
      .map((service) => service.price),
  );
  const trustRow = [
    { label: "Fast pris før booking", detail: "Klip + kørsel vises, inden du bekræfter" },
    {
      label: `Gratis kørsel ${config.travel.freeRadiusKm} km`,
      detail: `Fra ${config.home.city}`,
    },
    {
      label: `Op til ${config.travel.maxServiceRadiusKm} km`,
      detail: heroAreas.join(", "),
    },
    {
      label: `${config.yearsOfExperience}+ års erfaring`,
      detail: "Rolig klipning hjemme hos dig",
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-dark">
        <div className="absolute inset-0">
          <Image
            src="/behandlinger/hjemmebesoeg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center text-white sm:py-24">
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
            {homeSeo.h1}
          </h1>
          <p className="mt-5 text-xl text-white/90">
            Fast pris inkl. kørsel. Rolig klipning i din egen stol — til ældre, børn
            og dig der helst vil blive hjemme.
          </p>

          <form
            action="/book"
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 text-left text-ink sm:flex-row sm:items-center sm:rounded-full"
          >
            <label htmlFor="forside-adresse" className="sr-only">
              Din adresse
            </label>
            <span className="flex min-h-14 flex-1 items-center">
              <span className="pl-3 text-brand" aria-hidden="true">
                <PinIcon />
              </span>
              <input
                id="forside-adresse"
                name="adresse"
                type="text"
                autoComplete="street-address"
                placeholder="Skriv din adresse"
                className="min-h-14 flex-1 border-0 bg-transparent px-3 text-lg text-ink outline-none"
              />
            </span>
            <button
              type="submit"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-accent px-8 text-lg font-bold text-white hover:bg-accent-dark sm:rounded-full"
            >
              Find tid
            </button>
          </form>

          {people.length > 0 && (
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {people.map((employee) => {
                const name = isPlaceholderName(employee.name) ? employee.role : employee.name;
                return (
                  <li key={employee.id}>
                    <Link
                      href={`/frisorer/${employee.id}`}
                      className="flex flex-col items-center gap-2 text-white"
                    >
                      <Image
                        src={employee.image}
                        alt={employee.imageAlt}
                        width={96}
                        height={96}
                        className="size-16 rounded-full border-2 border-white object-cover"
                      />
                      <span className="text-base font-semibold">{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {showPhone && (
            <p className="mt-6 text-lg">
              Eller ring på{" "}
              <a href={`tel:${tel}`} className="font-semibold underline">
                {config.phone}
              </a>
            </p>
          )}
        </div>
      </section>

      <section aria-label="Korte fakta" className="bg-brand-light">
        <ul className="mx-auto grid max-w-5xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {trustRow.map((item) => (
            <li key={item.label} className="rounded-card bg-surface px-5 py-5">
              <p className="font-bold">{item.label}</p>
              <p className="mt-1 text-ink-soft">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tilbud" className="relative overflow-hidden bg-brand-dark">
        <div className="absolute inset-0">
          <Image
            src="/behandlinger/pensionistklip.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center text-white sm:py-20">
          <h2 id="tilbud" className="scroll-mt-40 text-3xl font-bold sm:text-5xl">
            Hjemmeklip til alle
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Ingen salon. Jeg kommer til døren med eget udstyr — til dig derhjemme og
            til beboere på plejehjem.
          </p>
          <ul className="mt-10 grid gap-5 text-left text-ink md:grid-cols-2">
            <li className="flex flex-col rounded-card bg-surface p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-ink-soft">Hjemmeklip til</p>
                  <h3 className="text-3xl font-bold">Privat</h3>
                </div>
                <HouseIcon />
              </div>
              <p className="mt-6 text-ink-soft">Priser</p>
              <p className="text-3xl font-bold text-brand">fra {formatDkk(fromPrice)}</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Klip, pensionistklip og børneklip hjemme hos dig",
                  "Fast pris inkl. kørsel, inden du booker",
                  `Gratis kørsel inden for ${config.travel.freeRadiusKm} km`,
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/book"
                data-btn
                className="mt-auto pt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-accent px-6 text-lg font-bold text-white hover:bg-accent-dark"
              >
                Book tid
              </Link>
            </li>
            <li className="flex flex-col rounded-card bg-surface p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-ink-soft">Hjemmeklip til</p>
                  <h3 className="text-3xl font-bold">Plejehjem</h3>
                </div>
                <BuildingIcon />
              </div>
              <p className="mt-6 text-ink-soft">Priser</p>
              <p className="text-3xl font-bold text-brand">Efter aftale</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Flere beboere samme formiddag",
                  "Én kørsel og én faktura",
                  "Fast ugedag, hvis I vil",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/book/plejehjem"
                data-btn
                className="mt-auto pt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-brand px-6 text-lg font-bold text-white hover:bg-brand-dark"
              >
                Læs mere
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="gave" className="border-y border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-4 py-12 sm:flex-row sm:items-center">
          <div>
            <h2 id="gave" className="text-3xl font-bold">
              Giv et klip i gave
            </h2>
            <p className="mt-2 text-lg text-ink-soft">
              Du betaler klippet. De booker, når det passer.
            </p>
          </div>
          <Link
            href="/gavekort"
            data-btn
            className="inline-flex min-h-14 items-center justify-center rounded-xl bg-accent px-8 text-lg font-bold text-white hover:bg-accent-dark"
          >
            Se gavekort
          </Link>
        </div>
      </section>

      <section aria-labelledby="job" className="border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-4 py-12 sm:flex-row sm:items-center">
          <div>
            <h2 id="job" className="text-3xl font-bold">
              Bliv udekørende frisør
            </h2>
            <p className="mt-2 text-lg text-ink-soft">
              Ingen salon. Du kører hjem til kunderne.
            </p>
          </div>
          <Link
            href="/bliv-frisor"
            data-btn
            className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-brand px-8 text-lg font-bold text-brand hover:bg-brand-light"
          >
            Se jobbet
          </Link>
        </div>
      </section>

      {showName && people.length > 0 && (
        <section aria-labelledby="hvem" className="mx-auto max-w-5xl px-4 py-16">
          <div className="text-center">
            <p className="font-semibold text-accent">Hvem kommer ind ad døren</p>
            <h2 id="hvem" className="mt-2 text-3xl font-bold sm:text-4xl">
              Mød frisøren
            </h2>
          </div>
          <ul className="mt-10 flex flex-wrap justify-center gap-6">
            {people.map((employee) => {
              const name = isPlaceholderName(employee.name) ? employee.role : employee.name;
              return (
                <li key={employee.id} className="w-full max-w-sm">
                  <article className="flex flex-col items-center rounded-card border border-line bg-surface px-6 py-8 text-center">
                    <Image
                      src={employee.image}
                      alt={employee.imageAlt}
                      width={160}
                      height={160}
                      className="size-28 rounded-full border border-line object-cover"
                    />
                    <h3 className="mt-4 text-2xl font-bold">{name}</h3>
                    <p className="text-ink-soft">{employee.role}</p>
                    <p className="mt-3 text-lg text-ink-soft">
                      Én frisør, samme person, med eget udstyr i bilen.{" "}
                      {config.yearsOfExperience}+ års erfaring. Jeg farver ikke — jeg
                      klipper, sidder gerne ved en kørestol, og fejer op bagefter.
                    </p>
                    <p className="mt-6 flex flex-wrap justify-center gap-4">
                      <Link
                        href={`/frisorer/${employee.id}`}
                        className="font-bold text-brand underline"
                      >
                        Se profil
                      </Link>
                      <Link href="/om-mig" className="font-bold text-brand underline">
                        Mere om mig
                      </Link>
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>
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

      <section aria-labelledby="saadan" className="bg-brand-dark text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 id="saadan" className="text-center text-3xl font-bold sm:text-4xl">
            Sådan foregår det
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="text-center">
                <span
                  aria-hidden="true"
                  className="mx-auto grid size-12 place-items-center rounded-full bg-accent text-xl font-bold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-white/85">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-lg">
            <Link href="/saadan-foregaar-det" className="font-semibold underline">
              Se hele forløbet
            </Link>
          </p>
        </div>
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

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
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

function HouseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-10 text-accent"
    >
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-10 text-brand"
    >
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
    </svg>
  );
}
