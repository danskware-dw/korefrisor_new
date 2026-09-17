import type { Sql } from "postgres";
import type { Booking } from "@/lib/store";
import { occupiesSlot } from "@/lib/schedule/holds";
import { SlotTakenError, visitFits, type OccupiedVisit } from "@/lib/schedule/fit";
import type { Coord, DriveSource } from "@/lib/schedule/travel";
import { insertBookingRow, rowToBooking, updateBookingRow, type BookingRow } from "./rows";

export type DriveLookup = (
  from: Coord,
  to: Coord,
) =>
  | Promise<{ drivingMinutes: number; source: DriveSource }>
  | { drivingMinutes: number; source: DriveSource };

function toVisit(booking: Booking, now: Date): OccupiedVisit | null {
  if (!occupiesSlot(booking, now.getTime())) return null;
  return {
    startMs: new Date(booking.start).getTime(),
    endMs: new Date(booking.end).getTime(),
    coord: { lat: booking.address.lat, lon: booking.address.lon },
  };
}

async function expireHolds(sql: Sql, employeeId: string, now: Date): Promise<void> {
  const rows = await sql<BookingRow[]>`
    SELECT * FROM bookings
    WHERE employee_id = ${employeeId}
      AND slot_occupied
      AND status = 'afventer_betaling'
      AND hold_until IS NOT NULL
      AND hold_until <= ${now}
  `;
  for (const row of rows) {
    const booking = rowToBooking(row);
    booking.status = "udlobet";
    booking.slotOccupied = false;
    await updateBookingRow(sql, booking);
  }
}

async function occupiedForEmployee(sql: Sql, employeeId: string): Promise<Booking[]> {
  const rows = await sql<BookingRow[]>`
    SELECT * FROM bookings
    WHERE employee_id = ${employeeId} AND slot_occupied
  `;
  return rows.map(rowToBooking).filter((booking) => occupiesSlot(booking));
}

export async function claimEmployeeSlot(
  sql: Sql,
  input: {
    booking: Booking;
    bufferMinutes: number;
    drive: DriveLookup;
    now?: Date;
    mode?: "insert" | "update";
  },
): Promise<Booking> {
  const employeeId = input.booking.employee?.id;
  if (!employeeId) {
    throw new SlotTakenError("Vælg hvem der skal komme.");
  }

  const now = input.now ?? new Date();
  const candidate = toVisit(input.booking, now);
  if (!candidate) throw new SlotTakenError();

  try {
    return await sql.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(hashtext(${employeeId}))`;
      await expireHolds(tx as unknown as Sql, employeeId, now);

      const others = (await occupiedForEmployee(tx as unknown as Sql, employeeId)).filter(
        (item) => item.id !== input.booking.id,
      );
      const occupied = others
        .map((item) => toVisit(item, now))
        .filter((visit): visit is OccupiedVisit => visit !== null);

      const fits = await visitFits({
        candidate,
        occupied,
        bufferMinutes: input.bufferMinutes,
        drive: input.drive,
      });
      if (!fits) throw new SlotTakenError();

      if (input.mode === "update") {
        await updateBookingRow(tx as unknown as Sql, input.booking);
      } else {
        await insertBookingRow(tx as unknown as Sql, input.booking);
      }
      return input.booking;
    });
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    if (text.includes("bookings_employee_time_excl") || text.includes("23P01")) {
      throw new SlotTakenError();
    }
    throw error;
  }
}
