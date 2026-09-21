import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { jobSeo } from "@/content/seo";
import { isPlaceholderName, isPlaceholderPhone } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";
import { submitApplication } from "./actions";

export const metadata: Metadata = pageMetadata(
  jobSeo,
  "/bliv-frisor",
  "/behandlinger/hjemmebesoeg.png",
);

const facts = [
  {
    title: "Ingen salon",
    text: "Du kører hjem til kunden med sakse, maskine, kappe og tæppe.",
    image: "/behandlinger/hjemmebesoeg.png",
    imageAlt: "Frisør klar til hjemmebesøg.",
  },
  {
    title: "Dit område",
    text: "Du kører ud fra dit eget udgangspunkt. Kørsel beregnes derfra.",
    image: "/behandlinger/klip.png",
    imageAlt: "Klip hjemme hos kunden.",
  },
  {
    title: "Kunderne booker selv",
    text: "Tiderne ligger på sitet. Du ser dine bookinger i dashboardet.",
    image: "/behandlinger/pensionistklip.png",
    imageAlt: "Kunde får klippet håret i egen stue.",
  },
];

const how = [
  {
    title: "Du søger",
    text: "Navn, telefon og det område, du kører fra. Eller ring.",
  },
  {
    title: "Vi taler",
    text: "Jeg ringer tilbage. Vilkår aftaler vi, når vi har talt sammen.",
  },
  {
    title: "Du kommer på siden",
    text: "Dit område og dine behandlinger vises, så kunder kan booke dig.",
  },
];

const field =
  "w-full rounded-lg border-2 border-line bg-surface px-4 py-3 text-lg text-ink focus:border-brand";

export default async function JobPage({
  searchParams,
}: {
  searchParams: Promise<{ sendt?: string; fejl?: string }>;
}) {
  const config = await getConfig();
  const { sendt, fejl } = await searchParams;
  const tel = config.phone.replace(/\s/g, "");
  const showPhone = !isPlaceholderPhone(config.phone);
  const people = config.employees.filter((employee) => employee.active);
  const callHref = showPhone ? `tel:${tel}` : "/kontakt";
  const callLabel = showPhone ? `Ring ${config.phone}` : "Kontakt os";

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
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-white sm:py-24">
          <Breadcrumbs
            className="text-white/80 [&_a]:text-white"
            items={[
              { href: "/", label: "Forside" },
              { label: "Bliv frisør" },
            ]}
          />
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.12em] text-white/80">
            Job
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl lg:text-6xl">
            {jobSeo.h1}
          </h1>
          <p className="mt-5 text-xl text-white/90">
            Du kører hjem til kunderne. Ingen salon.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#ansoeg"
              data-btn
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-accent px-8 text-lg font-bold text-white hover:bg-accent-dark"
            >
              Ansøg her
            </a>
            <a
              href={callHref}
              data-btn
              className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-white px-8 text-lg font-bold text-white hover:bg-white/10"
            >
              {callLabel}
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="jobbet" className="mx-auto max-w-5xl px-4 py-16">
        <h2 id="jobbet" className="text-3xl font-bold sm:text-4xl">
          Hjemmeklip, ikke salonstol
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Klip, pensionistklip og børneklip hos kunden. Du har dit eget udgangspunkt.
        </p>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {facts.map((item) => (
            <li key={item.title} className="overflow-hidden rounded-card border border-line bg-surface">
              <Image
                src={item.image}
                alt={item.imageAlt}
                width={640}
                height={400}
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-ink-soft">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="saadan-job" className="mx-auto max-w-3xl px-4 py-16">
        <h2 id="saadan-job" className="text-3xl font-bold sm:text-4xl">
          Fra ansøgning til første tur
        </h2>
        <ol className="mt-10 space-y-8">
          {how.map((step, index) => (
            <li key={step.title} className="flex gap-5">
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-xl font-bold text-white"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-1 text-ink-soft">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {people.length > 0 && (
        <section aria-labelledby="kolleger" className="bg-brand-light">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center">
            <h2 id="kolleger" className="text-3xl font-bold sm:text-4xl">
              Hvem du kører med
            </h2>
            <ul className="mt-10 flex flex-wrap justify-center gap-8">
              {people.map((employee) => {
                const name = isPlaceholderName(employee.name) ? employee.role : employee.name;
                return (
                  <li key={employee.id} className="w-full max-w-xs">
                    <Link href={`/frisorer/${employee.id}`} className="flex flex-col items-center">
                      <Image
                        src={employee.image}
                        alt={employee.imageAlt}
                        width={160}
                        height={160}
                        className="size-28 rounded-full border border-line object-cover"
                      />
                      <span className="mt-4 text-2xl font-bold">{name}</span>
                      <span className="mt-1 text-ink-soft">{employee.role}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-3xl px-4 py-16">
        <SeoBody paragraphs={jobSeo.paragraphs} />
        <FaqList items={jobSeo.faq} heading="Spørgsmål om jobbet" />
      </div>

      <section aria-labelledby="ansoeg" className="bg-brand-dark text-white">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 id="ansoeg" className="scroll-mt-64 text-3xl font-bold sm:scroll-mt-40 sm:text-4xl">
            Søg her
          </h2>
          <p className="mt-3 text-lg text-white/90">
            Skemaet er nok. Du kan også ringe.
          </p>

          {sendt === "1" && (
            <p role="status" className="mt-6 rounded-card bg-accent px-5 py-4 font-semibold">
              Tak. Jeg ringer tilbage.
            </p>
          )}
          {fejl && (
            <p role="alert" className="mt-6 rounded-card bg-white px-5 py-4 font-semibold text-ink">
              {fejl}
            </p>
          )}

          <form action={submitApplication} className="mt-8 space-y-5 text-ink">
            <p className="absolute -left-[9999px]" aria-hidden="true">
              <label>
                Hjemmeside
                <input name="hjemmeside" tabIndex={-1} autoComplete="off" />
              </label>
            </p>
            <div>
              <label htmlFor="job-navn" className="block font-semibold text-white">
                Navn
              </label>
              <input id="job-navn" name="navn" type="text" required autoComplete="name" className={`${field} mt-2`} />
            </div>
            <div>
              <label htmlFor="job-telefon" className="block font-semibold text-white">
                Telefon
              </label>
              <input
                id="job-telefon"
                name="telefon"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                className={`${field} mt-2`}
              />
            </div>
            <div>
              <label htmlFor="job-by" className="block font-semibold text-white">
                By eller område, du kører fra
              </label>
              <input id="job-by" name="by" type="text" required autoComplete="address-level2" className={`${field} mt-2`} />
            </div>
            <div>
              <label htmlFor="job-besked" className="block font-semibold text-white">
                Lidt om dig
              </label>
              <textarea id="job-besked" name="besked" required rows={5} className={`${field} mt-2 min-h-32`} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-accent px-8 text-lg font-bold text-white hover:bg-accent-dark"
              >
                Send ansøgning
              </button>
              <a
                href={callHref}
                data-btn
                className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-white px-8 text-lg font-bold text-white hover:bg-white/10"
              >
                {callLabel}
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
