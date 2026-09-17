/**
 * Standardværdier. Dashboardet kan overskrive dem i data/settings.json.
 * Felter markeret med [RET DETTE] indeholder stadig eksempeldata.
 */

import type { AppConfig, Service } from "./types";

export const business: AppConfig = {
  name: "Kørefrisøren",
  tagline: "Frisør der kører hjem til dig",
  ownerName: "[RET DETTE: dit navn]",
  yearsOfExperience: 4,

  phone: "+45 00 00 00 00",
  email: "kontakt@example.dk",
  mobilePay: "000000",
  cvr: "",

  home: {
    street: "[RET DETTE: din vej og nummer]",
    postalCode: "2770",
    city: "Kastrup",
    country: "Danmark",
    lat: 55.6306,
    lon: 12.6453,
  },

  openingHours: {
    1: { from: "09:00", to: "17:00" },
    2: { from: "09:00", to: "17:00" },
    3: { from: "09:00", to: "17:00" },
    4: { from: "09:00", to: "17:00" },
    5: { from: "09:00", to: "16:00" },
    6: { from: "10:00", to: "14:00" },
    0: null,
  },

  bufferMinutes: 30,
  minNoticeHours: 24,
  maxAdvanceDays: 60,
  cancelFreeHours: 24,
  lateCancelFeeKr: 100,
  blockedDates: [],
  vacations: [],
  employees: [
    {
      id: "ejer",
      name: "[RET DETTE: dit navn]",
      role: "Frisør",
      image: "/behandlinger/hjemmebesoeg.png",
      imageAlt: "Frisør klar til hjemmebesøg",
      active: true,
      base: {
        street: "[RET DETTE: din vej og nummer]",
        postalCode: "2770",
        city: "Kastrup",
        lat: 55.6306,
        lon: 12.6453,
      },
    },
  ],

  travel: {
    freeRadiusKm: 5,
    zones: [
      { maxKm: 10, fee: 49, label: "5–10 km" },
      { maxKm: 20, fee: 99, label: "10–20 km" },
      { maxKm: 30, fee: 149, label: "20–30 km" },
    ],
    maxServiceRadiusKm: 30,
    minOrderValueLongDistance: 0,
    longDistanceThresholdKm: 20,
  },

  services: [
    {
      id: "klip",
      name: "Klip",
      description: "Almindelig klipning hjemme hos dig. Saks og maskine, tilpasset dit hår.",
      price: 350,
      durationMinutes: 45,
      image: "/behandlinger/klip.png",
      imageAlt: "Frisør klipper en kunde hjemme ved spisebordet.",
    },
    {
      id: "pensionistklip",
      name: "Pensionistklip",
      description:
        "Rolig klipning med ekstra tid. Jeg klipper gerne siddende, også ved gangbesvær eller i kørestol.",
      price: 325,
      durationMinutes: 50,
      image: "/behandlinger/pensionistklip.png",
      imageAlt: "Ældre kvinde får sit hår klippet siddende i sin egen stue.",
    },
    {
      id: "boerneklip",
      name: "Børneklip",
      description: "Klip til børn under 12 år, i barnets eget hjem og i barnets tempo.",
      price: 225,
      durationMinutes: 30,
      image: "/behandlinger/boerneklip.png",
      imageAlt: "Barn får klippet håret hjemme i stuen, mens en frisør arbejder roligt.",
    },
    {
      id: "skaegklip",
      name: "Skægklip",
      description: "Trimning af skæg. Vælges sammen med et klip.",
      price: 150,
      durationMinutes: 15,
      addon: true,
      image: "/behandlinger/klip.png",
      imageAlt: "Frisør trimmer skæg hjemme hos kunden.",
    },
    {
      id: "pandehaar",
      name: "Pandehår",
      description: "Kort klip af pandehår. Vælges sammen med et klip.",
      price: 75,
      durationMinutes: 15,
      addon: true,
      image: "/behandlinger/klip.png",
      imageAlt: "Frisør klipper pandehår hjemme hos kunden.",
    },
    {
      id: "bryn",
      name: "Retning af bryn",
      description: "Retning af øjenbryn. Vælges sammen med et klip.",
      price: 75,
      durationMinutes: 15,
      addon: true,
      image: "/behandlinger/klip.png",
      imageAlt: "Frisør retter øjenbryn hjemme hos kunden.",
    },
    {
      id: "plejehjem",
      name: "Besøg på plejehjem eller bosted",
      description:
        "Flere beboere samme dag: én kørsel, én faktura, fast ugedag. Book antal beboere.",
      price: 0,
      durationMinutes: 60,
      contactOnly: true,
      image: "/behandlinger/plejehjem.png",
      imageAlt:
        "Frisør klipper en beboer i fællesrummet på et plejehjem, mens en anden venter.",
    },
  ],

  testimonials: [],

  areas: [
    { slug: "kastrup", name: "Kastrup", postalCodes: ["2770"] },
    { slug: "taarnby", name: "Tårnby", postalCodes: ["2770"] },
    { slug: "dragoer", name: "Dragør", postalCodes: ["2791"] },
    { slug: "amager", name: "Amager", postalCodes: ["2300", "2450"] },
    { slug: "oerestad", name: "Ørestad", postalCodes: ["2300"] },
    { slug: "koebenhavn-s", name: "København S", postalCodes: ["2300"] },
    { slug: "valby", name: "Valby", postalCodes: ["2500"] },
    { slug: "frederiksberg", name: "Frederiksberg", postalCodes: ["1800", "2000"] },
  ],

  siteUrl: "https://example.dk",
};

export function bookableFrom(services: Service[]): Service[] {
  return services.filter((s) => !s.contactOnly);
}

export function isAddon(service: Pick<Service, "addon">): boolean {
  return Boolean(service.addon);
}

export function primaryBookableFrom(services: Service[]): Service[] {
  return bookableFrom(services).filter((s) => !isAddon(s));
}

export function getServiceFrom(services: Service[], id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

/** Synonymer til bookableServices, så gammel kode stadig virker med standardlisten. */
export const bookableServices = bookableFrom(business.services);

export function getService(id: string): Service | undefined {
  return getServiceFrom(business.services, id);
}

export type { Service } from "./types";
