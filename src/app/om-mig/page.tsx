import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "Om mig – udekørende frisør i Kastrup",
  description:
    "Frisør med over 4 års erfaring, bosat i Kastrup. Jeg kører hjem til dig med klip, pensionistklip og børneklip i stedet for at have salon.",
  alternates: { canonical: "/om-mig" },
};

export default async function OmMigPage() {
  const config = await getConfig();
  const me = config.employees.find((item) => item.active) ?? config.employees[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Om mig</h1>
          <p className="mt-5 text-xl text-ink-soft">
            Jeg hedder {config.ownerName} og har været frisør i over{" "}
            {config.yearsOfExperience} år. Jeg bor i {config.home.city} og har valgt at
            køre ud til mine kunder i stedet for at have en salon.
          </p>
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

      <div className="mt-14 max-w-3xl">
        <p className="text-lg">
          Grunden er enkel. Jeg mødte gang på gang kunder, for hvem turen til salonen var
          det svære — bussen, trapperne, ventetiden. Nogle havde ikke været klippet i
          månedsvis, ikke fordi de ikke ville, men fordi de ikke kunne komme derhen. Så nu
          kommer jeg til dem i stedet.
        </p>

        <p className="mt-5 text-lg">
          Det gør også arbejdet roligere. Der er ingen musik, der buldrer, ingen telefon
          der ringer, og du skal ikke sidde og vente. Vi tager den tid, det tager, og du
          får min fulde opmærksomhed i din egen stue.
        </p>

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
                    <h3 className="mt-4 text-xl font-bold">{employee.name}</h3>
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

        <p className="mt-14">
          <Link
            href="/book"
            data-btn
            className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
          >
            Book en tid hos mig
          </Link>
        </p>
      </div>
    </div>
  );
}
