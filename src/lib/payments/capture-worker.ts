import type { Sql } from "postgres";
import { captureMobilePay, getMobilePayPayment } from "@/lib/mobilepay";
import { reconcilePayment } from "./reconcile";
import { getBooking } from "@/lib/store";

export async function drainCaptures(sql: Sql): Promise<number> {
  const rows = await sql<
    { id: string; booking_id: string; idempotency_key: string; attempts: number }[]
  >`
    UPDATE payment_operations
    SET status = 'processing'
    WHERE id IN (
      SELECT id FROM payment_operations
      WHERE kind = 'capture' AND status = 'pending' AND next_attempt_at <= now()
      ORDER BY next_attempt_at
      LIMIT 10
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, booking_id, idempotency_key, attempts
  `;

  for (const row of rows) {
    const booking = await getBooking(row.booking_id);
    if (!booking) {
      await sql`UPDATE payment_operations SET status = 'skipped' WHERE id = ${row.id}`;
      continue;
    }
    const amountOre = Math.round(booking.payment.amountKr * 100);
    try {
      await captureMobilePay({
        reference: booking.payment.reference,
        amountOre,
        idempotencyKey: row.idempotency_key,
      });
      const payment = await getMobilePayPayment(booking.payment.reference);
      const captures = payment?.captures?.length
        ? payment.captures
        : [];
      for (const capture of captures) {
        await reconcilePayment(sql, (await getBooking(booking.id)) ?? booking, {
          reference: booking.payment.reference,
          state: payment?.state ?? "CAPTURED",
          operation: "capture",
          providerId: capture.id,
          amountOre: capture.amountOre,
          source: "api",
        });
      }
      await sql`UPDATE payment_operations SET status = 'done', last_error = NULL WHERE id = ${row.id}`;
    } catch (error) {
      const delay = Math.min(30, 2 ** Math.min(row.attempts + 1, 5));
      await sql`
        UPDATE payment_operations
        SET status = 'pending',
            attempts = ${row.attempts + 1},
            next_attempt_at = now() + (${delay} || ' minutes')::interval,
            last_error = ${error instanceof Error ? error.message : "capture fejlede"}
        WHERE id = ${row.id}
      `;
    }
  }
  return rows.length;
}
