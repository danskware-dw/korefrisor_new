import { describe, expect, it } from "vitest";
import {
  copenhagenDateIso,
  copenhagenToUtc,
  isCopenhagenDaytime,
  isCopenhagenTomorrow,
} from "./copenhagen";

describe("Copenhagen time", () => {
  it("maps winter 22:30 UTC to 16 Jan 23:30", () => {
    const instant = new Date("2026-01-16T22:30:00.000Z");
    expect(copenhagenDateIso(instant)).toBe("2026-01-16");
    const utc = copenhagenToUtc("2026-01-16", "23:30");
    expect(utc.toISOString()).toBe("2026-01-16T22:30:00.000Z");
  });

  it("maps summer 22:30 UTC to 17 Jul 00:30", () => {
    const instant = new Date("2026-07-16T22:30:00.000Z");
    expect(copenhagenDateIso(instant)).toBe("2026-07-17");
    expect(isCopenhagenTomorrow("2026-07-17T10:00:00.000Z", instant.getTime())).toBe(false);
  });

  it("daytime window is 09:00–18:00 Copenhagen", () => {
    expect(isCopenhagenDaytime(Date.parse("2026-01-16T07:59:00.000Z"))).toBe(false);
    expect(isCopenhagenDaytime(Date.parse("2026-01-16T08:00:00.000Z"))).toBe(true);
    expect(isCopenhagenDaytime(Date.parse("2026-01-16T16:59:00.000Z"))).toBe(true);
    expect(isCopenhagenDaytime(Date.parse("2026-01-16T17:00:00.000Z"))).toBe(false);
  });
});
