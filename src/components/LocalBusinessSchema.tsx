import { getConfig } from "@/lib/runtime-config";

const dayNames: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  0: "Sunday",
};

/**
 * Strukturerede data til Google, Bing og AI-svar.
 * Service-area business: by + postnr, ikke en salonadresse kunder går ind i.
 */
export async function LocalBusinessSchema() {
  const config = await getConfig();
  const placeholderStreet = config.home.street.includes("[RET DETTE]");

  const businessNode = {
    "@type": ["HairSalon", "BeautySalon", "LocalBusiness"],
    "@id": `${config.siteUrl}#business`,
    name: config.name,
    alternateName: [
      "Hjemmefrisør Kastrup",
      "Udekørende frisør Kastrup",
      "Mobil frisør Amager",
      "Mobile hairdresser Copenhagen",
      "Senior haircut at home Kastrup",
    ],
    description:
      "Udekørende frisør og hjemmeklip i Kastrup. Klip, pensionistklip og børneklip i kundens eget hjem på Amager, i Tårnby, Dragør og Storkøbenhavn. Specielt til ældre, børn og dem med nedsat mobilitet.",
    url: config.siteUrl,
    telephone: config.phone,
    email: config.email,
    image: `${config.siteUrl}/behandlinger/hjemmebesoeg.png`,
    logo: `${config.siteUrl}/behandlinger/hjemmebesoeg.png`,
    priceRange: "225-350 DKK",
    currenciesAccepted: "DKK",
    paymentAccepted: "MobilePay",
    knowsLanguage: ["da", "en"],
    address: {
      "@type": "PostalAddress",
      ...(placeholderStreet ? {} : { streetAddress: config.home.street }),
      postalCode: config.home.postalCode,
      addressLocality: config.home.city,
      addressRegion: "Hovedstaden",
      addressCountry: "DK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: config.home.lat,
      longitude: config.home.lon,
    },
    areaServed: config.areas.map((area) => ({
      "@type": "City",
      name: area.name,
    })),
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: config.home.lat,
        longitude: config.home.lon,
      },
      geoRadius: config.travel.maxServiceRadiusKm * 1000,
    },
    openingHoursSpecification: Object.entries(config.openingHours)
      .filter(([, hours]) => hours !== null)
      .map(([day, hours]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayNames[Number(day)],
        opens: hours!.from,
        closes: hours!.to,
      })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Hjemmeklip og udekørende frisør",
      itemListElement: config.services.map((service) => ({
        "@type": "Offer",
        url: service.contactOnly
          ? `${config.siteUrl}/kontakt`
          : `${config.siteUrl}/behandlinger/${service.id}`,
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          serviceType: "Haircut",
          provider: { "@id": `${config.siteUrl}#business` },
          areaServed: config.areas.map((a) => a.name),
        },
        ...(service.price > 0
          ? { price: service.price, priceCurrency: "DKK", availability: "https://schema.org/InStock" }
          : {}),
      })),
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${config.siteUrl}/book`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "Reservation", name: "Hjemmeklip-booking" },
    },
  };

  const websiteNode = {
    "@type": "WebSite",
    "@id": `${config.siteUrl}#website`,
    url: config.siteUrl,
    name: config.name,
    description: config.tagline,
    inLanguage: "da-DK",
    publisher: { "@id": `${config.siteUrl}#business` },
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [businessNode, websiteNode],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
