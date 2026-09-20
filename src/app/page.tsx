import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Faq } from "@/components/Faq";
import { TravelFeeTable } from "@/components/PriceTable";
import { ServiceGrid } from "@/components/ServiceGrid";
import { Testimonials } from "@/components/Testimonials";
import { homeSeo } from "@/content/seo";
import { isPlaceholderPhone } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(homeSeo, "/");

const steps = [
  {
    title: "Vælg behandling og tid",
    text: "Du vælger klip, pensionistklip eller børneklip, skriver adressen og ser den låste pris inkl. kørsel. Flere samme sted får rabat, og kørsel tælles kun én gang.",
  },
  {
    title: "Jeg kører hjem til dig",
    text: "Jeg kommer til aftalt tid med sakse, maskine, tæppe og produkter. Du skal kun finde en stol frem.",
  },
  {
    title: "Du betaler, når du booker",
    text: "Du betaler med MobilePay, inden jeg kører. Pårørende kan få faktura. Afbud mindst 24 timer før er gratis — ellers 100 kr.",
  },
];

const targetGroup = [
  "Ældre, der ikke længere kører bil eller har svært ved trapper",
  "Dig med gangbesvær, kørestol eller rollator",
  "Børn, der er tryggere ved at blive klippet hjemme",
  "Dig, der er syg eller er ved at komme til kræfter efter en operation",
  "Beboere på plejehjem, bosteder og i ældreboliger",
  "Dig, der bare hellere vil sidde i din egen stue",
];

export default async function Home() {
  const config = await getConfig();
  const tel = config.phone.replace(/\s/g, "");
  const showPhone = !isPlaceholderPhone(config.phone);

  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="font-semibold text-accent">
              Udekørende frisør i {config.home.city} og omegn
            </p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{homeSeo.h1}</h1>
            <p className="mt-5 text-xl text-ink-soft">{homeSeo.paragraphs[0]}</p>
            <p className="mt-4 text-lg text-ink-soft">{homeSeo.paragraphs[1]}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/book"
                data-btn
                className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
              >
                Book en tid
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

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-ink-soft">
              <li className="flex items-center gap-2">
                <CheckIcon /> {config.yearsOfExperience}+ års erfaring
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon /> Gratis kørsel inden for {config.travel.freeRadiusKm} km
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon /> Betaling med MobilePay, når du booker
              </li>
            </ul>
          </div>

          <Image
            src="/behandlinger/hjemmebesoeg.png"
            alt="Frisør reder en ældre kvindes hår i hendes egen lyse stue."
            width={1024}
            height={768}
            priority
            sizes="(min-width: 768px) 30rem, 92vw"
            className="aspect-4/3 w-full rounded-card border border-line object-cover"
          />
        </div>
      </section>

      <section aria-labelledby="hvad" className="mx-auto max-w-3xl px-4 py-16">
        <h2 id="hvad" className="text-3xl font-bold sm:text-4xl">
          Hjemmeklip, pensionistklip og børneklip
        </h2>
        {homeSeo.paragraphs.slice(2).map((text) => (
          <p key={text.slice(0, 40)} className="mt-4 text-lg text-ink-soft">
            {text}
          </p>
        ))}
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
      </section>

      <section aria-labelledby="behandlinger" className="bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 id="behandlinger" className="text-3xl font-bold sm:text-4xl">
            Det kan jeg lave hjemme hos dig
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">
            Jeg holder det enkelt: klip, pensionistklip og børneklip. Du kan lægge skæg,
            pandehår eller bryn til. Kørslen lægges oven i efter afstanden, og du ser den
            samlede pris, inden du bekræfter.
          </p>
          <div className="mt-10">
            <ServiceGrid services={config.services} phone={config.phone} />
          </div>
        </div>
      </section>

      <section aria-labelledby="hjemme-vs-salon" className="mx-auto max-w-5xl px-4 py-16">
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
                  Tempo
                </th>
                <td className="py-4 pr-4">Roligere, især pensionistklip</td>
                <td className="py-4">Ofte mere travlt i stolen</td>
              </tr>
              <tr className="border-b border-line">
                <th scope="row" className="py-4 pr-4 font-medium text-ink">
                  Gangbesvær / kørestol
                </th>
                <td className="py-4 pr-4">Klip i din stol eller stue</td>
                <td className="py-4">Kan være svært med trapper og venteværelse</td>
              </tr>
              <tr className="border-b border-line">
                <th scope="row" className="py-4 pr-4 font-medium text-ink">
                  Pris
                </th>
                <td className="py-4 pr-4">Behandling + evt. kørsel (synlig før booking)</td>
                <td className="py-4">Kun behandling — plus din egen transport</td>
              </tr>
              <tr>
                <th scope="row" className="py-4 pr-4 font-medium text-ink">
                  Bedst til
                </th>
                <td className="py-4 pr-4">Ældre, børn, dig der vil blive hjemme</td>
                <td className="py-4">Dig der gerne går i byen til frisør</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-lg text-ink-soft">
          <strong className="font-semibold text-ink">Kort sagt:</strong> Vælg hjemmeklip,
          hvis transport eller ventetid er besværligt. Vælg salon, hvis du hellere vil ud
          og synes om stemningen dér.
        </p>
      </section>

      <section aria-labelledby="til-hvem" className="mx-auto max-w-3xl px-4 py-16">
        <h2 id="til-hvem" className="text-3xl font-bold sm:text-4xl">
          Hvem kommer jeg ud til?
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          Jeg klipper alle, men jeg er her især for dig, hvis det er blevet besværligt at
          komme hen til en salon — og for børn, der har det bedst hjemme.
        </p>
        <ul className="mt-6 space-y-3 text-lg">
          {targetGroup.map((item) => (
            <li key={item} className="flex gap-3">
              <CheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-lg text-ink-soft">
          Er det en pårørende, du booker for: deres adresse, dit telefonnummer, faktura
          til dig og e-mail dagen før.{" "}
          <Link href="/for-parorende" className="font-semibold text-brand underline">
            Book til mor eller far
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="koersel" className="bg-surface">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2 md:items-start">
          <div>
            <h2 id="koersel" className="text-3xl font-bold sm:text-4xl">
              Hvad koster kørslen?
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              De første {config.travel.freeRadiusKm} km fra {config.home.city} er gratis.
              Derefter kommer et fast tillæg efter zone. Du ser ruten og den låste total,
              før du bekræfter. Flere samme sted: 50 kr rabat pr. ekstra person, kørsel
              kun én gang.
            </p>
            <p className="mt-4 text-lg">
              <Link href="/omraade" className="font-semibold text-brand underline">
                Se kortet over mit område
              </Link>
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {config.areas.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/frisor/${area.slug}`}
                    className="inline-flex min-h-12 items-center rounded-lg border border-line bg-canvas px-4 font-medium hover:border-brand"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
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
              Book en tid
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
