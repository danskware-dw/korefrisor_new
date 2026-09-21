import { NextResponse } from "next/server";
import { getBookingByCancelToken } from "@/lib/store";
import { getConfig } from "@/lib/runtime-config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const booking = await getBookingByCancelToken(token);
  if (!booking) return new NextResponse("Ikke fundet", { status: 404 });
  const config = await getConfig();
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const stamp = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${config.name}//hjemmeklip//DA`,
    "BEGIN:VEVENT",
    `UID:${booking.id}@frisorhjem`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Hjemmeklip hos ${config.name}`,
    `LOCATION:${booking.address.text}`,
    `DESCRIPTION:Se eller aflys: ${config.siteUrl}/aftale/${booking.cancelToken}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="hjemmeklip.ics"`,
    },
  });
}
