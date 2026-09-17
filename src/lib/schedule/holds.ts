/** Unpaid online bookings occupy the calendar until this deadline. */
export const HOLD_MINUTES = 45;

export type OccupancyBooking = {
  status: string;
  createdAt: string;
  holdUntil?: string | null;
  slotOccupied?: boolean;
};

export function holdUntilIso(createdAt: string, now = createdAt): string {
  const created = Date.parse(createdAt);
  const origin = Date.parse(now);
  const start = Number.isNaN(created) ? origin : created;
  return new Date(start + HOLD_MINUTES * 60_000).toISOString();
}

/**
 * Whether this row still occupies the hairdresser's calendar.
 * Uses stored holdUntil, not createdAt age.
 */
export function occupiesSlot(booking: OccupancyBooking, now = Date.now()): boolean {
  if (booking.status === "aflyst" || booking.status === "udlobet") return false;
  if (booking.slotOccupied === false) return false;

  if (booking.status === "afventer_betaling") {
    const deadline = booking.holdUntil
      ? Date.parse(booking.holdUntil)
      : Date.parse(booking.createdAt) + HOLD_MINUTES * 60_000;
    if (Number.isNaN(deadline)) return false;
    return now < deadline;
  }

  return true;
}

export function shouldExpireHold(booking: OccupancyBooking, now = Date.now()): boolean {
  return (
    booking.status === "afventer_betaling" &&
    booking.slotOccupied !== false &&
    !occupiesSlot(booking, now)
  );
}
