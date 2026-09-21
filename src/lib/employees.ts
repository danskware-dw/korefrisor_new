import { bookableFrom } from "@/config/business";
import type { Employee, EmployeeGender, Service, Travel } from "@/config/types";
import { formatDkk } from "@/lib/pricing";

/** Viser medarbejderens udgangspunkt som én linje. */
export function formatEmployeeBase(base: {
  street: string;
  postalCode: string;
  city: string;
}): string {
  const street = /RET DETTE/i.test(base.street) ? "" : base.street.trim();
  const place = [base.postalCode, base.city].filter(Boolean).join(" ").trim();
  if (street && place) return `${street}, ${place}`;
  if (street) return street;
  return place || "Område ikke angivet";
}

export function genderLabel(gender: EmployeeGender | undefined): string | null {
  if (gender === "male") return "Mand";
  if (gender === "female") return "Kvinde";
  return null;
}

export function employeeServices(employee: Employee, catalog: Service[]): Service[] {
  const bookable = bookableFrom(catalog);
  if (!employee.serviceIds?.length) return bookable;
  const allowed = new Set(employee.serviceIds);
  return bookable.filter((service) => allowed.has(service.id));
}

export function travelCoverageLabel(travel: Travel, city: string): string {
  return `Op til ${travel.maxServiceRadiusKm} km fra ${city}`;
}

export function travelZoneLines(travel: Travel): string[] {
  return [
    `0–${travel.freeRadiusKm} km: ${formatDkk(0)}`,
    ...travel.zones.map((zone) => `${zone.label}: ${formatDkk(zone.fee)}`),
  ];
}

export function hasPublicReviews(employee: Employee): boolean {
  return Boolean(employee.rating && employee.rating.count > 0);
}
