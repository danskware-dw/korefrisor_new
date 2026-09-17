import { describe, expect, it } from "vitest";
import {
  conservativeDriveMinutes,
  conservativeEstimatedGapMinutes,
  scheduleGapMinutes,
} from "./travel";
import { visitFits } from "./fit";

const kastrup = { lat: 55.6306, lon: 12.6453 };
const far = { lat: 55.6761, lon: 12.5683 };

describe("conservative travel gaps", () => {
  it("does not pad routed minutes", () => {
    expect(conservativeDriveMinutes(20, "rute")).toBe(20);
  });

  it("pads estimates by max(15, 50%) and never buffer-only", () => {
    expect(conservativeDriveMinutes(10, "estimat")).toBe(25);
    expect(conservativeDriveMinutes(40, "estimat")).toBe(60);
    const gap = scheduleGapMinutes({
      drivingMinutes: 10,
      source: "estimat",
      bufferMinutes: 30,
    });
    expect(gap).toBe(55);
    expect(gap).toBeGreaterThan(30);
  });

  it("keeps a tight gap blocked when routing is an estimate", async () => {
    const gap = conservativeEstimatedGapMinutes(kastrup, far, 30);
    const start = Date.parse("2026-09-18T08:00:00.000Z");
    const firstEnd = start + 40 * 60_000;
    const tooSoon = firstEnd + 10 * 60_000;
    const fits = await visitFits({
      candidate: {
        startMs: tooSoon,
        endMs: tooSoon + 40 * 60_000,
        coord: far,
      },
      occupied: [{ startMs: start, endMs: firstEnd, coord: kastrup }],
      bufferMinutes: 30,
      drive: () => ({ drivingMinutes: 10, source: "estimat" }),
    });
    expect(fits).toBe(false);
    expect(gap).toBeGreaterThan(10);
  });

  it("allows two hairdressers at the same clock time", async () => {
    const start = Date.parse("2026-09-18T10:00:00.000Z");
    const fits = await visitFits({
      candidate: { startMs: start, endMs: start + 40 * 60_000, coord: kastrup },
      occupied: [],
      bufferMinutes: 30,
      drive: () => ({ drivingMinutes: 40, source: "estimat" }),
    });
    expect(fits).toBe(true);
  });
});
