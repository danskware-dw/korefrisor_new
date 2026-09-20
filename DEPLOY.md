# Deployment tjekliste — før du går live

Denne side viser, hvad du skal udfylde og sætte op, før du sætter hjemmesiden i drift.

---

## 1. Udfyld dine egne oplysninger

Gå til **`/admin` → Indstillinger**, når du er logget ind, og udfyld:

### Obligatorisk — erstatter `[RET DETTE: ...]`-pladsholdere:

- [ ] **Firmanavn** — fx "Kørefrisøren" eller dit rigtige firmanavn
- [ ] **Dit navn** — dit fulde navn, som vist på hjemmesiden og i bookingbekræftelser
- [ ] **Telefonnummer** — dit rigtige telefonnummer (ikke 00 00 00 00)
- [ ] **E-mail** — din rigtige e-mailadresse (ikke eksempel@...)
- [ ] **MobilePay-nummer** — det telefonnummer, kunder skal sende penge til
- [ ] **CVR-nummer** — dit CVR-nummer, eller slet feltet hvis du ikke har et

### Adresse og koordinater:

- [ ] **Din hjemmeadresse** — gade, postnummer og by
- [ ] **Koordinater (latitude/longitude)** — find dem på [openstreetmap.org](https://www.openstreetmap.org/):
  - Søg efter din adresse
  - Højreklik på stedet
  - Vælg "Vis adresse"
  - Koordinaterne står i adresselinjen (fx `lat=55.6301&lon=12.6489`)

### Priser og behandlinger:

- [ ] Gå til **Behandlinger** i admin-menuen og ret priser, varighed og beskrivelse
- [ ] Upload egne fotos til `public/behandlinger/` (klip.png, pensionistklip.png, etc.)
- [ ] Ret `imageAlt`-teksten i behandlingerne, så den passer til dine billeder

### Åbningstider og ferie:

- [ ] Sæt dine rigtige **åbningstider** (mandag–fredag, weekend)
- [ ] Ret **frokostpause**, hvis du holder pause
- [ ] Tilføj **ferieperioder**, når du kender dem

---

## 2. Miljøvariabler (.env.local på lokal dev / Vercel miljøvariabler i produktion)

Opret `.env.local` lokalt (eller sæt dem i Vercel under **Settings → Environment Variables**):

### Kræves:

- [ ] `ADMIN_PASSWORD` — kodeord til `/admin` (vælg et stærkt kodeord)
- [ ] `DATABASE_URL` — forbindelse til din PostgreSQL-database (fx Neon, Vercel Postgres, Supabase)

### MobilePay Online (hvis du vil automatisk betalingshåndtering):

- [ ] `MOBILEPAY_MERCHANT_ID` — dit MobilePay-merchant-ID
- [ ] `MOBILEPAY_SUBSCRIPTION_KEY` — API-nøgle fra MobilePay
- [ ] `MOBILEPAY_WEBHOOK_SECRET` — webhook-hemmelighed fra MobilePay
- [ ] `MOBILEPAY_MSN` — dit MobilePay Serial Number

Uden disse variabler fungerer siden stadig — kunder får en instruktion om manuel MobilePay-betaling.

### E-mail (Resend):

- [ ] `RESEND_API_KEY` — API-nøgle fra [Resend](https://resend.com/)
- [ ] `RESEND_FROM` — din afsender-e-mailadresse (fx `booking@ditdomæne.dk`)

Uden Resend skrives bekræftelser og påmindelser i server-loggen i stedet.

### Valgfrit:

- [ ] `OSRM_BASE_URL` — din egen OSRM-server for kørselsberegning (ellers bruges åben server)
- [ ] `SITE_URL` — dit domæne (fx `https://korefrisor.dk`) — bruges i sitemap og bekræftelser

---

## 3. Database

Siden bruger i øjeblikket **filer** (`data/bookings.json`, `data/settings.json`) til at gemme bookinger og indstillinger. Det **holder ikke i produktion på Vercel** (ingen skrivbar disk).

### Før drift:

- [ ] Opret en PostgreSQL-database (fx [Neon](https://neon.tech/), [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), eller [Supabase](https://supabase.com/))
- [ ] Sæt `DATABASE_URL` i miljøvariabler
- [ ] Kør database-migrationer (se `src/lib/db/schema.ts` for struktur)
- [ ] Tjek at `src/lib/store.ts` og `src/lib/runtime-config.ts` er skiftet til at bruge databasen i stedet for filer

---

## 4. Domæne og DNS

- [ ] Køb et domæne (fx `korefrisor.dk`, `hjemmeklip.dk`)
- [ ] Peg domænet til Vercel (følg [Vercel's guide](https://vercel.com/docs/concepts/projects/domains))
- [ ] Sæt `SITE_URL` miljøvariabel til dit domæne (fx `https://korefrisor.dk`)
- [ ] Ret `siteUrl` i `src/config/business.ts`, hvis du ikke bruger miljøvariabel

---

## 5. Google og søgemaskiner

- [ ] Opret **Google Business Profile** — "Jeg betjener kunder på deres adresse" med Kastrup/dit område som serviceområde
- [ ] Indsend `sitemap.xml` til **Google Search Console** (gå til [search.google.com/search-console](https://search.google.com/search-console))
- [ ] Bed kunder om **anmeldelser** på Google — det er det vigtigste for synlighed

---

## 6. Vercel-opsætning

### Deploy til Vercel:

1. [ ] Opret projekt på [vercel.com](https://vercel.com/) og forbind dit GitHub-repo
2. [ ] Sæt miljøvariabler under **Settings → Environment Variables**:
   - `ADMIN_PASSWORD`
   - `DATABASE_URL`
   - `MOBILEPAY_MERCHANT_ID`, `MOBILEPAY_SUBSCRIPTION_KEY`, osv. (hvis du bruger MobilePay Online)
   - `RESEND_API_KEY`, `RESEND_FROM` (hvis du bruger e-mail)
   - `SITE_URL`
3. [ ] Deploy og test på Vercel's preview-URL
4. [ ] Tilføj dit eget domæne under **Settings → Domains**

### Cron jobs (påmindelser og e-mail-udsendelse):

Siden har to cron-endpoints:

- `/api/cron/reminders` — sender e-mail dagen før aftaler
- `/api/cron/outbox` — sender ventende notifikationer

Disse er sat op i `vercel.json` til at køre én gang dagligt på **Vercel Hobby-planen**. På en betalt plan kan du øge frekvensen.

- [ ] Tjek at cron-jobbene kører under **Deployments → Cron** i Vercel-dashboardet
- [ ] Test manuelt ved at kalde endpointerne med `CRON_SECRET` (sæt denne miljøvariabel i Vercel):
  ```bash
  curl -H "Authorization: Bearer DIT_CRON_SECRET" https://ditdomæne.dk/api/cron/reminders
  ```

---

## 7. Billeder og indhold

- [ ] Udskift billeder i `public/behandlinger/` med dine egne fotos (ikke AI-genererede)
- [ ] Upload et foto af dig selv til "Om mig"-siden
- [ ] Ret teksterne på "Om mig" og "Testimonials" (eller slet testimonials, hvis du ikke har nogen endnu)

---

## 8. Test bookingflowet

Før du går live, test hele bookingen:

1. [ ] Gå til `/book` og gennemfør en testbooking med din egen adresse
2. [ ] Tjek at prisberegning viser rigtigt (behandling + kørselstillæg)
3. [ ] Tjek at ledige tider vises korrekt
4. [ ] Test MobilePay-betalingsflowet (hvis du har MobilePay Online sat op)
5. [ ] Tjek at bekræftelsesmail sendes (hvis Resend er sat op)
6. [ ] Log ind på `/admin` og se bookingen i oversigten
7. [ ] Test aflysning via aflysningslink i bekræftelsen

---

## 9. Sikkerhed

- [ ] **Slet `.env.local`** fra dit repo (den må ALDRIG committes)
- [ ] Tjek at `.env.local` står i `.gitignore`
- [ ] Brug et **stærkt admin-kodeord** (mindst 16 tegn, tilfældigt)
- [ ] Roter API-nøgler, hvis de er blevet eksponeret

---

## 10. Overvågning og backup

- [ ] Sæt **fejlmonitorering** op (fx [Sentry](https://sentry.io/) eller Vercel's indbyggede logs)
- [ ] Sørg for **database-backup** (de fleste hostede PostgreSQL-tjenester har automatiske backups)
- [ ] Hold øje med Vercel's logs de første dage for at fange fejl

---

## Efter go-live

- [ ] Markedsfør på sociale medier med link til bookingsiden
- [ ] Print visitkort eller flyers med QR-kode til `/book`
- [ ] Følg med i `/admin` for nye bookinger
- [ ] Bed første kunder om anmeldelser på Google

---

## Hurtig tjekliste (de vigtigste ting)

1. ✅ Udfyld dine **rigtige kontaktoplysninger** i admin-indstillinger
2. ✅ Sæt `DATABASE_URL` op og skift fra filer til database
3. ✅ Sæt `ADMIN_PASSWORD` og `SITE_URL` som miljøvariabler
4. ✅ Upload **egne billeder** til `/public/behandlinger/`
5. ✅ Peg **domæne** til Vercel
6. ✅ Indsend **sitemap til Google Search Console**
7. ✅ Test **hel bookingflow** fra start til slut

---

Held og lykke med lanceringen! 🎉
