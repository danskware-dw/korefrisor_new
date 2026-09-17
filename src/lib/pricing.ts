import { business, isAddon } from "@/config/business";
import type { Service, Travel } from "@/config/types";

/** Rabat pr. ekstra person samme besøg — kørsel tælles kun én gang. */
export const FAMILY_EXTRA_PERSON_DISCOUNT_KR = 50;
export const CARE_HOME_MINUTES_PER_RESIDENT = 40;
export const CARE_HOME_MIN_RESIDENTS = 2;
export const CARE_HOME_MAX_RESIDENTS = 10;

export type QuoteService = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
};

export type Quote = {
  services: QuoteService[];
  servicesTotal: number;
  familyDiscount: number;
  extraPeople: number;
  peopleCount: number;
  distanceKm: number;
  drivingMinutes: number;
  travelFee: number;
  travelZoneLabel: string;
  total: number;
  durationMinutes: number;
  withinServiceArea: boolean;
  belowMinimum: boolean;
  minimumRequired: number;
};

export function primaryCount(serviceIds: string[], catalog: Service[]): number {
  return serviceIds.filter((id) => {
    const service = catalog.find((item) => item.id === id);
    return Boolean(service && !isAddon(service));
  }).length;
}

export function familyDiscountFor(serviceIds: string[], catalog: Service[]): number {
  const extras = Math.max(0, primaryCount(serviceIds, catalog) - 1);
  return extras * FAMILY_EXTRA_PERSON_DISCOUNT_KR;
}

export function careHomeServiceIds(
  residents: number,
  catalog: Service[] = business.services,
): string[] {
  const cut =
    catalog.find((service) => service.id === "pensionistklip") ??
    catalog.find((service) => !service.addon && !service.contactOnly);
  if (!cut) return [];
  const count = Math.min(
    CARE_HOME_MAX_RESIDENTS,
    Math.max(CARE_HOME_MIN_RESIDENTS, Math.round(residents)),
  );
  return Array.from({ length: count }, () => cut.id);
}

/** Fugleflugtsafstand i km mellem to punkter. */
export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const ROAD_FACTOR = 1.35;
const AVERAGE_SPEED_KMH = 32;

export function estimateRoute(
  destination: { lat: number; lon: number },
  home: { lat: number; lon: number } = business.home,
) {
  const straight = haversineKm(home, destination);
  const distanceKm = Math.round(straight * ROAD_FACTOR * 10) / 10;
  const drivingMinutes = Math.max(5, Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60));
  return { distanceKm, drivingMinutes, source: "estimat" as const };
}

export function travelFeeForDistance(
  distanceKm: number,
  travel: Travel = business.travel,
): {
  fee: number;
  label: string;
  withinServiceArea: boolean;
} {
  const { freeRadiusKm, zones, maxServiceRadiusKm } = travel;

  if (distanceKm <= freeRadiusKm) {
    return { fee: 0, label: `Gratis kørsel inden for ${freeRadiusKm} km`, withinServiceArea: true };
  }
  for (const zone of zones) {
    if (distanceKm <= zone.maxKm) {
      return { fee: zone.fee, label: `Kørsel ${zone.label}`, withinServiceArea: true };
    }
  }
  return {
    fee: 0,
    label: `Uden for mit område (over ${maxServiceRadiusKm} km)`,
    withinServiceArea: false,
  };
}

export function buildQuote(
  serviceIds: string[],
  route: { distanceKm: number; drivingMinutes: number },
  catalog: Service[] = business.services,
  travel: Travel = business.travel,
): Quote {
  const services = serviceIds
    .map((id) => catalog.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s))
    .map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      durationMinutes: s.durationMinutes,
    }));

  const servicesTotal = services.reduce((sum, s) => sum + s.price, 0);
  const peopleCount = primaryCount(serviceIds, catalog);
  const extraPeople = Math.max(0, peopleCount - 1);
  const familyDiscount = extraPeople * FAMILY_EXTRA_PERSON_DISCOUNT_KR;
  const durationMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);
  const fee = travelFeeForDistance(route.distanceKm, travel);

  const { minOrderValueLongDistance, longDistanceThresholdKm } = travel;
  const minimumApplies =
    minOrderValueLongDistance > 0 && route.distanceKm > longDistanceThresholdKm;

  return {
    services,
    servicesTotal,
    familyDiscount,
    extraPeople,
    peopleCount,
    distanceKm: route.distanceKm,
    drivingMinutes: route.drivingMinutes,
    travelFee: fee.fee,
    travelZoneLabel: fee.label,
    total: Math.max(0, servicesTotal - familyDiscount + fee.fee),
    durationMinutes,
    withinServiceArea: fee.withinServiceArea,
    belowMinimum: minimumApplies && servicesTotal < minOrderValueLongDistance,
    minimumRequired: minimumApplies ? minOrderValueLongDistance : 0,
  };
}

export function buildCareHomeQuote(
  residents: number,
  route: { distanceKm: number; drivingMinutes: number },
  catalog: Service[] = business.services,
  travel: Travel = business.travel,
): Quote {
  const ids = careHomeServiceIds(residents, catalog);
  const quote = buildQuote(ids, route, catalog, travel);
  const perResident = CARE_HOME_MINUTES_PER_RESIDENT * ids.length;
  return { ...quote, durationMinutes: perResident };
}

export function formatDkk(amount: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min.`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} time${h > 1 ? "r" : ""}` : `${h} t. ${m} min.`;
}
