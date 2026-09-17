import { randomUUID } from "node:crypto";
import type { Sql } from "postgres";
import type { Booking } from "@/lib/store";

export type OutboxKind =
  | "payment_instructions"
  | "confirmation"
  | "reminder"
  | "reschedule"
  | "cancel"
  | "expire";

export type OutboxRow = {
  id: string;
  booking_id: string;
  kind: OutboxKind;
  send_key: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number;
  next_attempt_at: Date;
  last_error: string | null;
};

export function outboxSendKey(booking: Booking, kind: OutboxKind): string {
  if (kind === "cancel") return `${booking.id}:cancel:${booking.cancel?.at ?? booking.start}`;
  if (kind === "reminder") {
    return `${booking.id}:reminder:${booking.reminderForStart ?? booking.start}`;
  }
  if (kind === "expire") return `${booking.id}:expire:${booking.start}`;
  return `${booking.id}:${kind}:${booking.start}`;
}

export function isStaleOutbox(
  kind: OutboxKind,
  booking: Booking,
  payload: { start?: string; bookingId?: string },
): boolean {
  if (payload.bookingId && payload.bookingId !== booking.id) return true;

  if (kind === "cancel" || kind === "expire") {
    return false;
  }

  if (booking.status === "aflyst" || booking.status === "udlobet") return true;
  if (payload.start && payload.start !== booking.start) return true;
  if (kind === "reminder" && booking.reminderForStart && payload.start !== booking.reminderForStart) {
    return true;
  }
  return false;
}

export async function enqueueOutbox(
  sql: Sql,
  booking: Booking,
  kind: OutboxKind,
  sendKey: string,
): Promise<void> {
  const payload = {
    bookingId: booking.id,
    start: booking.start,
    end: booking.end,
    kind,
  };
  await sql`
    INSERT INTO outbox (id, booking_id, kind, send_key, payload, status, attempts, next_attempt_at)
    VALUES (
      ${randomUUID()},
      ${booking.id},
      ${kind},
      ${sendKey},
      ${sql.json(payload)},
      'pending',
      0,
      now()
    )
    ON CONFLICT (send_key) DO NOTHING
  `;
}

export async function claimOutboxBatch(sql: Sql, limit = 10): Promise<OutboxRow[]> {
  return sql<OutboxRow[]>`
    UPDATE outbox
    SET status = 'processing'
    WHERE id IN (
      SELECT id FROM outbox
      WHERE status = 'pending' AND next_attempt_at <= now()
      ORDER BY next_attempt_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `;
}

export async function reserveSendKey(sql: Sql, sendKey: string): Promise<boolean> {
  const rows = await sql<{ send_key: string }[]>`
    INSERT INTO message_deliveries (send_key) VALUES (${sendKey})
    ON CONFLICT (send_key) DO NOTHING
    RETURNING send_key
  `;
  return rows.length > 0;
}

export async function releaseSendKey(sql: Sql, sendKey: string): Promise<void> {
  await sql`DELETE FROM message_deliveries WHERE send_key = ${sendKey}`;
}

export async function markOutboxSent(sql: Sql, row: OutboxRow): Promise<void> {
  await sql`
    UPDATE outbox SET status = 'sent', last_error = NULL WHERE id = ${row.id}
  `;
}

export async function markOutboxSkipped(sql: Sql, id: string, reason: string): Promise<void> {
  await sql`UPDATE outbox SET status = 'skipped', last_error = ${reason} WHERE id = ${id}`;
}

export async function markOutboxRetry(sql: Sql, id: string, error: string, attempts: number): Promise<void> {
  const delayMin = Math.min(30, 2 ** Math.min(attempts, 5));
  await sql`
    UPDATE outbox
    SET status = 'pending',
        attempts = ${attempts},
        next_attempt_at = now() + (${delayMin} || ' minutes')::interval,
        last_error = ${error}
    WHERE id = ${id}
  `;
}

export async function cancelPendingReminders(sql: Sql, bookingId: string): Promise<void> {
  await sql`
    UPDATE outbox
    SET status = 'skipped', last_error = 'rescheduled'
    WHERE booking_id = ${bookingId} AND kind = 'reminder' AND status IN ('pending', 'processing')
  `;
}
