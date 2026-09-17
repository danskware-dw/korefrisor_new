import { NextResponse } from "next/server";
import { availableSlots } from "@/lib/availability";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const date = params.get("dato") ?? "";
  const duration = Number(params.get("varighed") ?? "0");
  const employeeId = params.get("frisor") ?? undefined;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Ugyldig dato." }, { status: 400 });
  }
  if (!Number.isFinite(duration) || duration <= 0 || duration > 8 * 60) {
    return NextResponse.json({ error: "Ugyldig varighed." }, { status: 400 });
  }

  const destination =
    Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : undefined;

  return NextResponse.json({
    slots: await availableSlots({
      date,
      durationMinutes: duration,
      employeeId,
      destination,
    }),
  });
}
