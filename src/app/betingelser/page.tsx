import type { Metadata } from "next";
import { getConfig } from "@/lib/runtime-config";
import { formatDkk } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Betingelser og afbud",
  description: "Betingelser for booking, afbud og betaling hos din udekørende frisør.",
  alternates: { canonical: "/betingelser" },
  robots: { index: false, follow: true },
};

export default async function BetingelserPage() {
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Betingelser og afbud</h1>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Booking</h2>
      <p className="mt-3 text-lg">
        Når du har booket, får du en bekræftelse på e-mail med tid, adresse og pris. Du
        betaler med MobilePay, når du booker. Pårørende kan få faktura. Du skal booke
        mindst {config.minNoticeHours} timer i forvejen online — skal det gå hurtigere, så
        ring til mig, så ser jeg, om jeg kan nå det.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Priser</h2>
      <p className="mt-3 text-lg">
        Prisen i din bekræftelse er den, du betaler. Kørselstillægget beregnes efter
        afstanden fra frisørens adresse til din. Ønsker du undervejs noget mere lavet, end
        du bookede, aftaler vi prisen for det, inden jeg går i gang.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Betaling</h2>
      <p className="mt-3 text-lg">
        Du betaler med MobilePay, når du booker — til {config.mobilePay}. Pårørende kan få
        faktura på e-mail. Bookingen er bekræftet, når betalingen er sendt, eller når
        fakturaen er oprettet.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Afbud og ændringer</h2>
      <p className="mt-3 text-lg">
        Aflyser du mindst {config.cancelFreeHours} timer før din tid, betaler du{" "}
        <strong>intet</strong>
        {". "}
        Har du allerede betalt, refunderes det fulde beløb.
      </p>
      <p className="mt-3 text-lg">
        Aflyser du med under {config.cancelFreeHours} timers varsel, opkræves et gebyr på{" "}
        <strong>{formatDkk(config.lateCancelFeeKr)}</strong>. Har du allerede betalt,
        refunderes resten. Har du ikke betalt endnu, sender du gebyret med MobilePay.
      </p>
      <p className="mt-3 text-lg">
        Du får et personligt afbuds-link i din e-mail. Du kan også ringe på {config.phone}.
      </p>
      <p className="mt-3 text-lg">
        Møder jeg op på den aftalte adresse, uden at der er nogen hjemme, kan gebyret for
        sen aflysning gælde. Bliver du akut syg, så ring — så finder vi en løsning.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Hvis jeg bliver forsinket</h2>
      <p className="mt-3 text-lg">
        Jeg kører i bil og kan blive fanget i trafikken. Bliver jeg forsinket mere end 15
        minutter, ringer jeg til dig. Kan tiden ikke passe dig længere, flytter vi den
        uden beregning.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Forholdene på stedet</h2>
      <p className="mt-3 text-lg">
        Jeg skal kunne komme til med en stol og have plads omkring den. Jeg lægger selv
        tæppe ud og fejer op efter mig. Jeg kan ikke påtage mig ansvaret for skader, der
        skyldes forhold på stedet, som jeg ikke er blevet gjort bekendt med.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Allergi og følsom hovedbund</h2>
      <p className="mt-3 text-lg">
        Sig det til mig, inden vi starter, hvis du har en allergi eller en sart hovedbund.
        Så bruger jeg parfumefri produkter og tager det ekstra roligt.
      </p>

      <h2 className="mt-10 text-2xl font-bold sm:text-3xl">Klager</h2>
      <p className="mt-3 text-lg">
        Er du ikke tilfreds med resultatet, så sig det til mig med det samme eller ring
        inden for en uge. Så kommer jeg forbi og retter det op uden beregning.
      </p>
    </div>
  );
}
