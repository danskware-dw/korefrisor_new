import type { AppConfig } from "@/config/types";
import type { Booking } from "@/lib/store";

export type CancelOutcome = {
  free: boolean;
  hoursUntil: number;
  feeKr: number;
  refundKr: number;
  paidKr: number;
};

/** Timer til start (kan være negativ hvis tiden er passeret). */
export function hoursUntilStart(startIso: string, now = Date.now()): number {
  return (new Date(startIso).getTime() - now) / 3_600_000;
}

export function isBookingPaid(booking: Booking): boolean {
  if (booking.payment?.status === "betalt") return true;
  return (booking.payment?.capturedOre ?? 0) > 0;
}

/** Afbudsregler: ≥24 t gratis, ellers 100 kr. gebyr. Ubetalte tider refunderes ikke. */
export function cancelOutcome(
  booking: Booking,
  config: Pick<AppConfig, "cancelFreeHours" | "lateCancelFeeKr">,
  now = Date.now(),
): CancelOutcome {
  const paidKr = isBookingPaid(booking)
    ? (booking.payment?.amountKr ?? booking.pricing.total)
    : 0;
  const hoursUntil = hoursUntilStart(booking.start, now);
  const free = hoursUntil >= config.cancelFreeHours;
  const feeKr = free ? 0 : config.lateCancelFeeKr;
  return {
    free,
    hoursUntil,
    feeKr,
    refundKr: Math.max(0, paidKr - feeKr),
    paidKr,
  };
}

export function paymentReference(bookingId: string): string {
  return `KF-${bookingId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
