import { describe, expect, it } from "vitest";
import { holdUntilIso, occupiesSlot, shouldExpireHold } from "@/lib/schedule/holds";

describe("holds", () => {
  it("occupies until holdUntil, not createdAt age", () => {
    const createdAt = "2026-09-17T10:00:00.000Z";
    const holdUntil = holdUntilIso(createdAt);
    expect(holdUntil).toBe("2026-09-17T10:45:00.000Z");

    const booking = {
      status: "afventer_betaling",
      createdAt,
      holdUntil,
      slotOccupied: true,
    };

    expect(occupiesSlot(booking, Date.parse("2026-09-17T10:44:59.000Z"))).toBe(true);
    expect(occupiesSlot(booking, Date.parse("2026-09-17T10:45:00.000Z"))).toBe(false);
    expect(shouldExpireHold(booking, Date.parse("2026-09-17T10:45:00.000Z"))).toBe(true);
  });

  it("does not treat old createdAt as occupancy when holdUntil is still future", () => {
    const booking = {
      status: "afventer_betaling",
      createdAt: "2026-09-17T08:00:00.000Z",
      holdUntil: "2026-09-17T12:00:00.000Z",
      slotOccupied: true,
    };
    expect(occupiesSlot(booking, Date.parse("2026-09-17T11:00:00.000Z"))).toBe(true);
  });

  it("clears occupancy for udlobet and aflyst", () => {
    expect(
      occupiesSlot({
        status: "udlobet",
        createdAt: "2026-09-17T10:00:00.000Z",
        slotOccupied: false,
      }),
    ).toBe(false);
    expect(
      occupiesSlot({
        status: "aflyst",
        createdAt: "2026-09-17T10:00:00.000Z",
        slotOccupied: true,
      }),
    ).toBe(false);
  });
});
