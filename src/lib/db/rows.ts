import type { Sql } from "postgres";
import type { Booking } from "@/lib/store";
import { occupiesSlot } from "@/lib/schedule/holds";

export type BookingRow = {
  id: string;
  created_at: Date;
  status: string;
  employee_id: string | null;
  start_at: Date;
  end_at: Date;
  hold_until: Date | null;
  slot_occupied: boolean;
  service_ids: string[];
  cancel_token: string;
  payment_reference: string | null;
  payment_mode: string | null;
  provider_state: string | null;
  authorized_ore: number;
  captured_ore: number;
  refunded_ore: number;
  sms_day_before: boolean | null;
  reminder_for_start: Date | null;
  sms_reminder_sent_at: Date | null;
  lat: number | null;
  lon: number | null;
  manual_payment_verified_at: Date | null;
  manual_payment_verified_by: string | null;
  refund_pending_at: Date | null;
  snapshot: Booking;
};

export function bookingToRow(booking: Booking) {
  return {
    id: booking.id,
    created_at: new Date(booking.createdAt),
    status: booking.status,
    employee_id: booking.employee?.id ?? null,
    start_at: new Date(booking.start),
    end_at: new Date(booking.end),
    hold_until: booking.holdUntil ? new Date(booking.holdUntil) : null,
    slot_occupied: occupiesSlot(booking),
    service_ids: booking.serviceIds,
    cancel_token: booking.cancelToken,
    payment_reference: booking.payment.reference ?? null,
    payment_mode: booking.payment.mode,
    provider_state: booking.payment.providerState ?? null,
    authorized_ore: booking.payment.authorizedOre ?? 0,
    captured_ore: booking.payment.capturedOre ?? 0,
    refunded_ore: booking.payment.refundedOre ?? 0,
    sms_day_before: booking.smsDayBefore ?? null,
    reminder_for_start: booking.reminderForStart
      ? new Date(booking.reminderForStart)
      : new Date(booking.start),
    sms_reminder_sent_at: booking.smsReminderSentAt
      ? new Date(booking.smsReminderSentAt)
      : null,
    lat: booking.address.lat,
    lon: booking.address.lon,
    manual_payment_verified_at: booking.manualPaymentVerifiedAt
      ? new Date(booking.manualPaymentVerifiedAt)
      : null,
    manual_payment_verified_by: booking.manualPaymentVerifiedBy ?? null,
    refund_pending_at: booking.refundPendingAt ? new Date(booking.refundPendingAt) : null,
    snapshot: booking,
  };
}

export function rowToBooking(row: BookingRow): Booking {
  const snap = row.snapshot;
  return {
    ...snap,
    id: row.id,
    createdAt: row.created_at.toISOString(),
    status: row.status as Booking["status"],
    start: row.start_at.toISOString(),
    end: row.end_at.toISOString(),
    holdUntil: row.hold_until?.toISOString(),
    slotOccupied: row.slot_occupied,
    serviceIds: row.service_ids,
    cancelToken: row.cancel_token,
    smsDayBefore: row.sms_day_before ?? snap.smsDayBefore,
    reminderForStart: row.reminder_for_start?.toISOString() ?? snap.reminderForStart,
    smsReminderSentAt: row.sms_reminder_sent_at?.toISOString(),
    manualPaymentVerifiedAt: row.manual_payment_verified_at?.toISOString(),
    manualPaymentVerifiedBy: row.manual_payment_verified_by ?? undefined,
    refundPendingAt: row.refund_pending_at?.toISOString(),
    payment: {
      ...snap.payment,
      reference: row.payment_reference ?? snap.payment.reference,
      mode: (row.payment_mode as Booking["payment"]["mode"]) ?? snap.payment.mode,
      providerState: (row.provider_state as Booking["payment"]["providerState"]) ?? undefined,
      authorizedOre: row.authorized_ore,
      capturedOre: row.captured_ore,
      refundedOre: row.refunded_ore,
    },
  };
}

export async function insertBookingRow(sql: Sql, booking: Booking): Promise<void> {
  const row = bookingToRow(booking);
  await sql`
    INSERT INTO bookings (
      id, created_at, status, employee_id, start_at, end_at, hold_until, slot_occupied,
      service_ids, cancel_token, payment_reference, payment_mode, provider_state,
      authorized_ore, captured_ore, refunded_ore, sms_day_before, reminder_for_start,
      sms_reminder_sent_at, lat, lon, manual_payment_verified_at, manual_payment_verified_by,
      refund_pending_at, snapshot
    ) VALUES (
      ${row.id}, ${row.created_at}, ${row.status}, ${row.employee_id}, ${row.start_at},
      ${row.end_at}, ${row.hold_until}, ${row.slot_occupied}, ${row.service_ids},
      ${row.cancel_token}, ${row.payment_reference}, ${row.payment_mode}, ${row.provider_state},
      ${row.authorized_ore}, ${row.captured_ore}, ${row.refunded_ore}, ${row.sms_day_before},
      ${row.reminder_for_start}, ${row.sms_reminder_sent_at}, ${row.lat}, ${row.lon},
      ${row.manual_payment_verified_at}, ${row.manual_payment_verified_by},
      ${row.refund_pending_at}, ${sql.json(row.snapshot as never)}
    )
  `;
}

export async function updateBookingRow(sql: Sql, booking: Booking): Promise<void> {
  const row = bookingToRow(booking);
  await sql`
    UPDATE bookings SET
      created_at = ${row.created_at},
      status = ${row.status},
      employee_id = ${row.employee_id},
      start_at = ${row.start_at},
      end_at = ${row.end_at},
      hold_until = ${row.hold_until},
      slot_occupied = ${row.slot_occupied},
      service_ids = ${row.service_ids},
      cancel_token = ${row.cancel_token},
      payment_reference = ${row.payment_reference},
      payment_mode = ${row.payment_mode},
      provider_state = ${row.provider_state},
      authorized_ore = ${row.authorized_ore},
      captured_ore = ${row.captured_ore},
      refunded_ore = ${row.refunded_ore},
      sms_day_before = ${row.sms_day_before},
      reminder_for_start = ${row.reminder_for_start},
      sms_reminder_sent_at = ${row.sms_reminder_sent_at},
      lat = ${row.lat},
      lon = ${row.lon},
      manual_payment_verified_at = ${row.manual_payment_verified_at},
      manual_payment_verified_by = ${row.manual_payment_verified_by},
      refund_pending_at = ${row.refund_pending_at},
      snapshot = ${sql.json(row.snapshot as never)}
    WHERE id = ${row.id}
  `;
}
