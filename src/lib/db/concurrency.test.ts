import { afterAll, describe, expect, it } from "vitest";
import { claimEmployeeSlot } from "@/lib/db/claim-slot";
import { createIsolatedTestDb, type IsolatedDb } from "@/lib/db/isolated";
import { SlotTakenError } from "@/lib/schedule/fit";
import type { Booking } from "@/lib/store";

const kastrup = { lat: 55.6306, lon: 12.6453 };
const far = { lat: 55.6761, lon: 12.5683 };

function booking(partial: Partial<Booking> & Pick<Booking, "id" | "start" | "end" | "employee">): Booking {
  return {
    createdAt: "2026-09-17T08:00:00.000Z",
    status: "bekraeftet",
    slotOccupied: true,
    serviceIds: ["klip"],
    customer: { name: "Test", phone: "12345678", email: "a@b.dk" },
    address: {
      text: "Kastrupvej 12",
      postalCode: "2770",
      city: "Kastrup",
      ...kastrup,
    },
    pricing: {
      servicesTotal: 350,
      travelFee: 0,
      total: 350,
      distanceKm: 1,
      drivingMinutes: 5,
    },
    payment: {
      method: "mobilepay",
      status: "betalt",
      amountKr: 350,
      reference: `KF-${partial.id.slice(0, 8)}`,
      mode: "manuel",
    },
    cancelToken: `tok-${partial.id}`,
    ...partial,
  };
}

describe("schedule concurrency", () => {
  let db: IsolatedDb;

  it("starts an isolated postgres", async () => {
    db = await createIsolatedTestDb();
    expect(db.url).toContain("postgres://");
    expect(process.env.DATABASE_URL && db.url.includes(process.env.DATABASE_URL)).toBeFalsy();
  }, 180_000);

  it("lets only one of two overlapping inserts win", async () => {
    const start = "2026-09-18T10:00:00.000Z";
    const end = "2026-09-18T10:40:00.000Z";
    const drive = () => ({ drivingMinutes: 5, source: "rute" as const });
    const a = booking({
      id: "a-overlap",
      start,
      end,
      employee: { id: "ejer", name: "Ejer" },
    });
    const b = booking({
      id: "b-overlap",
      start,
      end,
      employee: { id: "ejer", name: "Ejer" },
      address: { text: "Andet", postalCode: "2770", city: "Kastrup", ...kastrup },
    });

    const results = await Promise.allSettled([
      claimEmployeeSlot(db.sql, { booking: a, bufferMinutes: 30, drive }),
      claimEmployeeSlot(db.sql, { booking: b, bufferMinutes: 30, drive }),
    ]);
    const wins = results.filter((r) => r.status === "fulfilled");
    const losses = results.filter((r) => r.status === "rejected");
    expect(wins).toHaveLength(1);
    expect(losses).toHaveLength(1);
    expect((losses[0] as PromiseRejectedResult).reason).toBeInstanceOf(SlotTakenError);
  });

  it("rejects travel-too-close visits that do not overlap on the clock", async () => {
    const drive = () => ({ drivingMinutes: 40, source: "estimat" as const });
    await claimEmployeeSlot(db.sql, {
      booking: booking({
        id: "first-job",
        start: "2026-09-19T08:00:00.000Z",
        end: "2026-09-19T08:40:00.000Z",
        employee: { id: "ejer", name: "Ejer" },
      }),
      bufferMinutes: 30,
      drive,
    });

    await expect(
      claimEmployeeSlot(db.sql, {
        booking: booking({
          id: "too-close",
          start: "2026-09-19T08:50:00.000Z",
          end: "2026-09-19T09:30:00.000Z",
          employee: { id: "ejer", name: "Ejer" },
          address: { text: "København", postalCode: "2100", city: "København", ...far },
        }),
        bufferMinutes: 30,
        drive,
      }),
    ).rejects.toBeInstanceOf(SlotTakenError);
  });

  it("allows two hairdressers at the same clock time", async () => {
    const drive = () => ({ drivingMinutes: 40, source: "estimat" as const });
    const start = "2026-09-20T11:00:00.000Z";
    const end = "2026-09-20T11:40:00.000Z";
    await expect(
      Promise.all([
        claimEmployeeSlot(db.sql, {
          booking: booking({
            id: "hair-1",
            start,
            end,
            employee: { id: "anna", name: "Anna" },
          }),
          bufferMinutes: 30,
          drive,
        }),
        claimEmployeeSlot(db.sql, {
          booking: booking({
            id: "hair-2",
            start,
            end,
            employee: { id: "bo", name: "Bo" },
          }),
          bufferMinutes: 30,
          drive,
        }),
      ]),
    ).resolves.toHaveLength(2);
  });

  it("expires an unpaid hold and frees the slot", async () => {
    const drive = () => ({ drivingMinutes: 5, source: "rute" as const });
    const start = "2026-09-21T10:00:00.000Z";
    const end = "2026-09-21T10:40:00.000Z";
    await claimEmployeeSlot(db.sql, {
      booking: booking({
        id: "hold-old",
        createdAt: "2026-09-21T08:00:00.000Z",
        holdUntil: "2026-09-21T08:45:00.000Z",
        status: "afventer_betaling",
        slotOccupied: true,
        start,
        end,
        employee: { id: "ejer", name: "Ejer" },
        payment: {
          method: "mobilepay",
          status: "afventer",
          amountKr: 350,
          reference: "KF-HOLDOLD",
          mode: "online",
        },
      }),
      bufferMinutes: 30,
      drive,
      now: new Date("2026-09-21T08:10:00.000Z"),
    });

    await expect(
      claimEmployeeSlot(db.sql, {
        booking: booking({
          id: "after-expire",
          start,
          end,
          employee: { id: "ejer", name: "Ejer" },
        }),
        bufferMinutes: 30,
        drive,
        now: new Date("2026-09-21T08:50:00.000Z"),
      }),
    ).resolves.toMatchObject({ id: "after-expire" });
  });

  afterAll(async () => {
    if (db) await db.stop();
  });
});
