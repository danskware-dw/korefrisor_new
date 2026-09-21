import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { gavekortSeo } from "@/content/seo";
import { isPlaceholderName, isPlaceholderPhone } from "@/lib/placeholders";
import { formatDkk } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";
import { primaryBookableFrom } from "@/config/business";

export const metadata: Metadata = pageMetadata(
  gavekortSeo,
  "/gavekort",
  "/behandlinger/pensionistklip.png",
);

const recipients = [
  {
    title: "Til mor, far eller bedsteforældre",
    text: "Pensionistklip med ekstra tid. De bliver i stolen derhjemme.",
    image: "/behandlinger/pensionistklip.png",
    imageAlt: "Ældre kvinde får klippet håret i sin egen stue.",
  },
  {
    title: "Til en, der helst bliver hjemme",
    text: "Almindeligt klip, uden at de skal finde en salon og en bus.",
    image: "/behandlinger/klip.png",
    imageAlt: "Kunde får klippet håret hjemme ved spisebordet.",
  },
  {
    title: "Til et barn",
    text: "Børneklip i eget tempo, i stuen de kender.",
    image: "/behandlinger/boerneklip.png",
    imageAlt: "Barn får klippet håret hjemme i stuen.",
  },
];

const how = [
  {
    title: "Du ringer og vælger klip",
    text: "Sig hvem gaven er til, og om det er klip, pensionistklip eller børneklip.",
  },
  {
    title: "Du betaler klippet",
    text: "MobilePay, når beløbet er aftalt. Kørsel betales først, når de booker.",
  },
  {
    title: "De booker, når det passer",
    text: "Jeg sender en besked med, hvordan de tager tid. Overraskelse? Så går beskeden til dig.",
  },
];

export default async function GavekortPage() {
  const config = await getConfig();
  const tel = config.phone.replace(/\s/g, "");
  const showPhone = !isPlaceholderPhone(config.phone);
  const gifts = primaryBookableFrom(config.services);
  const people = config.employees.filter((employee) => employee.active);
  const buyHref = showPhone ? `tel:${tel}` : "/kontakt";
  const buyLabel = showPhone ? `Ring ${config.phone}` : "Kontakt os";

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
              { label: "Gavekort" },
            ]}
          />
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.12em] text-white/80">
            Gavekort
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl lg:text-6xl">
            {gavekortSeo.h1}
          </h1>
          <p className="mt-5 text-xl text-white/90">
            Du betaler klippet. De vælger dagen. Jeg kommer hjem til dem.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#gaver"
              data-btn
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-accent px-8 text-lg font-bold text-white hover:bg-accent-dark"
            >
              Se klip og priser
            </a>
            <a
              href={buyHref}
              data-btn
              className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-white px-8 text-lg font-bold text-white hover:bg-white/10"
            >
              {buyLabel}
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="hvem" className="mx-auto max-w-5xl px-4 py-16">
        <h2 id="hvem" className="text-3xl font-bold sm:text-4xl">
          En stol derhjemme er gaven
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Ikke en flaske shampoo. Et klip, de ikke selv skal arrangere.
        </p>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {recipients.map((item) => (
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

      <section aria-labelledby="gaver" className="bg-brand-dark text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 id="gaver" className="scroll-mt-64 text-3xl font-bold sm:scroll-mt-40 sm:text-4xl">
            Tre klip, tre beløb
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-white/90">
            Gavekortet er prisen på klippet. Kørsel kommer oveni, når de booker.
          </p>
          <ul className="mt-10 grid gap-5 text-ink md:grid-cols-3">
            {gifts.map((service) => (
              <li key={service.id} className="flex flex-col rounded-card bg-surface p-6">
                <p className="text-ink-soft">Gavekort til</p>
                <h3 className="text-2xl font-bold">{service.name}</h3>
                <p className="mt-4 text-3xl font-bold text-brand">{formatDkk(service.price)}</p>
                <p className="mt-3 flex-1 text-ink-soft">{service.description}</p>
                <a
                  href={buyHref}
                  data-btn
                  className="mt-6 inline-flex min-h-14 items-center justify-center rounded-xl bg-accent px-6 text-lg font-bold text-white hover:bg-accent-dark"
                >
                  {showPhone ? "Ring og køb" : "Kontakt og køb"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="saadan-gave" className="mx-auto max-w-3xl px-4 py-16">
        <h2 id="saadan-gave" className="text-3xl font-bold sm:text-4xl">
          Fra din MobilePay til deres stol
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
        <section aria-labelledby="hvem-kommer" className="bg-brand-light">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center">
            <h2 id="hvem-kommer" className="text-3xl font-bold sm:text-4xl">
              Den, der kommer ind ad døren
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
        <SeoBody paragraphs={gavekortSeo.paragraphs} />
        <FaqList items={gavekortSeo.faq} heading="Spørgsmål om gavekort" />
        <p className="mt-10 text-lg">
          Vil du hellere sætte tiden selv?{" "}
          <Link href="/for-parorende" className="font-semibold text-brand underline">
            Book som pårørende
          </Link>
          .
        </p>
      </div>

      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Klar til at give et klip?</h2>
          <p className="mt-4 text-lg text-white/90">
            Ring, så laver vi gavekortet på et minut.
          </p>
          <a
            href={buyHref}
            data-btn
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-accent px-8 text-lg font-bold text-white hover:bg-accent-dark"
          >
            {buyLabel}
          </a>
        </div>
      </section>
    </>
  );
}
