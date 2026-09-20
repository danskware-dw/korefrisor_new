# Kørefrisøren — hjemmeside med booking og dashboard

Hjemmeside til en mobil frisør i Kastrup, der kører hjem til kunderne.
Kunden vælger klip, pensionistklip eller børneklip, skriver sin adresse, og
siden regner afstanden ud, viser ruten på et kort og lægger kørselstillægget
til prisen — før kunden bekræfter.

Du har også et **login-beskyttet dashboard** på `/admin`, hvor du følger
bookinger, kunder, kalender, behandlinger og indstillinger.

Bygget med Next.js, TypeScript og Tailwind CSS.

---

## Kom i gang

```bash
npm install
npm run build && npm start -- --port 3200     # åbn http://localhost:3200
```

> **Vigtigt om mappenavnet:** `npm run dev` virker ikke, så længe projektmappen
> hedder `køreFrisøer`. Next.js' udviklingsserver kan ikke håndtere `ø` og `æ` i
> stien. Omdøb mappen til fx `korefrisor`, så virker `npm run dev` også.
> `npm run build` og `npm start` virker uanset hvad.

Opret en fil ved navn `.env.local` (kopiér `.env.example`):

```
ADMIN_PASSWORD=vælg-et-kodeord      # bruges til at logge ind på /admin
# OSRM_BASE_URL=                    # valgfrit, se "Kørselsafstand" nedenfor
```

---

## Dashboard (`/admin`)

Log ind med `ADMIN_PASSWORD`. Kundernes side viser ikke dashboardet.

| Side | Hvad du kan |
| --- | --- |
| **Overblik** | Antal kunder, medarbejdere, kommende tider og i dag |
| **Bookinger** | Søg, se status, ret status eller slet |
| **Kunder** | Liste bygget automatisk ud fra bookinger |
| **Kalender** | Månedsoversigt (ferie vises med blå baggrund) |
| **Behandlinger** | Ret navn, pris, tid og billede — eller tilføj/slet |
| **Indstillinger** | Oplysninger, åbningstider/weekend, ferie, medarbejdere |

Det du retter i dashboardet gemmes i `data/settings.json` og vises med det samme
på hjemmesiden. Standardværdierne står stadig i `src/config/business.ts`.

---

## Her retter du dine egne oplysninger

**Hurtigst:** gå til `/admin` → Indstillinger, når du er logget ind.

**Eller** ret standarderne i `src/config/business.ts`. Alle steder markeret
`[RET DETTE]` er eksempeldata:

| Hvad du vil ændre | Hvor |
| --- | --- |
| Firmanavn, navn, telefon, e-mail, MobilePay, CVR | Dashboard → Indstillinger, eller `business.ts` |
| Din adresse og koordinater | Indstillinger / `home` |
| Åbningstider, weekend, pause, ferie | Indstillinger |
| Priser og behandlinger | Dashboard → Behandlinger |
| Kørselstillæg og radius | `travel` i `business.ts` |
| Områdesider til Google | `areas` |
| Dit domæne | `siteUrl` |

Find dine koordinater ved at søge din adresse på openstreetmap.org, højreklikke
på stedet og vælge "Vis adresse" — så står bredde- og længdegrad i adresselinjen.

---

## Behandlinger

Som standard:

- **Klip** — almindelig hjemmeklipning
- **Pensionistklip** — ekstra tid, også siddende / kørestol
- **Børneklip** — under 12 år, i barnets tempo
- **Plejehjem** — kun efter telefon (vises ikke i bookingen)

Dameklip og vask/føn er fjernet. Du kan tilføje eller slette behandlinger i
dashboardet.

---

## Billederne

Fotoene i `public/behandlinger/` er **lavet af en billedgenerator**. Udskift
dem med dine egne, så snart du har nogle. Filnavne der matcher behandlinger:

- `klip.png`, `pensionistklip.png`, `boerneklip.png`, `plejehjem.png`
- `hjemmebesoeg.png` — hero på forsiden

Ret også `imageAlt` i dashboardet eller i `business.ts`.

---

## Anbefalinger fra kunder

Afsnittet "Det siger mine kunder" vises kun, når der står noget i
`testimonials` i `src/config/business.ts`. Skriv kun rigtige udtalelser.

---

## Sådan virker bookingen

1. Kunden vælger en eller flere behandlinger.
2. Adresseforslag kommer fra **DAWA** (gratis, ingen nøgle).
3. Serveren beregner afstand, zone og pris: behandling + kørsel.
4. Ruten vises på et OpenStreetMap-kort.
5. Uden for din radius kan kunden ikke booke — kun ringe.
6. Ledige tider tager højde for åbningstider, ferie, pause og bookinger.
7. Navn, telefon, e-mail og bemærkning.
8. Pris og tid låses på serveren, så de ikke kan snydes.

---

## Kørselsafstand

Den **rigtige kørselsafstand** hentes fra OSRM's åbne ruteserver. Får du mange
bookinger, bør du køre din egen OSRM og sætte `OSRM_BASE_URL` i `.env.local`.
Kan serveren ikke nås, bruges et skøn (fugleflugt × 1,35).

---

## Database

Bookinger: `data/bookings.json`. Indstillinger: `data/settings.json`.

Det er fint lokalt, men **holder ikke på Vercel** (ingen skrivbar disk). Inden
drift skal `src/lib/store.ts` og `src/lib/runtime-config.ts` skiftes til en
rigtig database (fx Neon Postgres).

---

## E-mail

Bekræftelser, afbud og påmindelse dagen før sendes som e-mail (`src/lib/notify.ts`).
Med `RESEND_API_KEY` går de via Resend. Uden nøgle skrives de i serverloggen.

---

## Søgemaskiner og AI-søgning

Teknisk på plads:

- Titler/beskrivelser med **hjemmeklip**, **udekørende frisør**, pensionist- og
  børneklip
- Egne sider: `/behandlinger`, `/behandlinger/klip`, `/pensionistklip`,
  `/boerneklip` plus områdesider under `/frisor/...`
- Schema (`HairSalon` + FAQ), `sitemap.xml`, `robots.txt`
- **`/llms.txt`** — kort beskrivelse til ChatGPT, Gemini, Perplexity m.fl.

Det skal du selv gøre (det betyder mest):

1. **Google Business Profile** — "Jeg betjener kunder på deres adresse", med
   Kastrup og omegn som serviceområde.
2. **Bed om anmeldelser** på Google.
3. **Sæt dit domæne** og ret `siteUrl`.
4. **Google Search Console** — indsend `sitemap.xml`.
5. **Egne fotos** på forsiden og "Om mig".

---

## Tilgængelighed

Grundskrift 18px, knapper mindst 48px, høj kontrast, tydelig fokusmarkering,
telefon øverst på hver side. Gør ikke skriften mindre.

---

## Mangler endnu

- Rigtig database i stedet for filer — **skal laves før drift**
- Rigtig afsendelse af e-mail (Resend)
- Påmindelse dagen før aftalen
- Kundens eget link til at flytte eller aflyse
- Automatisk overførsel til Google Calendar
- Dine egne billeder og udfyldte `[RET DETTE]`-felter

---

## Klar til at gå live?

Se **[DEPLOY.md](./DEPLOY.md)** for en komplet tjekliste over, hvad du skal udfylde og opsætte før du sætter siden i drift:

- ✅ Rigtige kontaktoplysninger (telefon, e-mail, MobilePay-nummer)
- ✅ Database-opsætning (PostgreSQL i stedet for filer)
- ✅ Miljøvariabler (passwords, API-nøgler)
- ✅ Domæne og DNS
- ✅ Test af bookingflow
- ✅ Egne billeder

**Vigtigt:** Siden har i øjeblikket placeholder-værdier markeret `[RET DETTE: ...]`, som ikke vises på hjemmesiden, men skal udfyldes i admin-indstillingerne før drift.
