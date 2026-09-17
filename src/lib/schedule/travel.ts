import { estimateRoute } from "@/lib/pricing";

export type DriveSource = "rute" | "estimat";

export type Coord = { lat: number; lon: number };

/** Extra minutes when OSRM failed — never use setup buffer alone. */
export function conservativeDriveMinutes(
  drivingMinutes: number,
  source: DriveSource,
): number {
  const base = Math.max(0, drivingMinutes);
  if (source === "rute") return base;
  return base + Math.max(15, Math.ceil(base * 0.5));
}

export function estimatedDriveMinutes(from: Coord, to: Coord): number {
  return estimateRoute(to, from).drivingMinutes;
}

export function scheduleGapMinutes(input: {
  drivingMinutes: number;
  source: DriveSource;
  bufferMinutes: number;
}): number {
  return conservativeDriveMinutes(input.drivingMinutes, input.source) + input.bufferMinutes;
}

export function conservativeEstimatedGapMinutes(
  from: Coord,
  to: Coord,
  bufferMinutes: number,
): number {
  return scheduleGapMinutes({
    drivingMinutes: estimatedDriveMinutes(from, to),
    source: "estimat",
    bufferMinutes,
  });
}
