import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { omMigSeo } from "@/content/seo";
import { isPlaceholderName } from "@/lib/placeholders";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(
  omMigSeo,
  "/om-mig",
  "/behandlinger/pensionistklip.png",
);

export default async function OmMigPage() {
  const config = await getConfig();
  const me = config.employees.find((item) => item.active) ?? config.employees[0];
  const showName = !isPlaceholderName(config.ownerName);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">{omMigSeo.h1}</h1>
          {showName && (
            <p className="mt-5 text-xl text-ink-soft">Jeg hedder {config.ownerName}.</p>
          )}
          <p className="mt-5 text-xl text-ink-soft">{omMigSeo.paragraphs[0]}</p>
        </div>

        <Image
          src="/behandlinger/pensionistklip.png"
          alt="Frisør klipper en ældre kvindes hår i hendes egen stue."
          width={1024}
          height={768}
          sizes="(min-width: 768px) 30rem, 92vw"
          className="aspect-4/3 w-full rounded-card border border-line object-cover"
        />
      </div>

      <div className="mt-8 max-w-3xl">
        <SeoBody paragraphs={omMigSeo.paragraphs.slice(1)} />

        <h2 className="mt-14 text-2xl font-bold sm:text-3xl">Hygiejne og udstyr</h2>
        <p className="mt-4 text-lg">
          Alle mine redskaber rengøres og desinficeres mellem hver kunde. Jeg har rene
          kapper med til hver aftale, og jeg bruger professionelle produkter, også i
          parfumefri udgaver til sart hovedbund.
        </p>

        <h2 className="mt-14 text-2xl font-bold sm:text-3xl">Hvad jeg er god til</h2>
        <ul className="mt-4 space-y-2 text-lg">
          {(me?.qualifications && me.qualifications.length > 0
            ? me.qualifications
            : [
                "Klassiske klipninger, der er nemme at holde selv derhjemme",
                "Pensionistklip med ekstra tid, også i kørestol eller siddende",
                "Børneklip i barnets eget hjem og i barnets tempo",
                "Faste besøg, hvis du gerne vil klippes med samme interval",
              ]
          ).map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        {me?.bio && <p className="mt-6 text-lg">{me.bio}</p>}

        {config.employees.filter((item) => item.active).length > 1 && (
          <>
            <h2 className="mt-14 text-2xl font-bold sm:text-3xl">Frisørerne</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {config.employees
                .filter((item) => item.active)
                .map((employee) => (
                  <li key={employee.id} className="rounded-card border border-line bg-surface p-5">
                    <Image
                      src={employee.image}
                      alt={employee.imageAlt}
                      width={320}
                      height={320}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <h3 className="mt-4 text-xl font-bold">
                      {isPlaceholderName(employee.name) ? employee.role : employee.name}
                    </h3>
                    <p className="text-ink-soft">{employee.role}</p>
                    {employee.bio && <p className="mt-2 text-lg">{employee.bio}</p>}
                    {employee.qualifications && employee.qualifications.length > 0 && (
                      <ul className="mt-3 space-y-1 text-ink-soft">
                        {employee.qualifications.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>
          </>
        )}

        <h2 className="mt-14 text-2xl font-bold sm:text-3xl">Faste aftaler</h2>
        <p className="mt-4 text-lg">
          Mange af mine kunder vil gerne klippes hver sjette til ottende uge. Sig til, når
          jeg er der, så sætter jeg den næste tid i kalenderen med det samme, så du ikke
          skal huske på det.
        </p>

        <FaqList items={omMigSeo.faq} />

        <p className="mt-14">
          <Link
            href="/book"
            data-btn
            className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
          >
            Book en tid
          </Link>
        </p>
      </div>
    </div>
  );
}
