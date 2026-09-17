import type { AppConfig } from "@/config/types";
import { FAMILY_EXTRA_PERSON_DISCOUNT_KR, formatDkk } from "@/lib/pricing";

export function faqItems(config: AppConfig) {
  return [
    {
      question: "Kommer du helt hjem til mig?",
      answer:
        "Ja. Jeg er udekørende frisør og har alt mit udstyr med i bilen. Jeg klipper dig i dit eget hjem — hus, lejlighed, ældrebolig eller plejehjem. Du skal ingenting andet end at sidde ned.",
    },
    {
      question: "Hvad er hjemmeklip, og hvordan foregår det?",
      answer:
        "Hjemmeklip betyder, at frisøren kommer til dig i stedet for at du kører i salon. Du booker klip, pensionistklip eller børneklip, skriver din adresse, og jeg kører hjem til dig fra Kastrup. Du ser den samlede pris, inklusive kørsel, før du bekræfter.",
    },
    {
      question: "Klipper du pensionister og ældre hjemme?",
      answer:
        "Ja, det er en stor del af mit arbejde. Pensionistklip har ekstra tid, så vi ikke skal skynde os. Jeg klipper gerne siddende, også ved gangbesvær, rollator eller i kørestol. Pårørende booker ofte på vegne af mor eller far.",
    },
    {
      question: "Klipper du børn hjemme?",
      answer: `Ja. Børneklip er til børn under 12 år og foregår i barnets eget hjem og i barnets tempo. Der er ingen fremmede stole og ingen ventetid i en salon. Book børneklip online, eller ring på ${config.phone}.`,
    },
    {
      question: "Hvad skal jeg have klar, inden du kommer?",
      answer:
        "En stol med plads til at gå rundt (kørestol er fint). Håret må gerne være tørt, medmindre du selv har vasket det. Frisøren har sakse, kappe, gulvtæppe og spejl med og fejer op bagefter. Der skal ikke støvsuges.",
    },
    {
      question: "Hvad koster det at få dig hjem?",
      answer: `Klipningen har en fast pris, og oven i kommer et kørselstillæg efter afstanden. De første ${config.travel.freeRadiusKm} km er gratis. Flere samme sted: ${formatDkk(FAMILY_EXTRA_PERSON_DISCOUNT_KR)} rabat pr. ekstra person, og kørsel kun én gang. Du ser altid den samlede, låste pris, før du bekræfter.`,
    },
    {
      question: "Hvor langt kører du ud?",
      answer: `Jeg kører op til ${config.travel.maxServiceRadiusKm} km fra ${config.home.city}, hvilket dækker Amager, Tårnby, Dragør og store dele af København. Bor du længere væk, er du velkommen til at ringe — så finder vi måske alligevel en dag, der passer.`,
    },
    {
      question: "Hvordan betaler jeg?",
      answer: `Du betaler med MobilePay, når du booker — til ${config.mobilePay}. Tiden bekræftes, når beløbet er sendt. Pårørende kan få faktura. Prisen er den, du så i bookingen.`,
    },
    {
      question: "Kan jeg booke en tid til min mor eller far?",
      answer:
        "Ja. Sæt kryds i «Jeg booker for en pårørende»: deres adresse, dit telefonnummer. Du kan få faktura, fast tid hver 4. eller 6. uge og e-mail dagen før.",
    },
    {
      question: "Kommer du på plejehjem og bosteder?",
      answer: `Ja. Book et besøg med antal beboere — I betaler kun kørsel én gang og får én faktura. Fast ugedag. Eller ring til ${config.phone}.`,
    },
    {
      question: "Kan jeg ringe i stedet for at booke på nettet?",
      answer: `Det kan du bestemt. Ring til mig på ${config.phone}, så finder vi en tid sammen. Får du ikke fat i mig, er jeg formodentlig midt i en klipning — læg en besked, så ringer jeg tilbage.`,
    },
    {
      question: "Hvad hvis jeg bliver syg og må aflyse?",
      answer: `Aflyser du mindst ${config.cancelFreeHours} timer før, betaler du intet. Aflyser du senere, er gebyret ${config.lateCancelFeeKr} kr. Har du allerede betalt, refunderes resten. Du får et afbuds-link i din bekræftelse.`,
    },
  ];
}

export function faqSchema(config: AppConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems(config).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
