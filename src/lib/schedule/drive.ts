import { estimateRoute } from "@/lib/pricing";
import type { Coord, DriveSource } from "@/lib/schedule/travel";
import { getRoute } from "@/lib/routing";

export async function driveBetween(
  from: Coord,
  to: Coord,
): Promise<{ drivingMinutes: number; source: DriveSource }> {
  const route = await getRoute(to, from);
  return { drivingMinutes: route.drivingMinutes, source: route.source };
}

/** Deterministic estimate for tests (still marked estimat so gaps stay conservative). */
export function estimateDriveBetween(from: Coord, to: Coord) {
  const estimated = estimateRoute(to, from);
  return {
    drivingMinutes: estimated.drivingMinutes,
    source: "estimat" as const,
  };
}
