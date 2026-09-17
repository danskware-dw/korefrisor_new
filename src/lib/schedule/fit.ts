import type { Coord, DriveSource } from "./travel";
import { scheduleGapMinutes } from "./travel";

export type OccupiedVisit = {
  startMs: number;
  endMs: number;
  coord: Coord;
};

export type DriveLookup = (
  from: Coord,
  to: Coord,
) =>
  | Promise<{ drivingMinutes: number; source: DriveSource }>
  | { drivingMinutes: number; source: DriveSource };

export class SlotTakenError extends Error {
  constructor(message = "Tiden er netop blevet taget") {
    super(message);
    this.name = "SlotTakenError";
  }
}

export async function visitFits(input: {
  candidate: OccupiedVisit;
  occupied: OccupiedVisit[];
  bufferMinutes: number;
  drive: DriveLookup;
}): Promise<boolean> {
  const { candidate, occupied, bufferMinutes, drive } = input;

  for (const other of occupied) {
    if (candidate.startMs < other.endMs && candidate.endMs > other.startMs) {
      return false;
    }

    const earlier = candidate.startMs <= other.startMs ? candidate : other;
    const later = earlier === candidate ? other : candidate;
    const gap = await drive(earlier.coord, later.coord);
    const neededMs =
      scheduleGapMinutes({
        drivingMinutes: gap.drivingMinutes,
        source: gap.source,
        bufferMinutes,
      }) * 60_000;

    if (later.startMs < earlier.endMs + neededMs) return false;
  }

  return true;
}
