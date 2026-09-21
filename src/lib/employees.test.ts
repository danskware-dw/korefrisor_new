import { describe, expect, it } from "vitest";
import { business } from "@/config/business";
import {
  employeeServices,
  formatEmployeeBase,
  genderLabel,
  hasPublicReviews,
  travelCoverageLabel,
  travelZoneLines,
} from "./employees";

describe("employee profile facts", () => {
  it("labels gender in Danish and hides missing gender", () => {
    expect(genderLabel("male")).toBe("Mand");
    expect(genderLabel("female")).toBe("Kvinde");
    expect(genderLabel(undefined)).toBeNull();
  });

  it("offers all bookable services when none are listed", () => {
    const raed = business.employees[0];
    const offered = employeeServices(raed, business.services);
    expect(offered.every((service) => !service.contactOnly)).toBe(true);
    expect(offered.some((service) => service.id === "klip")).toBe(true);
  });

  it("limits services when serviceIds are set", () => {
    const offered = employeeServices(
      { ...business.employees[0], serviceIds: ["klip", "skaegklip"] },
      business.services,
    );
    expect(offered.map((service) => service.id)).toEqual(["klip", "skaegklip"]);
  });

  it("hides placeholder streets", () => {
    expect(formatEmployeeBase(business.employees[0].base)).toBe("2770 Kastrup");
  });

  it("does not invent ratings", () => {
    expect(hasPublicReviews(business.employees[0])).toBe(false);
  });


  it("describes coverage as km from the base city", () => {
    expect(travelCoverageLabel(business.travel, "Kastrup")).toBe("Op til 30 km fra Kastrup");
    expect(travelZoneLines(business.travel)[0]).toMatch(/0–5 km/);
  });
});
