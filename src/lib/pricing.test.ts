import { describe, expect, test } from "vitest";
import {
  buildQuote,
  buildCareHomeQuote,
  careHomeServiceIds,
  familyDiscountFor,
  formatDkk,
  formatDuration,
  haversineKm,
  primaryCount,
  travelFeeForDistance,
  FAMILY_EXTRA_PERSON_DISCOUNT_KR,
  CARE_HOME_MIN_RESIDENTS,
  CARE_HOME_MAX_RESIDENTS,
} from "./pricing";
import type { Service, Travel } from "@/config/types";

const mockServices: Service[] = [
  {
    id: "klip",
    name: "Klip",
    price: 350,
    durationMinutes: 45,
    addon: false,
    contactOnly: false,
    imageUrl: "/behandlinger/klip.png",
    imageAlt: "Klip",
  },
  {
    id: "pensionistklip",
    name: "Pensionistklip",
    price: 325,
    durationMinutes: 50,
    addon: false,
    contactOnly: false,
    imageUrl: "/behandlinger/pensionistklip.png",
    imageAlt: "Pensionistklip",
  },
  {
    id: "boerneklip",
    name: "Børneklip",
    price: 225,
    durationMinutes: 30,
    addon: false,
    contactOnly: false,
    imageUrl: "/behandlinger/boerneklip.png",
    imageAlt: "Børneklip",
  },
  {
    id: "skaeg",
    name: "Skægklip",
    price: 150,
    durationMinutes: 15,
    addon: true,
    contactOnly: false,
    imageUrl: "/behandlinger/skaeg.png",
    imageAlt: "Skægklip",
  },
];

const mockTravel: Travel = {
  freeRadiusKm: 5,
  maxServiceRadiusKm: 30,
  longDistanceThresholdKm: 20,
  minOrderValueLongDistance: 400,
  zones: [
    { label: "5–10 km", maxKm: 10, fee: 49 },
    { label: "10–20 km", maxKm: 20, fee: 99 },
    { label: "20–30 km", maxKm: 30, fee: 149 },
  ],
};

describe("pricing calculations", () => {
  test("primaryCount returns correct number of non-addon services", () => {
    expect(primaryCount(["klip"], mockServices)).toBe(1);
    expect(primaryCount(["klip", "skaeg"], mockServices)).toBe(1);
    expect(primaryCount(["klip", "pensionistklip"], mockServices)).toBe(2);
    expect(primaryCount(["skaeg"], mockServices)).toBe(0);
    expect(primaryCount([], mockServices)).toBe(0);
  });

  test("familyDiscountFor calculates discount for multiple people", () => {
    expect(familyDiscountFor(["klip"], mockServices)).toBe(0);
    expect(familyDiscountFor(["klip", "klip"], mockServices)).toBe(FAMILY_EXTRA_PERSON_DISCOUNT_KR);
    expect(familyDiscountFor(["klip", "pensionistklip"], mockServices)).toBe(FAMILY_EXTRA_PERSON_DISCOUNT_KR);
    expect(familyDiscountFor(["klip", "klip", "boerneklip"], mockServices)).toBe(FAMILY_EXTRA_PERSON_DISCOUNT_KR * 2);
  });

  test("careHomeServiceIds generates correct service count", () => {
    const ids = careHomeServiceIds(3, mockServices);
    expect(ids).toHaveLength(3);
    expect(ids.every((id) => id === "pensionistklip")).toBe(true);
  });

  test("careHomeServiceIds respects min/max limits", () => {
    expect(careHomeServiceIds(1, mockServices)).toHaveLength(CARE_HOME_MIN_RESIDENTS);
    expect(careHomeServiceIds(15, mockServices)).toHaveLength(CARE_HOME_MAX_RESIDENTS);
  });

  test("haversineKm calculates distance correctly", () => {
    const kastrup = { lat: 55.6301, lon: 12.6489 };
    const taarnby = { lat: 55.6370, lon: 12.5840 };
    const distance = haversineKm(kastrup, taarnby);
    expect(distance).toBeGreaterThan(4);
    expect(distance).toBeLessThan(6);
  });

  test("travelFeeForDistance returns free within radius", () => {
    const result = travelFeeForDistance(3, mockTravel);
    expect(result.fee).toBe(0);
    expect(result.withinServiceArea).toBe(true);
    expect(result.label).toContain("Gratis");
  });

  test("travelFeeForDistance applies correct zone fees", () => {
    expect(travelFeeForDistance(7, mockTravel).fee).toBe(49);
    expect(travelFeeForDistance(15, mockTravel).fee).toBe(99);
    expect(travelFeeForDistance(25, mockTravel).fee).toBe(149);
  });

  test("travelFeeForDistance marks outside service area", () => {
    const result = travelFeeForDistance(35, mockTravel);
    expect(result.withinServiceArea).toBe(false);
    expect(result.fee).toBe(0);
  });

  test("buildQuote calculates total correctly for single service", () => {
    const quote = buildQuote(
      ["klip"],
      { distanceKm: 3, drivingMinutes: 10 },
      mockServices,
      mockTravel,
    );
    expect(quote.servicesTotal).toBe(350);
    expect(quote.familyDiscount).toBe(0);
    expect(quote.travelFee).toBe(0);
    expect(quote.total).toBe(350);
    expect(quote.withinServiceArea).toBe(true);
  });

  test("buildQuote applies family discount for multiple people", () => {
    const quote = buildQuote(
      ["klip", "pensionistklip"],
      { distanceKm: 3, drivingMinutes: 10 },
      mockServices,
      mockTravel,
    );
    expect(quote.servicesTotal).toBe(675);
    expect(quote.familyDiscount).toBe(FAMILY_EXTRA_PERSON_DISCOUNT_KR);
    expect(quote.total).toBe(675 - FAMILY_EXTRA_PERSON_DISCOUNT_KR);
  });

  test("buildQuote includes addons in price but not in people count", () => {
    const quote = buildQuote(
      ["klip", "skaeg"],
      { distanceKm: 3, drivingMinutes: 10 },
      mockServices,
      mockTravel,
    );
    expect(quote.servicesTotal).toBe(500);
    expect(quote.peopleCount).toBe(1);
    expect(quote.familyDiscount).toBe(0);
  });

  test("buildQuote adds travel fee correctly", () => {
    const quote = buildQuote(
      ["klip"],
      { distanceKm: 15, drivingMinutes: 25 },
      mockServices,
      mockTravel,
    );
    expect(quote.travelFee).toBe(99);
    expect(quote.total).toBe(350 + 99);
  });

  test("buildQuote handles outside service area", () => {
    const quote = buildQuote(
      ["klip"],
      { distanceKm: 35, drivingMinutes: 50 },
      mockServices,
      mockTravel,
    );
    expect(quote.withinServiceArea).toBe(false);
    expect(quote.travelFee).toBe(0);
  });

  test("buildCareHomeQuote overrides duration calculation", () => {
    const quote = buildCareHomeQuote(
      4,
      { distanceKm: 10, drivingMinutes: 20 },
      mockServices,
      mockTravel,
    );
    expect(quote.services).toHaveLength(4);
    expect(quote.durationMinutes).toBe(40 * 4);
  });

  test("formatDkk formats Danish currency", () => {
    expect(formatDkk(350)).toContain("350");
    expect(formatDkk(350)).toContain("kr.");
    expect(formatDkk(1250)).toContain("1.250");
    expect(formatDkk(0)).toContain("0");
  });

  test("formatDuration formats minutes correctly", () => {
    expect(formatDuration(30)).toBe("30 min.");
    expect(formatDuration(60)).toBe("1 time");
    expect(formatDuration(90)).toBe("1 t. 30 min.");
    expect(formatDuration(120)).toBe("2 timer");
  });

  test("buildQuote handles empty service list", () => {
    const quote = buildQuote(
      [],
      { distanceKm: 5, drivingMinutes: 10 },
      mockServices,
      mockTravel,
    );
    expect(quote.services).toHaveLength(0);
    expect(quote.servicesTotal).toBe(0);
    expect(quote.total).toBe(0);
  });

  test("buildQuote handles unknown service IDs gracefully", () => {
    const quote = buildQuote(
      ["unknown-service"],
      { distanceKm: 5, drivingMinutes: 10 },
      mockServices,
      mockTravel,
    );
    expect(quote.services).toHaveLength(0);
  });

  test("travelFeeForDistance handles edge case at zone boundaries", () => {
    expect(travelFeeForDistance(5, mockTravel).fee).toBe(0);
    expect(travelFeeForDistance(5.1, mockTravel).fee).toBe(49);
    expect(travelFeeForDistance(10, mockTravel).fee).toBe(49);
    expect(travelFeeForDistance(10.1, mockTravel).fee).toBe(99);
  });
});
