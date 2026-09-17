import { isOnVacation, getConfig } from "@/lib/runtime-config";
import { activeBookingsFor, type Booking } from "@/lib/store";
import { weekdayOf, copenhagenToUtc } from "@/lib/schedule/copenhagen";
import { visitFits } from "@/lib/schedule/fit";
import { driveBetween } from "@/lib/schedule/drive";
import type { Coord } from "@/lib/schedule/travel";

const SLOT_STEP_MINUTES = 30;

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function timeOf(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export { copenhagenToUtc } from "@/lib/schedule/copenhagen";

export type Slot = { time: string; startUtc: string; endUtc: string };

export type AvailableSlotsInput = {
  date: string;
  durationMinutes: number;
  employeeId?: string;
  destination?: Coord;
};

export async function availableSlots(
  dateIsoOrInput: string | AvailableSlotsInput,
  durationMinutesArg?: number,
): Promise<Slot[]> {
  const input: AvailableSlotsInput =
    typeof dateIsoOrInput === "string"
      ? { date: dateIsoOrInput, durationMinutes: durationMinutesArg ?? 0 }
      : dateIsoOrInput;

  const durationMinutes = input.durationMinutes;
  if (durationMinutes <= 0) return [];

  const config = await getConfig();
  if (config.blockedDates.includes(input.date)) return [];
  if (isOnVacation(config, input.date)) return [];

  const hours = config.openingHours[weekdayOf(input.date)];
  if (!hours) return [];

  const now = Date.now();
  const earliest = now + config.minNoticeHours * 60 * 60 * 1000;
  const latest = now + config.maxAdvanceDays * 24 * 60 * 60 * 1000;

  const occupiedBookings = await activeBookingsFor({
    dateIso: input.date,
    employeeId: input.employeeId,
  });

  const open = minutesOf(hours.from);
  const close = minutesOf(hours.to);
  const slots: Slot[] = [];
  const dest = input.destination;

  for (let m = open; m + durationMinutes <= close; m += SLOT_STEP_MINUTES) {
    const time = timeOf(m);
    const start = copenhagenToUtc(input.date, time);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    if (start.getTime() < earliest || start.getTime() > latest) continue;

    const ok = dest
      ? await visitFits({
          candidate: {
            startMs: start.getTime(),
            endMs: end.getTime(),
            coord: dest,
          },
          occupied: occupiedBookings.map((booking: Booking) => ({
            startMs: new Date(booking.start).getTime(),
            endMs: new Date(booking.end).getTime(),
            coord: { lat: booking.address.lat, lon: booking.address.lon },
          })),
          bufferMinutes: config.bufferMinutes,
          drive: driveBetween,
        })
      : !occupiedBookings.some((booking) => {
          const buffer = config.bufferMinutes * 60 * 1000;
          const tStart = new Date(booking.start).getTime();
          const tEnd = new Date(booking.end).getTime();
          return start.getTime() < tEnd + buffer && end.getTime() + buffer > tStart;
        });

    if (!ok) continue;
    slots.push({ time, startUtc: start.toISOString(), endUtc: end.toISOString() });
  }

  return slots;
}
