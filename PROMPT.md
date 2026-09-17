# Prompt: Mobile hairdresser website with booking + travel-distance pricing

Copy everything below the line into the AI tool you want to build with.

---

You are a senior full-stack engineer, SEO specialist, and conversion-focused web
designer. Build a complete, production-ready website for my mobile hairdressing
business. Work step by step, ask me before making assumptions that affect price,
legal text, or branding, and show me the file structure before you start coding.

## About the business

- I am a hairdresser with more than 4 years of professional experience.
- I am based in Kastrup, Denmark (2770), near Copenhagen Airport / Amager.
- I am a **mobile hairdresser**: I do not have a salon. I drive to the
  customer's home with my own equipment and cut their hair there.
- My main target group is **anyone who cannot easily get to a salon**, with the
  emphasis on elderly customers: people with reduced mobility, people who are
  ill or recovering, and residents of care homes. There is no fixed age limit.
  Family members and caregivers will often be the ones who book on their behalf.
- Service area: Kastrup and the surrounding Greater Copenhagen area, with the
  price increasing with driving distance from my home address in Kastrup.

## Goals of the website, in priority order

1. Get bookings. The booking flow is the most important part of the site.
2. Be found on Google for local searches (strong local SEO).
3. Build trust with elderly customers and their families.
4. Be extremely easy to use for a person aged 70+ with poor eyesight and low
   technical confidence.

## Language and content

- Primary language: **Danish**. Write all customer-facing copy in natural,
  warm, plain Danish — short sentences, no jargon, no marketing hype.
- Add an English version as a secondary language (Kastrup has many
  international residents), with a clear language switcher.
- Write all the real copy for me: headlines, service descriptions, about-me
  section, FAQ, trust/reassurance text, and calls to action. Do not leave
  "lorem ipsum" or placeholder text anywhere. Mark anything you invented about
  me with `[CONFIRM]` so I can check it.

## Pages / sections needed

- **Home**: clear promise above the fold ("Frisør der kører hjem til dig i
  Kastrup og omegn"), a large primary "Book tid" button, how it works in 3
  steps, target group, service area map, prices, reviews, FAQ, contact.
- **Services and prices**: e.g. women's cut, men's cut, children's cut,
  wash and blow-dry, colour, permanent, beard trim, fringe trim, plus a
  "hjemmebesøg på plejehjem/bosted" option. Use a clear table with the
  base price per service and a separate line for the travel fee.
- **How it works**: what I bring, what the customer needs (a chair, access to
  water/power if relevant), how long it takes, how payment works.
- **About me**: my experience, that I am mobile, hygiene and equipment.
- **Service area**: map of the area I cover from Kastrup, with distance zones.
- **Booking page**: the flow described below.
- **Contact**: phone, email, MobilePay, contact form.
- **FAQ**, **Privacy policy (GDPR)**, and **Terms / cancellation policy**.

## Booking system — core requirement

Build a real, working booking flow:

1. Customer picks one or more **services** (shows base price live).
2. Customer enters their **full address** in Denmark, with autocomplete/
   validation against Danish addresses (use the free DAWA / Danmarks
   Adresseregister API: `api.dataforsyningen.dk`).
3. The site calculates the **driving distance and driving time** from my home
   address in Kastrup to the customer's address (use a routing/distance API —
   propose options such as Google Distance Matrix, Mapbox Directions, or
   OpenRouteService, and explain the cost and API-key implications of each).
4. Show an **embedded map** with the route from my address to theirs, plus the
   distance in km and the estimated driving time.
5. Automatically add a **travel fee** to the price based on that distance, and
   show the customer a clear breakdown before they confirm:
   service price + travel fee = total price.
6. If the address is **outside my maximum service radius**, say so politely and
   offer the contact form instead of a booking.
7. Customer picks a **date and time** from my real availability: my opening
   hours, buffer time between appointments to allow for driving, blocked-out
   days, and no double bookings.
8. Customer enters name, phone, email, and an optional note (door code,
   which floor, lift or stairs, "please ring the bell twice", etc.).
9. On confirmation: send a confirmation email and/or SMS to the customer and a
   notification to me, and create the appointment in my calendar (propose a
   Google Calendar integration).
10. Send a reminder the day before the appointment.
11. Allow the customer to cancel or move the appointment via a link.

Travel fee rules (make these **easily editable by me in one config file or an
admin screen**, do not hard-code them in the components):

- Free travel within X km of my address.
- A fixed price per zone, or a price per km beyond the free radius.
- An optional minimum order value for longer distances.
- I will give you the final numbers; until then use clearly marked example
  values and explain where I change them.

## Admin side

Give me a simple, password-protected admin area where I can:

- See upcoming bookings in a list and a calendar view.
- Block off dates and times, and set my weekly working hours.
- Edit services, prices, travel-fee rules, and the maximum service radius.
- Mark a booking as done, cancelled, or no-show.

## SEO — must be strong

- Target Danish local search terms: "mobil frisør Kastrup", "frisør der kommer
  hjem til dig", "hjemmefrisør København", "frisør til ældre", "frisør
  plejehjem Amager", "frisør 2770 Kastrup", and similar. Research and propose
  the full keyword list before writing the copy.
- Proper title tags, meta descriptions, one H1 per page, semantic headings,
  descriptive image alt text, clean human-readable URLs.
- Structured data (JSON-LD): `HairSalon` / `LocalBusiness` with
  `areaServed`, `geo`, opening hours, price range, plus `Service`, `FAQPage`,
  and `BreadcrumbList` schemas.
- `sitemap.xml`, `robots.txt`, canonical tags, Open Graph and Twitter cards.
- Fast: target a Lighthouse score of 90+ on mobile, optimised and lazy-loaded
  images, minimal JavaScript, no layout shift.
- Landing pages for individual nearby areas (Kastrup, Tårnby, Amager,
  Dragør, Ørestad, Copenhagen S, etc.) so I can rank locally in each one.
- Set me up with a Google Business Profile checklist and explain how to get and
  display reviews.

## Accessibility and design — critical for my customers

- WCAG 2.2 AA compliant as a minimum.
- Large base font size (18–20px minimum), large tap targets (minimum 48×48px),
  very high colour contrast, no thin light-grey text.
- Big, obvious buttons with text labels, not icon-only buttons.
- A phone number in the header that is tappable on mobile, always visible, for
  people who would rather just call than fill in a form.
- Full keyboard navigation, visible focus states, correct form labels and
  error messages, screen-reader friendly.
- Calm, clean, trustworthy design. Warm and professional rather than trendy.
  No autoplay video, no popups, no cookie banner unless legally required.
- Mobile-first, but make sure it looks good on a large desktop screen too,
  since relatives often browse on a laptop.

## Technical requirements

- Propose a stack and explain the trade-offs before coding. Default suggestion:
  Next.js (App Router) + TypeScript + Tailwind CSS, a hosted Postgres database,
  deployed on Vercel. Tell me if you think something simpler suits me better.
- All secrets in environment variables, never committed.
- Server-side validation on everything, rate limiting and spam protection on
  the booking and contact forms.
- GDPR compliant: store only what is needed, explain data retention, write the
  privacy policy in Danish.
- Prices and currency in DKK, dates and times in Danish format and the
  Europe/Copenhagen timezone.
- Clean, commented, maintainable code with a `README.md` that explains in plain
  language how I run it, where I change my prices, and how I deploy it.

## How I want you to work

1. First, ask me the questions you need answered: my exact address, phone
   number, email, business name, working hours, service list and prices, the
   travel-fee numbers, and my maximum radius.
2. Then show me a plan: the stack, the page structure, and the booking flow.
3. Wait for my approval, then build it in steps and explain each step.
4. At the end, give me a checklist of what I have to do myself: domain name,
   Google Business Profile, API keys, and testing the live booking flow.

---
