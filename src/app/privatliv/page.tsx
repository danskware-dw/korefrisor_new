import type { Metadata } from "next";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "Privatlivspolitik",
  description: "Sådan behandler jeg dine personoplysninger, når du booker et hjemmeklip.",
  alternates: { canonical: "/privatliv" },
  robots: { index: false, follow: true },
};

export default async function PrivatlivPage() {
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Privatlivspolitik</h1>
      <p className="mt-4 text-ink-soft">
        Senest opdateret {new Date().toLocaleDateString("da-DK")}.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Hvem er ansvarlig?</h2>
      <p className="mt-3 text-lg">
        {config.name}, {config.home.postalCode} {config.home.city}.
        Telefon {config.phone}, e-mail {config.email}.
        {config.cvr ? ` CVR ${config.cvr}.` : ""}
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Hvilke oplysninger gemmer jeg?</h2>
      <p className="mt-3 text-lg">Når du booker en tid, gemmer jeg:</p>
      <ul className="mt-3 space-y-2 text-lg">
        <li>• Dit navn, telefonnummer og e-mailadresse</li>
        <li>• Adressen jeg skal køre til, og dens geografiske placering</li>
        <li>• Hvilken behandling du har valgt, samt tid og pris</li>
        <li>• Din eventuelle bemærkning, fx dørkode eller etage</li>
      </ul>
      <p className="mt-3 text-lg">
        Jeg beder ikke om og gemmer ikke CPR-nummer, helbredsoplysninger eller
        betalingskortoplysninger.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Hvorfor gemmer jeg dem?</h2>
      <p className="mt-3 text-lg">
        Udelukkende for at kunne udføre den aftale, du har indgået med mig: at
        møde op på det rigtige tidspunkt på den rigtige adresse, kunne kontakte
        dig hvis noget ændrer sig, og afregne korrekt. Retsgrundlaget er
        databeskyttelsesforordningens artikel 6, stk. 1, litra b (opfyldelse af
        en aftale), og for bogføringen litra c (retlig forpligtelse).
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Hvem får adgang til dem?</h2>
      <p className="mt-3 text-lg">
        Kun mig. Jeg sælger og videregiver ikke dine oplysninger. Jeg anvender
        tekniske leverandører til at drive hjemmesiden, sende e-mails og slå
        adresser og afstande op — herunder Danmarks Adresseregister
        (Styrelsen for Dataforsyning og Infrastruktur) og OpenStreetMap til
        kortvisning. Disse behandler kun det, der er nødvendigt for opslaget.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Hvor længe gemmer jeg dem?</h2>
      <p className="mt-3 text-lg">
        Bookingoplysninger slettes senest 12 måneder efter besøget, medmindre de
        skal opbevares længere af bogføringsmæssige grunde. Bogføringsmateriale
        opbevares i 5 år efter regnskabsårets afslutning, som loven kræver.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Dine rettigheder</h2>
      <p className="mt-3 text-lg">
        Du har ret til at få indsigt i dine oplysninger, få dem rettet eller
        slettet, og til at gøre indsigelse mod behandlingen. Ring eller skriv til
        mig, så ordner jeg det. Er du utilfreds med min behandling af dine
        oplysninger, kan du klage til Datatilsynet, Carl Jacobsens Vej 35, 2500
        Valby, datatilsynet.dk.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Cookies</h2>
      <p className="mt-3 text-lg">
        Hjemmesiden bruger ikke cookies til statistik, profilering eller
        markedsføring. Derfor er der heller ikke noget cookiebanner, du skal
        klikke dig igennem.
      </p>
    </div>
  );
}
