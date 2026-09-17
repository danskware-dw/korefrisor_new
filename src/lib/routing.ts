import { estimateRoute } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";

/** Rutens punkter som [breddegrad, længdegrad] — samme rækkefølge som kortet bruger. */
export type RoutePoint = [number, number];

export type Route = {
  distanceKm: number;
  drivingMinutes: number;
  /** Selve vejen tegnet på kortet. Tom hvis vi kun har et estimat. */
  geometry: RoutePoint[];
  /** "rute" = rigtig kørselsrute, "estimat" = beregnet ud fra fugleflugtslinjen. */
  source: "rute" | "estimat";
};

const OSRM_BASE = process.env.OSRM_BASE_URL ?? "https://router.project-osrm.org";

/**
 * Finder kørselsafstanden fra din adresse til kundens.
 *
 * Som standard bruges OSRM's åbne server, der giver den rigtige kørselsrute
 * gratis og uden nøgle. Kan den ikke nås, falder vi tilbage til et estimat
 * (fugleflugtsafstand × vejfaktor), så en booking aldrig blokeres af en
 * teknisk fejl. Se README, afsnittet "Kørselsafstand".
 */
export async function getRoute(
  destination: { lat: number; lon: number },
  origin?: { lat: number; lon: number },
): Promise<Route> {
  const { home } = await getConfig();
  const start = origin ?? home;
  const from = `${start.lon},${start.lat}`;
  const to = `${destination.lon},${destination.lat}`;
  const url = `${OSRM_BASE}/route/v1/driving/${from};${to}?overview=simplified&geometries=geojson`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86_400 },
    });
    if (!response.ok) throw new Error(`Rute-API svarede ${response.status}`);

    const data = (await response.json()) as {
      code: string;
      routes?: {
        distance: number;
        duration: number;
        geometry?: { coordinates: [number, number][] };
      }[];
    };

    const route = data.routes?.[0];
    if (data.code !== "Ok" || !route) throw new Error("Ingen rute fundet");

    return {
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      drivingMinutes: Math.max(5, Math.round(route.duration / 60)),
      geometry: (route.geometry?.coordinates ?? []).map(([lon, lat]) => [lat, lon]),
      source: "rute",
    };
  } catch {
    const fallback = estimateRoute(destination, start);
    return { ...fallback, geometry: [], source: "estimat" };
  }
}
