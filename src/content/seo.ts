export type FaqItem = {
  question: string;
  answer: string;
};

export type PageSeo = {
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  paragraphs: string[];
  faq: FaqItem[];
};

export const homeSeo: PageSeo = {
  title: "Udekørende frisør Kastrup – hjemmeklip",
  description:
    "Hjemmeklip i Kastrup og omegn. Mobil frisør kører hjem til dig: klip 350 kr, pensionistklip 325 kr, børneklip 225 kr. Se prisen og book.",
  h1: "Frisør der kører hjem til dig",
  keywords: [
    "hjemmeklip",
    "hjemmeklip Kastrup",
    "udekørende frisør",
    "mobil frisør Kastrup",
    "frisør der kommer hjem til dig",
    "hjemmefrisør København",
    "pensionistklip hjemme",
    "børneklip hjemme",
    "frisør 2770 Kastrup",
    "frisør til ældre",
    "mobil frisør Amager",
    "book hjemmeklip",
  ],
  paragraphs: [
    "Kørefrisøren er udekørende frisør med base i Kastrup, 2770. Du booker et hjemmeklip, skriver adressen, og jeg kommer med sakse, maskine, kappe og tæppe. Du skal kun finde en stol frem.",
    "Det passer til dig, der hellere sidder i egen stue end i en salon. Det passer også til pårørende, der booker for mor, far eller bedsteforældre — og til børn, der er tryggere hjemme.",
    "Klip koster 350 kr og tager 45 minutter. Pensionistklip er 325 kr og 50 minutter, med ro og ekstra tid. Jeg klipper gerne siddende, også ved gangbesvær, rollator eller i kørestol. Børneklip til under 12 år er 225 kr og 30 minutter, i barnets tempo.",
    "Til klippet kan du vælge skægklip (150 kr), pandehår (75 kr) eller retning af bryn (75 kr). Kørsel vises, før du bekræfter: 0–5 km er 0 kr, derefter 49, 99 eller 149 kr ud til 30 km. Flere personer samme sted: kørsel kun én gang, og 50 kr rabat per ekstra person.",
    "Jeg kører i Kastrup, Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Du betaler med MobilePay, når du booker — inden jeg kører. Pårørende kan få faktura. Afbud mindst 24 timer før er gratis; ellers 100 kr.",
  ],
  faq: [
    {
      question: "Kommer du helt hjem til mig?",
      answer:
        "Ja. Jeg klipper i hus, lejlighed, ældrebolig eller på plejehjem. Alt udstyr er med.",
    },
    {
      question: "Hvad koster hjemmeklip?",
      answer:
        "Klip 350 kr, pensionistklip 325 kr, børneklip 225 kr plus kørsel efter afstand. Du ser den samlede pris, før du bekræfter.",
    },
    {
      question: "Klipper du ældre og i kørestol?",
      answer: "Ja. Pensionistklip har ekstra tid, og jeg klipper gerne siddende.",
    },
    {
      question: "Hvordan betaler jeg?",
      answer: "Med MobilePay, når du booker. Pårørende kan få faktura.",
    },
    {
      question: "Hvor kører du hen?",
      answer:
        "Op til 30 km fra Kastrup — blandt andet Amager, Tårnby, Dragør, Valby og Frederiksberg.",
    },
  ],
};

export const priserSeo: PageSeo = {
  title: "Priser på hjemmeklip og kørsel",
  description:
    "Klip 350 kr, pensionistklip 325 kr, børneklip 225 kr. Kørsel 0–149 kr efter km. Tillæg til skæg, pandehår og bryn. Se den låste pris, før du booker.",
  h1: "Priser på hjemmeklip, tillæg og kørsel",
  keywords: [
    "hjemmeklip pris",
    "frisør hjemme pris",
    "klip 350 kr",
    "pensionistklip pris",
    "børneklip hjemme pris",
    "kørselstillæg frisør",
    "mobil frisør pris Kastrup",
    "hvad koster udekørende frisør",
    "skægklip tillæg",
    "hjemmeklip København pris",
  ],
  paragraphs: [
    "Prisen består af behandlingen og et kørselstillæg efter afstanden fra Kastrup. Du ser begge dele — og det samlede beløb — inden du bekræfter bookingen. Der er ingen skjulte gebyrer bagefter.",
    "Hovedbehandlinger: klip 350 kr (45 min), pensionistklip 325 kr (50 min) og børneklip 225 kr (30 min, under 12 år). Tillæg vælges sammen med et klip: skægklip 150 kr, pandehår 75 kr og retning af bryn 75 kr (hver 15 min).",
    "Kørsel: 0–5 km 0 kr, 5–10 km 49 kr, 10–20 km 99 kr, 20–30 km 149 kr. Længere end 30 km kører jeg ikke som standard. Flere i samme hjem: kørsel tælles kun én gang, og hver ekstra person får 50 kr rabat.",
    "Plejehjem og bosteder har ikke en online-pris. Her aftaler vi flere beboere samme dag, én kørsel, én faktura og gerne fast ugedag.",
    "Du betaler med MobilePay, når du booker, inden jeg kører. Pårørende kan få faktura. Afbud mindst 24 timer før er gratis; senere afbud koster 100 kr.",
  ],
  faq: [
    {
      question: "Er kørsel inkluderet i 350 kr?",
      answer:
        "Nej. Klippet har fast pris; kørsel kommer oveni efter km og vises før bekræftelse.",
    },
    {
      question: "Hvornår er kørsel gratis?",
      answer: "Inden for 5 km fra Kastrup.",
    },
    {
      question: "Hvad koster det, hvis vi er to?",
      answer: "Kørsel én gang plus 50 kr rabat til den ekstra person.",
    },
    {
      question: "Kan jeg se prisen, før jeg betaler?",
      answer: "Ja. Totalen er låst, før du bekræfter og betaler med MobilePay.",
    },
    {
      question: "Hvad koster afbud?",
      answer: "Gratis ved afbud mindst 24 timer før, ellers 100 kr.",
    },
    {
      question: "Hvorfor står der ikke pris på plejehjem?",
      answer:
        "Fordi det afhænger af antal beboere og dag. Kontakt via booking til plejehjem.",
    },
  ],
};

export const behandlingerSeo: PageSeo = {
  title: "Behandlinger: klip, pensionist og børn",
  description:
    "Hjemmeklip hos Kørefrisøren: klip, pensionistklip og børneklip. Tillæg til skæg, pandehår og bryn. Alt foregår i dit hjem i Kastrup og omegn.",
  h1: "Behandlinger — hjemmeklip til voksne, ældre og børn",
  keywords: [
    "hjemmeklip behandlinger",
    "klip hjemme",
    "pensionistklip",
    "børneklip hjemme",
    "skægklip hjemme",
    "pandehår klip",
    "retning af bryn",
    "udekørende frisør behandlinger",
    "mobil frisør Kastrup",
    "frisør til ældre",
  ],
  paragraphs: [
    "Alle behandlinger er hjemmebesøg. Jeg tager sakse, maskine, kappe, tæppe og produkter med. Du skal ikke vaske hår, medmindre du selv vil. En stol med plads rundt om er nok — kørestol er fint.",
    "Vælg mellem tre klip: almindeligt klip til 350 kr, pensionistklip til 325 kr med ekstra tid, og børneklip til 225 kr for børn under 12. Tillæg er skægklip, pandehår og retning af bryn. De bookes sammen med et klip, ikke alene.",
    "Pensionistklippet er tænkt til dem, der har brug for ro: gangbesvær, rollator, kørestol, sygdom eller bare lyst til at blive siddende i stuen. Børneklippet foregår i barnets hjem og tempo — uden fremmed salon og uden kø.",
    "Farve, permanent og salonbehandlinger tilbyder jeg ikke. Fokus er klip, der kan laves ordentligt ved et spisebord eller i en lænestol.",
    "Jeg kører fra Kastrup op til 30 km: Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Book den behandling, du skal bruge. Kørsel og total vises, før du betaler.",
  ],
  faq: [
    {
      question: "Hvilke behandlinger kan jeg booke?",
      answer:
        "Klip, pensionistklip og børneklip, plus tillæg til skæg, pandehår og bryn.",
    },
    {
      question: "Laver du farve eller føntørring som i salon?",
      answer: "Nej. Jeg klipper hjemme med saks og maskine.",
    },
    {
      question: "Skal tillæg bookes alene?",
      answer: "Nej. Skæg, pandehår og bryn vælges sammen med et klip.",
    },
    {
      question: "Hvad er forskellen på klip og pensionistklip?",
      answer: "Pensionistklip er 50 min og 325 kr, med ekstra tid og ro, også siddende.",
    },
    {
      question: "Kan jeg booke til et barn?",
      answer: "Ja, børneklip til under 12 år, 225 kr, 30 min.",
    },
  ],
};

export const omraadeSeo: PageSeo = {
  title: "Hjemmeklip i Kastrup og København",
  description:
    "Udekørende frisør fra Kastrup, 2770. Kører til Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Max 30 km. Se zoner og book.",
  h1: "Hvor jeg kører hen",
  keywords: [
    "hjemmeklip Kastrup",
    "mobil frisør Amager",
    "udekørende frisør København",
    "hjemmeklip Tårnby",
    "hjemmeklip Dragør",
    "frisør 2770",
    "frisør Ørestad",
    "hjemmeklip Valby",
    "mobil frisør Frederiksberg",
    "frisør København S",
    "kørselszone frisør",
  ],
  paragraphs: [
    "Kørefrisøren har base i Kastrup, postnummer 2770. Derfra kører jeg som mobil frisør op til 30 km. Du booker med din adresse, og kørselsprisen vises, før du bekræfter.",
    "Områderne er Kastrup og Tårnby (2770), Dragør (2791), Amager og København S (2300, 2450), Ørestad (2300), Valby (2500) og Frederiksberg (1800, 2000). Inden for 5 km er kørsel 0 kr. 5–10 km koster 49 kr, 10–20 km 99 kr, 20–30 km 149 kr.",
    "Kastrup og store dele af Tårnby ligger ofte i den gratis zone. Dragør, Ørestad og indre Amager ligger typisk i 49- eller 99-kr-zonen. Valby og Frederiksberg ligger oftere længere ude, så tillægget kan være 99 eller 149 kr. Den præcise zone afhænger af din adresse, ikke af bynavnet alene.",
    "Jeg klipper i huse, lejligheder, ældreboliger og på plejehjem. Trapper uden elevator er okay, hvis du skriver det i noten, så jeg ved, hvad jeg kommer til.",
    "Bor du uden for 30 km, er det ikke en almindelig online-booking. Start bookingen med adressen — den viser, om jeg kommer.",
  ],
  faq: [
    {
      question: "Kører du til mit postnummer?",
      answer: "Hvis du er inden for 30 km fra Kastrup, ja. Bookingen viser det på adressen.",
    },
    {
      question: "Er Kastrup altid gratis kørsel?",
      answer:
        "De første 5 km er 0 kr. De fleste adresser i 2770 ligger der, men det er afstanden, der tæller.",
    },
    {
      question: "Kører du til Frederiksberg?",
      answer: "Ja, inden for 30 km. Tillægget er ofte 99 eller 149 kr.",
    },
    {
      question: "Hvad med Islands Brygge eller Sundby?",
      answer: "Det er Amager / København S — typisk inden for radius.",
    },
    {
      question: "Kan I være flere samme sted?",
      answer: "Ja. Kørsel én gang, 50 kr rabat per ekstra person.",
    },
  ],
};

export const forParorendeSeo: PageSeo = {
  title: "Book frisør til mor eller far",
  description:
    "Pårørende kan booke hjemmeklip til mor, far eller bedsteforældre. Deres adresse, din telefon, faktura til dig. Pensionistklip 325 kr. Book tid.",
  h1: "Book hjemmeklip til en pårørende",
  keywords: [
    "book frisør til mor",
    "frisør til ældre",
    "pårørende hjemmeklip",
    "pensionistklip hjemme",
    "frisør kommer hjem til far",
    "udekørende frisør pårørende",
    "faktura frisør ældre",
    "frisør kørestol",
    "hjemmeklip bedsteforældre",
    "mobil frisør til ældre",
  ],
  paragraphs: [
    "Det er ofte en datter, en søn eller et barnebarn, der tager fat, når mor eller far ikke længere kommer afsted til frisøren. Hos Kørefrisøren booker du med deres adresse og dit telefonnummer. Du kan få faktura. De skal bare sidde klar i stolen, når jeg kommer.",
    "Pensionistklip er 325 kr og 50 minutter. Jeg klipper gerne siddende, også ved gangbesvær, rollator eller i kørestol. Almindeligt klip er 350 kr, hvis det passer bedre. Kørsel fra Kastrup vises, før du bekræfter: 0–149 kr efter km, max 30 km.",
    "Du betaler med MobilePay, når du booker, eller du kan få faktura. Afbud mindst 24 timer før er gratis; ellers 100 kr. Dagen før kan der sendes besked, så I husker tiden.",
    "Jeg kører til Kastrup, Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Bor de på plejehjem eller bosted, og skal flere klippes samme dag, så brug booking til plejehjem: én kørsel, én faktura, fast ugedag.",
    "I skal ikke rydde hele stuen. En stol, og gerne en note om dørkode, etage og om der er elevator. Jeg har sakse, maskine, kappe og tæppe med og fejer op.",
  ],
  faq: [
    {
      question: "Skal den ældre selv booke?",
      answer: "Nej. Du kan booke på vegne af dem.",
    },
    {
      question: "Kan jeg få faktura i stedet for MobilePay?",
      answer: "Ja. Pårørende kan få faktura.",
    },
    {
      question: "Hvad hvis mor sidder i kørestol?",
      answer: "Det er fint. Pensionistklip, siddende.",
    },
    {
      question: "Kan vi få fast tid hver 6. uge?",
      answer:
        "Spørg i noten eller book næste tid, når I har prøvet det første besøg. Gentagelse kan aftales.",
    },
    {
      question: "Hvad skal der stå i noten?",
      answer: "Dørkode, etage, elevator, og om de har brug for ekstra ro.",
    },
    {
      question: "Hvad koster det for mig som pårørende?",
      answer:
        "Samme priser: behandling plus kørsel. Du ser totalen før bekræftelse.",
    },
  ],
};

export const saadanSeo: PageSeo = {
  title: "Sådan foregår et hjemmeklip",
  description:
    "Book, se prisen, betal med MobilePay, og frisøren kører hjem til dig. Stol klar. Saks, maskine og tæppe med. Afbud 24 timer før er gratis.",
  h1: "Sådan foregår et hjemmeklip",
  keywords: [
    "hvordan foregår hjemmeklip",
    "udekørende frisør sådan",
    "mobil frisør forløb",
    "hvad skal jeg have klar frisør",
    "hjemmeklip trin for trin",
    "betaling hjemmeklip MobilePay",
    "afbud hjemmeklip",
    "frisør kommer hjem hvordan",
    "book hjemmeklip",
  ],
  paragraphs: [
    "Først vælger du behandling: klip, pensionistklip eller børneklip, og evt. tillæg. Derefter skriver du adressen. Du ser klippets pris og kørselstillægget, før du bekræfter. Der er ingen efterregning, når jeg står i stuen.",
    "Du betaler med MobilePay, når du booker — inden jeg kører. Pårørende kan få faktura. Tiden er først på plads, når betalingen er sendt efter den aftale, bookingen viser.",
    "Inden besøget skal I finde en stol med plads rundt om. Håret må gerne være tørt. I behøver ikke støvsuge på forhånd. Jeg har sakse, maskine, kappe, tæppe og produkter med. Jeg fejer op bagefter.",
    "Jeg kører fra Kastrup og kommer til den tid, I har booket. Skriv dørkode, etage og parkering i noten, hvis det er svært at finde ind. Er det til en pårørende, møder jeg den, der skal klippes, på deres adresse.",
    "Afbud mindst 24 timer før er gratis. Senere afbud koster 100 kr. I får et afbuds-link i bekræftelsen.",
  ],
  faq: [
    {
      question: "Hvad skal jeg have klar?",
      answer: "En stol. Gerne tørt hår. Dørkode i noten, hvis der er en.",
    },
    {
      question: "Hvornår betaler jeg?",
      answer: "Med MobilePay, når du booker, inden jeg kører.",
    },
    {
      question: "Kommer du med eget tæppe?",
      answer: "Ja. Saks, maskine, kappe og tæppe er med.",
    },
    {
      question: "Rydder du op?",
      answer: "Jeg fejer hår op. I skal ikke støvsuge for min skyld.",
    },
    {
      question: "Hvad hvis jeg bliver syg?",
      answer: "Aflys mindst 24 timer før — så koster det ikke. Ellers 100 kr.",
    },
    {
      question: "Hvor lang tid tager det hele?",
      answer:
        "Klip 45 min, pensionist 50 min, barn 30 min, plus den tid det tager at komme ind og pakke sammen.",
    },
  ],
};

export const omMigSeo: PageSeo = {
  title: "Om mig – udekørende frisør i Kastrup",
  description:
    "Kørefrisøren er udekørende frisør med over 4 års erfaring og base i Kastrup, 2770. Hjemmeklip til ældre, familier og børn. Ingen salon — jeg kører til dig.",
  h1: "Om mig — frisør der kører hjem til dig",
  keywords: [
    "Kørefrisøren",
    "udekørende frisør Kastrup",
    "mobil frisør om",
    "hjemmefrisør København",
    "frisør der kører hjem",
    "frisør 2770",
    "hjemmeklip erfaring",
    "udekørende frisør Amager",
    "hvem er Kørefrisøren",
    "frisør uden salon",
  ],
  paragraphs: [
    "Jeg er Kørefrisøren: udekørende frisør med base i Kastrup, 2770, og over fire års erfaring. Der er ingen salonstol og intet venteværelse. Arbejdspladsen er din stue, dit køkken eller fællesrummet på et plejehjem.",
    "Jeg klipper dem, der ikke vil eller ikke kan komme afsted: ældre med gangbesvær, mennesker i kørestol, børn der er tryggere hjemme, og folk der bare hellere sidder i egen sofa. Pårørende booker ofte, og det er en naturlig del af hverdagen.",
    "Behandlingerne er klip, pensionistklip og børneklip, plus små tillæg til skæg, pandehår og bryn. Jeg farver ikke og lover ikke salon-styling. Jeg lover at komme til tiden, klippe i roligt tempo og rydde op efter mig.",
    "Jeg kører op til 30 km fra Kastrup — Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Du ser prisen, før du bekræfter, og betaler med MobilePay, når du booker.",
    "Hvis du vil vide, hvem der kommer ind ad døren: det er én frisør, samme person, med eget udstyr i bilen.",
  ],
  faq: [
    {
      question: "Har du en salon?",
      answer: "Nej. Jeg kører hjem til dig.",
    },
    {
      question: "Hvor længe har du klippet?",
      answer: "Over 4 år.",
    },
    {
      question: "Hvor kører du fra?",
      answer: "Kastrup, 2770.",
    },
    {
      question: "Klipper du kun ældre?",
      answer:
        "Nej. Også almindeligt klip og børn under 12. Ældre er en stor del af arbejdet.",
    },
    {
      question: "Kan jeg møde dig i en salon først?",
      answer: "Nej. Første møde er hjemme hos dig, når du har booket.",
    },
  ],
};

export const kontaktSeo: PageSeo = {
  title: "Kontakt – book hjemmeklip",
  description:
    "Kontakt udekørende frisør i Kastrup. Book hjemmeklip online — det er den hurtigste vej. Plejehjem booker særskilt. Se områder og priser først, hvis du vil.",
  h1: "Kontakt",
  keywords: [
    "kontakt udekørende frisør",
    "kontakt hjemmeklip",
    "book frisør Kastrup",
    "mobil frisør kontakt",
    "frisør 2770 kontakt",
    "book hjemmeklip online",
    "plejehjem frisør kontakt",
    "Kørefrisøren kontakt",
    "udekørende frisør København kontakt",
  ],
  paragraphs: [
    "Den hurtigste måde at få en tid på er at booke online. Du vælger behandling, skriver adressen, ser klip plus kørsel, og betaler med MobilePay, inden jeg kører. Pårørende kan booke for andre og få faktura.",
    "Jeg er udekørende frisør med base i Kastrup, 2770, og kører op til 30 km: Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Er du i tvivl om zonen, så start bookingen med adressen — den viser, om jeg kommer, og hvad kørsel koster.",
    "Til plejehjem og bosteder: brug den særskilte booking, når flere beboere skal klippes samme dag. Der er ikke en fast online-pris, fordi det afhænger af antal og ugedag.",
    "Har du spørgsmål til pensionistklip, kørestol, trapper eller børneklip, så læs først siderne om behandlinger og sådan foregår det. De fleste svar står der: stol klar, udstyr med, afbud 24 timer før gratis, ellers 100 kr.",
  ],
  faq: [
    {
      question: "Kan jeg booke uden at ringe?",
      answer: "Ja. Online booking er den primære vej.",
    },
    {
      question: "Hvor ligger I?",
      answer: "Base i Kastrup, 2770. Ingen salon.",
    },
    {
      question: "Hvordan kommer jeg i kontakt om plejehjem?",
      answer: "Via booking til plejehjem.",
    },
    {
      question: "Kan pårørende skrive?",
      answer: "Ja — og de kan booke direkte med faktura.",
    },
    {
      question: "Hvad hvis min adresse er for langt væk?",
      answer: "Radius er 30 km. Bookingen viser, om adressen ligger indenfor.",
    },
  ],
};

export const bookSeo: PageSeo = {
  title: "Book hjemmeklip – udekørende frisør",
  description:
    "Book klip, pensionistklip eller børneklip. Skriv adressen, se kørsel og total, betal med MobilePay. Kørefrisøren kører hjem til dig fra Kastrup.",
  h1: "Book en tid",
  keywords: [
    "book hjemmeklip",
    "book udekørende frisør",
    "book mobil frisør",
    "book klip hjemme",
    "book pensionistklip",
    "book børneklip",
    "MobilePay frisør",
    "book frisør Kastrup",
    "ledige tider hjemmeklip",
    "book frisør der kommer hjem",
  ],
  paragraphs: [
    "Her booker du hjemmeklip hos Kørefrisøren. Vælg klip (350 kr, 45 min), pensionistklip (325 kr, 50 min) eller børneklip (225 kr, 30 min). Læg skæg, pandehår eller bryn til, hvis du vil. Skriv adressen, så du ser kørsel: 0 kr inden for 5 km, derefter 49, 99 eller 149 kr op til 30 km.",
    "Flere personer samme sted: kørsel tælles én gang, og hver ekstra person får 50 kr rabat. Booker du for en pårørende, bruger du deres adresse og dit telefonnummer. Faktura er muligt til pårørende.",
    "Du betaler med MobilePay, når du booker — inden jeg kører. Tiden er først låst, når betalingen følger den proces, du ser på siden. Afbud mindst 24 timer før er gratis; ellers 100 kr.",
    "Jeg kører fra Kastrup til Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Ligger adressen uden for 30 km, kan bookingen ikke gennemføres som almindeligt hjemmebesøg.",
    "Til plejehjem og bosteder: brug den anden formular, når flere beboere skal klippes samme dag.",
  ],
  faq: [
    {
      question: "Hvornår trækker I penge?",
      answer: "Du betaler med MobilePay, når du booker, inden jeg kører.",
    },
    {
      question: "Kan jeg booke til i morgen?",
      answer: "Der skal være mindst 24 timers varsel.",
    },
    {
      question: "Hvad hvis adressen ikke virker?",
      answer:
        "Tjek stavning og postnummer. Uden for 30 km kan jeg ikke tage imod.",
    },
    {
      question: "Kan jeg tilføje skæg bagefter?",
      answer: "Tillæg vælges i bookingen sammen med klippet.",
    },
    {
      question: "Hvor booker jeg plejehjem?",
      answer: "På siden til plejehjem — ikke i den almindelige kalender.",
    },
    {
      question: "Får jeg bekræftelse?",
      answer: "Ja, efter bookingen, med tid og afbuds-link.",
    },
  ],
};

export const plejehjemSeo: PageSeo = {
  title: "Frisør til plejehjem og bosted",
  description:
    "Frisør til plejehjem og bosted: flere beboere samme dag, én kørsel, én faktura, fast ugedag. Ingen online-pris. Send antal og sted fra Kastrup-området.",
  h1: "Book frisør til plejehjem eller bosted",
  keywords: [
    "frisør plejehjem Amager",
    "frisør til plejehjem",
    "udekørende frisør bosted",
    "frisør ældrebolig",
    "frisør kommer på plejehjem",
    "mobil frisør plejehjem",
    "fast frisør plejehjem",
    "klip beboere samme dag",
    "frisør Kastrup plejehjem",
    "book frisør institution",
  ],
  paragraphs: [
    "På plejehjem, bosteder og ældreboliger klipper jeg flere beboere samme dag. I betaler kun kørsel én gang og får én faktura. Gerne fast ugedag, så beboerne ved, hvornår frisøren kommer.",
    "Der er ikke en online-pris, fordi det afhænger af antal beboere, tempo og om der klippes i fællesrum eller på stuerne. Pensionistklip i privat hjem er 325 kr — her aftaler vi et besøg, der passer til huset. Skriv antal, adresse og om I vil have en fast dag.",
    "Jeg kører fra Kastrup, 2770, op til 30 km: Amager, Tårnby, Dragør, Ørestad, København S, Valby og Frederiksberg. Kørsel følger samme zoner som privat (0–149 kr), men deles på hele holdet den dag.",
    "Beboerne skal ikke ind i en salon. Jeg har sakse, maskine, kappe og tæppe med. Jeg klipper gerne siddende, også i kørestol. Personalet eller pårørende kan være med, hvis beboeren vil det.",
    "Privatpersoner, der kun skal bruge ét klip hjemme, booker den almindelige tid. Denne side er til institutioner og fælles besøg.",
  ],
  faq: [
    {
      question: "Hvorfor er der ingen pris på siden?",
      answer: "Fordi antal beboere og tid varierer. I får én samlet aftale.",
    },
    {
      question: "Betaler hver beboer selv?",
      answer: "Nej. Én faktura til huset eller kommunen, som I aftaler.",
    },
    {
      question: "Kan I få hver anden tirsdag?",
      answer: "Ja. Fast ugedag er meningen.",
    },
    {
      question: "Klipper du på stuen hos beboeren?",
      answer: "Ja, eller i et fællesrum — det I foretrækker.",
    },
    {
      question: "Dækker du plejehjem på Amager?",
      answer: "Ja, inden for 30 km fra Kastrup.",
    },
    {
      question: "Kan pårørende booke én beboer?",
      answer:
        "Ja, som almindeligt pensionistklip på beboerens adresse — eller I samler flere på denne side.",
    },
  ],
};

export type ServiceSeo = PageSeo & {
  points: string[];
};

export const serviceSeo: Record<string, ServiceSeo> = {
  klip: {
    title: "Klip hjemme hos dig – 350 kr",
    description:
      "Almindeligt klip hjemme: 350 kr, 45 min. Saks og maskine i din stue. Kørsel vises før booking. Book hjemmeklip i Kastrup og København.",
    h1: "Klip hjemme hos dig",
    keywords: [
      "klip hjemme",
      "hjemmeklip",
      "hjemmeklip pris",
      "udekørende frisør klip",
      "mobil frisør klip",
      "frisør kommer hjem",
      "klip 350 kr",
      "hjemmeklip Kastrup",
      "hjemmefrisør København",
      "book klip hjemme",
    ],
    paragraphs: [
      "Et klip hos Kørefrisøren er 350 kr og 45 minutter. Det er saks og maskine, tilpasset dit hår, ved dit eget bord eller i din stol. Du slipper for at komme afsted, parkere og vente i en salon.",
      "Jeg kører fra Kastrup. Inden du bekræfter, ser du kørselstillægget for din adresse: gratis inden for 5 km, derefter 49, 99 eller 149 kr op til 30 km. Er I flere, tælles kørsel kun én gang, og den ekstra person får 50 kr rabat.",
      "Til klippet kan du lægge skægklip til 150 kr, pandehår til 75 kr eller retning af bryn til 75 kr. Betaling er MobilePay, når du booker — inden jeg kører. Pårørende kan få faktura, hvis de booker for dig.",
      "Du skal have en stol klar og plads til, at jeg kan gå rundt. Håret må gerne være tørt. Jeg har kappe, tæppe og produkter med og fejer op bagefter.",
      "Klippet passer til voksne i Kastrup, Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Har du brug for ekstra tid eller sidder du bedst i kørestol, så vælg pensionistklip i stedet. Er det et barn under 12, vælg børneklip.",
    ],
    points: [
      "350 kr, 45 minutter, saks og maskine.",
      "Du sidder i din egen stol — ingen salon, ingen ventetid.",
      "Kørsel vises, før du bekræfter. De første 5 km er 0 kr.",
      "Skæg, pandehår eller bryn kan lægges til samme besøg.",
    ],
    faq: [
      {
        question: "Hvad indgår i de 350 kr?",
        answer: "Selve klippet, 45 min, saks og maskine. Kørsel kommer oveni.",
      },
      {
        question: "Kan jeg få skæg med?",
        answer: "Ja, som tillæg på 150 kr og 15 min.",
      },
      {
        question: "Skal håret være vasket?",
        answer:
          "Gerne tørt. Vask selv, hvis du vil — jeg medbringer det, jeg skal bruge til klippet.",
      },
      {
        question: "Klipper du både damer og herrer?",
        answer: "Ja. Klippet tilpasses håret, ikke en salonstol.",
      },
      {
        question: "Hvad hvis jeg har svært ved at sidde længe?",
        answer: "Vælg pensionistklip — 50 min og roligere tempo.",
      },
    ],
  },
  pensionistklip: {
    title: "Pensionistklip hjemme – 325 kr",
    description:
      "Pensionistklip hjemme: 325 kr, 50 min. Rolig klipning siddende — også ved gangbesvær eller i kørestol. Pårørende kan booke og få faktura.",
    h1: "Pensionistklip hjemme — med ekstra tid",
    keywords: [
      "pensionistklip hjemme",
      "frisør til ældre",
      "udekørende frisør pensionist",
      "hjemmeklip ældre",
      "frisør kørestol",
      "frisør gangbesvær",
      "pårørende book frisør",
      "pensionistklip Kastrup",
      "frisør kommer hjem til pensionist",
      "mobil frisør ældre",
    ],
    paragraphs: [
      "Pensionistklip koster 325 kr og tager 50 minutter. Det er den behandling, jeg bruger mest tid på: ældre, der ikke kører, har svært ved trapper, eller bare vil blive i stolen derhjemme.",
      "Jeg klipper gerne siddende. Kørestol, rollator og gangbesvær er hverdag, ikke et særtilfælde. Vi skynder os ikke. Du behøver ikke ud ad døren, i bus eller op ad salonens trin.",
      "Pårørende booker ofte for mor, far eller bedsteforældre. I bookingen kan I markere, at det er til en pårørende: deres adresse, jeres telefon, og faktura til jer. Betaling kan ske med MobilePay ved booking, eller I kan få faktura.",
      "Jeg kører fra Kastrup, 2770, op til 30 km — Kastrup, Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg. Kørsel vises, før I bekræfter. De første 5 km er 0 kr.",
      "I skal kun finde en stol frem. Jeg har sakse, maskine, kappe og tæppe med. Afbud mindst 24 timer før er gratis; ellers 100 kr. Bor personen på plejehjem, og skal flere klippes samme dag, så brug booking til plejehjem.",
    ],
    points: [
      "325 kr og 50 minutter — ekstra tid, ikke mindre klip.",
      "Jeg klipper, hvor du sidder, også i kørestol.",
      "Pårørende kan booke og få faktura.",
      "Jeg kommer også i ældreboliger og på plejehjem.",
    ],
    faq: [
      {
        question: "Hvorfor er pensionistklip billigere end almindeligt klip?",
        answer: "Det er en fast pris på 325 kr med 50 minutter — ekstra tid, ikke mindre klip.",
      },
      {
        question: "Klipper du i kørestol?",
        answer: "Ja. Personen bliver siddende.",
      },
      {
        question: "Kan jeg booke for min mor?",
        answer: "Ja. Brug «jeg booker for en pårørende» og få evt. faktura.",
      },
      {
        question: "Skal hun vaske hår først?",
        answer: "Gerne tørt hår. I behøver ikke gøre stuen klar ud over en stol.",
      },
      {
        question: "Kommer du på ældrebolig?",
        answer: "Ja, samme hjemmeklip — hus, lejlighed eller ældrebolig.",
      },
      {
        question: "Hvad med trapper uden elevator?",
        answer: "Sig det i noten ved booking, så vi planlægger besøget rigtigt.",
      },
    ],
  },
  boerneklip: {
    title: "Børneklip hjemme – 225 kr",
    description:
      "Børneklip til under 12 år: 225 kr, 30 min, i barnets hjem og tempo. Ingen salon, ingen ventetid. Book hjemmeklip i Kastrup og omegn.",
    h1: "Børneklip hjemme — i barnets tempo",
    keywords: [
      "børneklip hjemme",
      "børneklip Kastrup",
      "frisør børn hjemme",
      "hjemmeklip barn",
      "mobil frisør børn",
      "børneklip 225 kr",
      "frisør der kommer hjem børn",
      "børneklip Amager",
      "trygt børneklip",
      "book børneklip",
    ],
    paragraphs: [
      "Børneklip er til børn under 12 år. Prisen er 225 kr, tiden er 30 minutter, og det foregår i barnets eget hjem. Der er ingen fremmede stole, ingen spejle i en række og ingen ventetid i en salon.",
      "Nogle børn sidder stille ved køkkenbordet. Andre har brug for pause, en iPad eller at en forælder sidder ved siden af. Vi tager det i barnets tempo. Jeg har sakse, maskine, kappe og tæppe med. I skal have en stol klar.",
      "Jeg kører fra Kastrup til Tårnby, Dragør, Amager, Ørestad, København S, Valby og Frederiksberg — op til 30 km. Kørsel vises, før du bekræfter. Flere børn eller et barn plus en voksen samme sted: kørsel kun én gang, og 50 kr rabat per ekstra person.",
      "Du betaler med MobilePay, når du booker. Afbud mindst 24 timer før er gratis; ellers 100 kr.",
      "Børneklip er et klip. Farve og salonstyling laver jeg ikke. Skæg og bryn er tillæg til voksenklip, ikke til børneklippet.",
    ],
    points: [
      "225 kr, 30 minutter, børn under 12 år.",
      "I barnets hjem og i barnets tempo — ingen salon.",
      "Flere børn samme sted: kørsel kun én gang.",
      "En forælder kan sidde ved siden af hele tiden.",
    ],
    faq: [
      {
        question: "Hvor gammel skal barnet være?",
        answer: "Børneklip er til under 12 år. 12 år og derover booker almindeligt klip.",
      },
      {
        question: "Hvad hvis barnet ikke vil sidde stille?",
        answer: "Vi holder pauser. Hjemme er det ofte nemmere end i salon.",
      },
      {
        question: "Kan en forælder også klippes?",
        answer:
          "Ja. Book to behandlinger samme adresse — kørsel én gang, 50 kr rabat til nummer to.",
      },
      {
        question: "Skal håret vaskes?",
        answer: "Gerne tørt. I behøver ikke andet end en stol.",
      },
      {
        question: "Kan jeg booke om eftermiddagen efter skole?",
        answer:
          "Vælg en ledig tid i bookingen. Der er ofte tider efter skole og i weekenden.",
      },
    ],
  },
};

export const areaSeo: Record<string, PageSeo> = {
  kastrup: {
    title: "Hjemmeklip Kastrup 2770 – mobil frisør",
    description:
      "Mobil frisør i Kastrup, 2770. Hjemmeklip tæt på basen — kørsel ofte 0 kr. Klip, pensionistklip og børneklip i dit hjem. Book tid.",
    h1: "Hjemmeklip i Kastrup — udekørende frisør 2770",
    keywords: [
      "hjemmeklip Kastrup",
      "mobil frisør Kastrup",
      "udekørende frisør Kastrup",
      "frisør 2770 Kastrup",
      "frisør der kommer hjem Kastrup",
      "pensionistklip Kastrup",
      "børneklip Kastrup",
      "hjemmefrisør Kastrup",
      "frisør Kastrup hjemme",
      "book frisør Kastrup",
    ],
    paragraphs: [
      "Jeg bor og kører fra Kastrup. Derfor er hjemmeklip i 2770 det tætteste, jeg kommer på en lokal frisør uden salon. Mange adresser i Kastrup ligger inden for 5 km, så kørselstillægget ofte er 0 kr. Du ser det på din adresse, før du betaler.",
      "Klip koster 350 kr, pensionistklip 325 kr, børneklip 225 kr. Jeg kommer med sakse og maskine til stuen, køkkenet eller ældreboligen. Du skal finde en stol frem. Det passer til Kastrup-villaveje, etagebyggeri ved metroen og til dem, der ikke vil ud til en salon tæt på lufthavnen.",
      "Pensionister i Kastrup booker ofte, fordi trapper, rollator eller manglende bil gør salonbesøg tungt. Pårørende kan booke og få faktura. Børn under 12 klippes hjemme i barnets tempo.",
      "Jeg kører også videre til Tårnby, Dragør og resten af Amager, men Kastrup er udgangspunktet. Betaling er MobilePay ved booking. Afbud 24 timer før er gratis.",
    ],
    faq: [
      {
        question: "Er kørsel gratis i hele Kastrup?",
        answer: "Ofte ja, inden for 5 km. Bookingen viser det på husnummeret.",
      },
      {
        question: "Klipper du i lejlighed uden elevator?",
        answer: "Ja. Skriv etagen i noten.",
      },
      {
        question: "Kan jeg få pensionistklip i Kastrup?",
        answer: "Ja, 325 kr og 50 min, også i kørestol.",
      },
      {
        question: "Booker I til ældreboliger i 2770?",
        answer: "Ja, samme priser og samme hjemmebesøg.",
      },
      {
        question: "Hvordan booker jeg?",
        answer:
          "Online med adressen i Kastrup. Du betaler med MobilePay, inden jeg kører.",
      },
    ],
  },
  taarnby: {
    title: "Hjemmeklip Tårnby – udekørende frisør",
    description:
      "Hjemmeklip i Tårnby, 2770. Mobil frisør fra Kastrup til villakvarterer og lejligheder. Klip, pensionist- og børneklip. Kørsel vises før book.",
    h1: "Hjemmeklip i Tårnby",
    keywords: [
      "hjemmeklip Tårnby",
      "mobil frisør Tårnby",
      "udekørende frisør Tårnby",
      "frisør 2770 Tårnby",
      "frisør kommer hjem Tårnby",
      "pensionistklip Tårnby",
      "børneklip Tårnby",
      "hjemmefrisør Tårnby",
      "book hjemmeklip Tårnby",
      "frisør Tårnby hjemme",
    ],
    paragraphs: [
      "Tårnby og Kastrup deler postnummer 2770, og jeg kører derhen som udekørende frisør hver uge. Fra basen i Kastrup er der kort til Tårnby Torv, villavejene og etageboligerne. Mange Tårnby-adresser ligger i 0- eller 49-kr-zonen. Du ser tillægget, før du bekræfter.",
      "Et klip hjemme koster 350 kr. Pensionistklip er 325 kr med 50 minutter — til dig, der helst bliver i stolen, eller til forældre, du booker for. Børneklip under 12 år er 225 kr. Flere i samme hus: kørsel én gang og 50 kr rabat til den næste.",
      "Tårnby har mange, der kører bil til arbejde, og mange der ikke kører længere. Hjemmeklip betyder, at ingen skal finde parkeringsplads ved en salon eller gå med rollator hen ad fortovet. Jeg har udstyret med. I skal have en stol.",
      "Jeg dækker Tårnby inden for 30 km-radiusen, som i praksis er hele kommunen herfra. Betaling med MobilePay ved booking. Pårørende kan få faktura. Afbud 24 timer før er gratis.",
    ],
    faq: [
      {
        question: "Kører du til hele Tårnby?",
        answer: "Ja, inden for 30 km fra Kastrup — det dækker Tårnby.",
      },
      {
        question: "Hvad koster kørsel til Tårnby?",
        answer: "Typisk 0 eller 49 kr. Adressen afgør zonen.",
      },
      {
        question: "Kan vi booke to personer i samme hus?",
        answer: "Ja. Kørsel én gang, 50 kr rabat til ekstra person.",
      },
      {
        question: "Klipper du ældre i Tårnby?",
        answer: "Ja. Pensionistklip, også siddende og i kørestol.",
      },
      {
        question: "Er det den samme frisør hver gang?",
        answer: "Ja. Det er Kørefrisøren, der kommer hjem til jer.",
      },
    ],
  },
  dragoer: {
    title: "Hjemmeklip Dragør – mobil frisør",
    description:
      "Mobil frisør i Dragør, 2791. Hjemmeklip i byen og på Sydamager. Klip, pensionistklip og børneklip i stuen. Se kørsel og book.",
    h1: "Mobil frisør i Dragør — hjemmeklip 2791",
    keywords: [
      "hjemmeklip Dragør",
      "mobil frisør Dragør",
      "udekørende frisør Dragør",
      "frisør 2791",
      "frisør kommer hjem Dragør",
      "pensionistklip Dragør",
      "børneklip Dragør",
      "hjemmefrisør Dragør",
      "frisør Sydamager",
      "book hjemmeklip Dragør",
    ],
    paragraphs: [
      "Dragør ligger syd for Kastrup, postnummer 2791. Jeg kører derned som mobil frisør til både den gamle by, villakvartererne og adresserne ude mod Sydamager. Afstanden fra Kastrup gør, at kørsel ofte er 49 eller 99 kr — stadig inden for 30 km. Du ser beløbet, før du booker.",
      "Klip 350 kr, pensionistklip 325 kr, børneklip 225 kr. I Dragør booker mange ældre, der vil blive hjemme, og familier der ikke vil bruge en formiddag på at køre ind mod Amager Center. Jeg klipper siddende, også ved gangbesvær. Børn under 12 klippes i eget tempo.",
      "Du skal have en stol. Jeg medbringer sakse, maskine, kappe og tæppe. Betaling er MobilePay, når du booker. Pårørende i København kan booke til nogen i Dragør og få faktura.",
      "Plejehjem og bosteder i området kan få flere beboere klippet samme dag: én kørsel, én faktura, fast ugedag.",
    ],
    faq: [
      {
        question: "Kører du til Store Magleby og Sydamager?",
        answer: "Ja, hvis adressen er inden for 30 km. Bookingen viser det.",
      },
      {
        question: "Hvorfor er der kørselstillæg til Dragør?",
        answer:
          "Fordi afstanden fra Kastrup oftest er over 5 km. 5–10 km er 49 kr, 10–20 km 99 kr.",
      },
      {
        question: "Kan jeg booke pensionistklip i Dragør?",
        answer: "Ja, 325 kr og 50 min.",
      },
      {
        question: "Klipper du i gammel Dragør med smalle gader?",
        answer: "Ja. Skriv parkerings- eller dørnote, hvis det hjælper.",
      },
      {
        question: "Må en pårørende betale?",
        answer: "Ja. MobilePay ved booking eller faktura.",
      },
    ],
  },
  amager: {
    title: "Mobil frisør Amager – hjemmeklip",
    description:
      "Udekørende frisør på Amager (2300, 2450). Hjemmeklip, pensionistklip og børneklip i lejlighed eller hus. Kørsel 0–149 kr. Book tid.",
    h1: "Mobil frisør Amager — hjemmeklip på øen",
    keywords: [
      "mobil frisør Amager",
      "hjemmeklip Amager",
      "udekørende frisør Amager",
      "frisør der kommer hjem Amager",
      "pensionistklip Amager",
      "frisør plejehjem Amager",
      "hjemmefrisør Amager",
      "frisør 2300",
      "frisør 2450",
      "børneklip Amager",
    ],
    paragraphs: [
      "Amager er det område, jeg kører mest i uden for selve Kastrup. Postnumre 2300 og 2450 dækker alt fra Sundby og Amagerbro til vest-Amager. Som udekørende frisør kommer jeg op ad trapperne eller ind i stuen, så du ikke skal i salon med bus, metro eller taxa.",
      "Klip 350 kr (45 min), pensionistklip 325 kr (50 min), børneklip 225 kr (30 min). Kørsel fra Kastrup: 0 kr inden for 5 km, derefter 49, 99 eller 149 kr. Sydlige og vestlige Amager-adresser kan ligge i forskellige zoner — derfor vises prisen på den konkrete adresse.",
      "Mange på Amager bor i etagebyggeri. Skriv etage, dørtelefon og om der er elevator. Jeg klipper ældre siddende, også i kørestol, og børn i deres eget hjem. Pårørende booker ofte fra en anden bydel og får faktura.",
      "Jeg tager sakse, maskine, kappe og tæppe med og fejer op. I betaler med MobilePay, inden jeg kører. Afbud 24 timer før er gratis. Til plejehjem på Amager: flere beboere samme dag, én kørsel, én faktura.",
    ],
    faq: [
      {
        question: "Dækker du både 2300 og 2450?",
        answer: "Ja, inden for 30 km fra Kastrup.",
      },
      {
        question: "Klipper du på Amagerbro og Sundby?",
        answer: "Ja. Det er typiske hjemmeklip-adresser.",
      },
      {
        question: "Hvad med trapper uden elevator?",
        answer: "Ja. Skriv etagen, så jeg ved det.",
      },
      {
        question: "Kører du til plejehjem på Amager?",
        answer: "Ja. Brug booking til plejehjem ved flere beboere.",
      },
      {
        question: "Kan jeg se kørsel, før jeg betaler?",
        answer: "Ja. Zonen beregnes på adressen.",
      },
      {
        question: "Er du frisør Amager med salon?",
        answer: "Nej. Jeg er mobil og kommer hjem til dig.",
      },
    ],
  },
  oerestad: {
    title: "Hjemmeklip Ørestad – mobil frisør",
    description:
      "Hjemmeklip i Ørestad, 2300. Mobil frisør til lejligheder med elevator. Klip, pensionist- og børneklip. Kørsel vises, før du booker.",
    h1: "Hjemmeklip i Ørestad",
    keywords: [
      "hjemmeklip Ørestad",
      "mobil frisør Ørestad",
      "udekørende frisør Ørestad",
      "frisør 2300 Ørestad",
      "børneklip Ørestad",
      "frisør kommer hjem Ørestad",
      "hjemmefrisør Ørestad",
      "pensionistklip Ørestad",
      "book hjemmeklip Ørestad",
      "frisør Ørestad lejlighed",
    ],
    paragraphs: [
      "Ørestad er tæt på Kastrup med metro og nye boligblokke. Jeg kører derhen som mobil frisør og klipper i lejligheden — ofte med elevator, nogle gange med barnevogn i gangen og en hverdag, der ikke rummer et salonbesøg mellem arbejde og institution.",
      "Klip 350 kr, pensionistklip 325 kr, børneklip 225 kr. Ørestad ligger typisk i 49- eller 99-kr-zonen fra Kastrup, stadig inden for 30 km. Du ser tillægget på adressen, før du betaler med MobilePay.",
      "Her booker både børnefamilier og ældre i de nyere ældreboliger. Børneklip under 12 år foregår i barnets tempo. Pensionistklip har 50 minutter, siddende, også ved gangbesvær. Skriv dørtelefon og etage i bookingen — Ørestad-blokke kan være svære at finde første gang.",
      "Jeg har alt udstyr med. I skal have en stol og lidt gulvplads. Flere i samme lejlighed: kørsel én gang, 50 kr rabat per ekstra person.",
    ],
    faq: [
      {
        question: "Kører du til Ørestad City, Syd og Nord?",
        answer: "Ja, hvis adressen er inden for 30 km.",
      },
      {
        question: "Skal jeg møde dig i stuen?",
        answer: "Ja. Skriv dørtelefon, opgang og etage.",
      },
      {
        question: "Kan to i lejligheden klippes?",
        answer: "Ja. Kørsel én gang plus 50 kr rabat til den anden.",
      },
      {
        question: "Hvad koster kørsel til Ørestad?",
        answer: "Ofte 49 eller 99 kr — se det i bookingen.",
      },
      {
        question: "Laver du kun klip?",
        answer: "Ja. Klip, pensionistklip, børneklip og små tillæg. Ikke farve.",
      },
    ],
  },
  "koebenhavn-s": {
    title: "Hjemmeklip København S – udekørende frisør",
    description:
      "Udekørende frisør i København S, 2300. Hjemmeklip på Amagerbro, Sundby og Islands Brygge. Klip, pensionist- og børneklip. Book tid.",
    h1: "Hjemmeklip i København S",
    keywords: [
      "hjemmeklip København S",
      "mobil frisør København S",
      "udekørende frisør 2300",
      "hjemmeklip Amagerbro",
      "frisør Islands Brygge hjemme",
      "pensionistklip København S",
      "børneklip Sundby",
      "frisør kommer hjem 2300",
      "hjemmefrisør København S",
      "book frisør København S",
    ],
    paragraphs: [
      "København S, 2300, er den tætte by på Amager: Amagerbro, Sundby, Islands Brygge og de gamle etagekarréer. Som udekørende frisør kommer jeg op med tasken, så du slipper for at finde en salon og en tid, der passer med trapper, børn eller et dårligt ben.",
      "Klip 350 kr, pensionistklip 325 kr, børneklip 225 kr. Fra Kastrup ligger de fleste S-adresser i 49- eller 99-kr-zonen. Max er 30 km og 149 kr. Du ser zonen, før du bekræfter.",
      "Mange ældre i København S bor uden bil og med elevator, der tit er i stykker — eller slet ikke er der. Jeg klipper siddende, også i kørestol. Pårørende kan booke og få faktura. Børn under 12 klippes hjemme, hvor de er trygge.",
      "Skriv opgang, etage og dørtelefon. Jeg medbringer sakse, maskine, kappe og tæppe og fejer op. Betaling med MobilePay ved booking. Afbud 24 timer før er gratis.",
    ],
    faq: [
      {
        question: "Kører du til Islands Brygge?",
        answer: "Ja, inden for 30 km fra Kastrup.",
      },
      {
        question: "Hvad med Amagerbrogade-karréerne?",
        answer: "Ja. Skriv etage og om der er elevator.",
      },
      {
        question: "Kan jeg booke for min far på S-siden?",
        answer: "Ja. Markér, at du booker for en pårørende.",
      },
      {
        question: "Er København S det samme som Amager?",
        answer:
          "Delvist. 2300 dækker både København S og dele af Amager. Vælg den side, der matcher, hvor du bor.",
      },
      {
        question: "Hvordan betaler jeg?",
        answer: "MobilePay, når du booker, inden jeg kører.",
      },
    ],
  },
  valby: {
    title: "Hjemmeklip Valby – mobil frisør",
    description:
      "Mobil frisør i Valby, 2500. Hjemmeklip fra Kastrup inden for 30 km. Klip, pensionistklip og børneklip. Kørsel typisk 99 eller 149 kr. Book.",
    h1: "Hjemmeklip i Valby, 2500",
    keywords: [
      "hjemmeklip Valby",
      "mobil frisør Valby",
      "udekørende frisør Valby",
      "frisør 2500",
      "frisør kommer hjem Valby",
      "pensionistklip Valby",
      "børneklip Valby",
      "hjemmefrisør Valby",
      "book hjemmeklip Valby",
      "frisør Valby hjemme",
    ],
    paragraphs: [
      "Valby ligger på den anden side af København i forhold til Kastrup, men stadig inden for den radius, jeg kører: 30 km. Som mobil frisør tager jeg til 2500, når du hellere vil klippes i Valby-stuen end bruge en halv dag på at komme afsted.",
      "Klip 350 kr, pensionistklip 325 kr, børneklip 225 kr. Kørsel til Valby er oftere 99 kr (10–20 km) eller 149 kr (20–30 km) end den gratis zone. Du ser det nøjagtige tillæg på adressen, før du betaler. Ligger du uden for 30 km, kan du ikke gennemføre en almindelig booking.",
      "Pensionistklip med 50 minutter passer til Valby-ældre, der ikke kører, og til pårørende der booker fra en anden bydel. Børneklip under 12 år er 225 kr i barnets hjem. Flere samme sted: kørsel én gang, 50 kr rabat per ekstra person.",
      "Jeg medbringer udstyr. I skal have en stol. Betaling med MobilePay ved booking. Faktura til pårørende er muligt. Afbud 24 timer før er gratis, ellers 100 kr.",
    ],
    faq: [
      {
        question: "Kører du virkelig til Valby fra Kastrup?",
        answer: "Ja, op til 30 km. De fleste Valby-adresser ligger indenfor.",
      },
      {
        question: "Hvorfor er kørsel dyrere end i Kastrup?",
        answer: "Fordi afstanden er større. 20–30 km koster 149 kr.",
      },
      {
        question: "Kan jeg se prisen, før jeg siger ja?",
        answer: "Ja. Totalen vises, før du bekræfter.",
      },
      {
        question: "Booker I til Valby ældrebolig?",
        answer: "Ja. Pensionistklip, siddende, også i kørestol.",
      },
      {
        question: "Hvad hvis adressen er for langt væk?",
        answer: "Så kan online-bookingen ikke gennemføres. Radius er 30 km.",
      },
    ],
  },
  frederiksberg: {
    title: "Hjemmeklip Frederiksberg – udekørende frisør",
    description:
      "Udekørende frisør på Frederiksberg (1800, 2000). Hjemmeklip i lejligheden. Klip, pensionist- og børneklip. Kørsel fra Kastrup vises før book.",
    h1: "Udekørende frisør på Frederiksberg",
    keywords: [
      "hjemmeklip Frederiksberg",
      "mobil frisør Frederiksberg",
      "udekørende frisør Frederiksberg",
      "frisør 2000 hjemme",
      "frisør 1800",
      "pensionistklip Frederiksberg",
      "frisør kommer hjem Frederiksberg",
      "hjemmefrisør Frederiksberg",
      "book frisør Frederiksberg",
      "frisør til ældre Frederiksberg",
    ],
    paragraphs: [
      "Frederiksberg, 1800 og 2000, er lejligheder, gårde og mange ældre, der helst bliver hjemme. Jeg kører fra Kastrup som udekørende frisør, så længe adressen er inden for 30 km. Kørsel ligger typisk i 99- eller 149-kr-zonen. Du ser beløbet, før du bekræfter.",
      "Klip 350 kr, pensionistklip 325 kr med ekstra tid, børneklip 225 kr til under 12 år. På Frederiksberg er trapper og manglende parkeringsplads ved en salon ofte grunden til, at pårørende booker en mobil frisør. Jeg klipper siddende, også i kørestol. Skriv etage, elevator og dørtelefon.",
      "Jeg har sakse, maskine, kappe og tæppe med. I skal have en stol og plads rundt om. Betaling med MobilePay, når I booker. Pårørende kan få faktura. Afbud mindst 24 timer før er gratis; ellers 100 kr.",
      "Flere i samme lejlighed: kørsel kun én gang, 50 kr rabat per ekstra person. Plejehjem og bosteder booker flere beboere samme dag via plejehjems-flowet.",
    ],
    faq: [
      {
        question: "Dækker du både 1800 og 2000?",
        answer: "Ja, inden for 30 km fra Kastrup.",
      },
      {
        question: "Er kørsel altid 149 kr?",
        answer: "Nej. 10–20 km er 99 kr, 20–30 km 149 kr. Adressen afgør det.",
      },
      {
        question: "Klipper du ældre på Frederiksberg?",
        answer: "Ja. Pensionistklip er lavet til det.",
      },
      {
        question: "Kan datteren i Valby booke til mor på Frederiksberg?",
        answer: "Ja. Pårørende-booking og evt. faktura.",
      },
      {
        question: "Skal jeg vaske hår?",
        answer: "Gerne tørt hår. En stol er det, I skal stille frem.",
      },
      {
        question: "Laver du farve?",
        answer: "Nej. Kun klip og små tillæg.",
      },
    ],
  },
};
