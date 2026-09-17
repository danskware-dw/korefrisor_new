import { NextResponse } from "next/server";
import { buildCareHomeQuote, buildQuote, careHomeServiceIds } from "@/lib/pricing";
import { getRoute } from "@/lib/routing";
import { bookableServicesOf, getConfig } from "@/lib/runtime-config";

/** Beregner pris inkl. kørselstillæg. Beregningen sker altid på serveren. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørgsel." }, { status: 400 });
  }

  const { serviceIds, lat, lon, employeeId, kind, residents } = (body ?? {}) as {
    serviceIds?: unknown;
    lat?: unknown;
    lon?: unknown;
    employeeId?: unknown;
    kind?: unknown;
    residents?: unknown;
  };

  const config = await getConfig();
  const isCareHome = kind === "plejehjem";
  const residentCount =
    typeof residents === "number" ? residents : Number(residents);
  const validIds = new Set<string>(bookableServicesOf(config).map((s) => s.id));
  const ids = isCareHome
    ? careHomeServiceIds(residentCount, config.services)
    : Array.isArray(serviceIds)
      ? serviceIds.filter((id): id is string => typeof id === "string" && validIds.has(id))
      : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "Vælg mindst én behandling." }, { status: 400 });
  }
  if (typeof lat !== "number" || typeof lon !== "number") {
    return NextResponse.json({ error: "Vælg en adresse fra listen." }, { status: 400 });
  }

  const employee =
    typeof employeeId === "string"
      ? config.employees.find((item) => item.id === employeeId)
      : undefined;
  const origin = employee
    ? { lat: employee.base.lat, lon: employee.base.lon }
    : undefined;

  const route = await getRoute({ lat, lon }, origin);
  const quote = isCareHome
    ? buildCareHomeQuote(residentCount, route, config.services, config.travel)
    : buildQuote(ids, route, config.services, config.travel);
  return NextResponse.json({
    quote,
    route: { geometry: route.geometry, source: route.source },
  });
}
