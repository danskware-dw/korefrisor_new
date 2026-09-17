import { NextResponse } from "next/server";
import { readyAppSql } from "@/lib/db/client";
import { enqueueOutbox, outboxSendKey } from "@/lib/notify/outbox";
import { isCopenhagenDaytime, isCopenhagenTomorrow } from "@/lib/schedule/copenhagen";
import { listBookings, updateBooking } from "@/lib/store";
import { drainOutbox } from "@/lib/notify/drain";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isCopenhagenDaytime()) {
    return NextResponse.json({ ok: true, window: "outside" });
  }
  const sql = await readyAppSql();
  const now = Date.now();
  let queued = 0;
  for (const booking of await listBookings()) {
    if (!booking.smsDayBefore) continue;
    if (booking.status !== "bekraeftet" || booking.slotOccupied === false) continue;
    if (booking.smsReminderSentAt) continue;
    if (!isCopenhagenTomorrow(booking.start, now)) continue;
    if (sql) {
      await enqueueOutbox(sql, booking, "reminder", outboxSendKey(booking, "reminder"));
      await updateBooking(booking.id, { smsReminderSentAt: new Date().toISOString() });
      queued += 1;
    }
  }
  if (sql) await drainOutbox(sql);
  return NextResponse.json({ ok: true, queued });
}
