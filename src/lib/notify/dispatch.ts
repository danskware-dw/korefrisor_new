import type { CancelOutcome } from "@/lib/payment-policy";
import { cancelOutcome } from "@/lib/payment-policy";
import { getConfig } from "@/lib/runtime-config";
import { readyAppSql } from "@/lib/db/client";
import {
  enqueueOutbox,
  outboxSendKey,
  type OutboxKind,
} from "./outbox";
import { drainOutbox } from "./drain";
import {
  sendBookingMessages,
  sendCancelMessages,
  sendExpireMessages,
  sendPaymentInstructions,
  sendReminderEmail,
  sendRescheduleMessages,
} from "@/lib/notify";
import type { Booking } from "@/lib/store";

async function sendNow(
  booking: Booking,
  kind: OutboxKind,
  outcome?: CancelOutcome,
): Promise<void> {
  if (kind === "payment_instructions") await sendPaymentInstructions(booking);
  else if (kind === "confirmation") await sendBookingMessages(booking);
  else if (kind === "reminder") await sendReminderEmail(booking);
  else if (kind === "reschedule") await sendRescheduleMessages(booking);
  else if (kind === "expire") await sendExpireMessages(booking);
  else if (kind === "cancel") {
    const config = await getConfig();
    await sendCancelMessages(booking, outcome ?? cancelOutcome(booking, config));
  }
}

/** Prefer unique send_key + drain; fall back to an immediate send without Postgres. */
export async function dispatchNotice(
  booking: Booking,
  kind: OutboxKind,
  outcome?: CancelOutcome,
): Promise<void> {
  const sql = await readyAppSql();
  if (sql) {
    await enqueueOutbox(sql, booking, kind, outboxSendKey(booking, kind));
    await drainOutbox(sql);
    return;
  }
  await sendNow(booking, kind, outcome);
}
