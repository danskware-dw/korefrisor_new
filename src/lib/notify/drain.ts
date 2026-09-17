import type { Sql } from "postgres";
import { getBooking } from "@/lib/store";
import {
  claimOutboxBatch,
  isStaleOutbox,
  markOutboxRetry,
  markOutboxSent,
  markOutboxSkipped,
  releaseSendKey,
  reserveSendKey,
  type OutboxKind,
  type OutboxRow,
} from "./outbox";
import {
  sendBookingMessages,
  sendCancelMessages,
  sendExpireMessages,
  sendPaymentInstructions,
  sendReminderEmail,
  sendRescheduleMessages,
} from "@/lib/notify";
import { cancelOutcome } from "@/lib/payment-policy";
import { getConfig } from "@/lib/runtime-config";

export async function drainOutbox(sql: Sql): Promise<number> {
  const rows = await claimOutboxBatch(sql);
  for (const row of rows) {
    await processRow(sql, row);
  }
  return rows.length;
}

async function processRow(sql: Sql, row: OutboxRow): Promise<void> {
  const booking = await getBooking(row.booking_id);
  if (!booking) {
    await markOutboxSkipped(sql, row.id, "booking mangler");
    return;
  }
  const payload = row.payload as { start?: string; bookingId?: string };
  const kind = row.kind as OutboxKind;
  if (isStaleOutbox(kind, booking, payload)) {
    await markOutboxSkipped(sql, row.id, "stale");
    return;
  }

  const reserved = await reserveSendKey(sql, row.send_key);
  if (!reserved) {
    await markOutboxSkipped(sql, row.id, "already sent");
    return;
  }

  try {
    if (kind === "payment_instructions") await sendPaymentInstructions(booking);
    else if (kind === "confirmation") await sendBookingMessages(booking);
    else if (kind === "reminder") await sendReminderEmail(booking);
    else if (kind === "reschedule") await sendRescheduleMessages(booking);
    else if (kind === "cancel") {
      const config = await getConfig();
      await sendCancelMessages(booking, cancelOutcome(booking, config));
    } else if (kind === "expire") await sendExpireMessages(booking);
    await markOutboxSent(sql, row);
  } catch (error) {
    await releaseSendKey(sql, row.send_key);
    await markOutboxRetry(
      sql,
      row.id,
      error instanceof Error ? error.message : "send fejlede",
      row.attempts + 1,
    );
  }
}
