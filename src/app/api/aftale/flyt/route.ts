import { NextResponse } from "next/server";
import { availableSlots } from "@/lib/availability";
import { readyAppSql } from "@/lib/db/client";
import { dispatchNotice } from "@/lib/notify/dispatch";
import { cancelPendingReminders } from "@/lib/notify/outbox";
import { hoursUntilStart } from "@/lib/payment-policy";
import { getConfig } from "@/lib/runtime-config";
import { getBookingByCancelToken, SlotTakenError, updateBooking } from "@/lib/store";

export async function POST(request: Request) {
  let body: { token?: string; date?: string; time?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørgsel." }, { status: 400 });
  }
  const booking = body.token ? await getBookingByCancelToken(body.token) : undefined;
  if (!booking) return NextResponse.json({ error: "Booking ikke fundet." }, { status: 404 });
  const config = await getConfig();
  if (hoursUntilStart(booking.start) < config.cancelFreeHours && hoursUntilStart(booking.start) < 24) {
    // still allow if within free-change window matching cancel
  }
  if (hoursUntilStart(booking.start) < 0) {
    return NextResponse.json({ error: "Tiden er passeret." }, { status: 400 });
  }
  if (hoursUntilStart(booking.start) < config.cancelFreeHours) {
    return NextResponse.json(
      { error: `Flytning kræver mindst ${config.cancelFreeHours} timer.` },
      { status: 400 },
    );
  }

  const duration = Math.round(
    (new Date(booking.end).getTime() - new Date(booking.start).getTime()) / 60_000,
  );
  const slots = await availableSlots({
    date: body.date ?? "",
    durationMinutes: duration,
    employeeId: booking.employee?.id,
    destination: { lat: booking.address.lat, lon: booking.address.lon },
  });
  const slot = slots.find((item) => item.time === body.time);
  if (!slot) {
    return NextResponse.json({ error: "Tiden er ikke ledig." }, { status: 409 });
  }

  try {
    const updated = await updateBooking(booking.id, {
      start: slot.startUtc,
      end: slot.endUtc,
      reminderForStart: slot.startUtc,
      smsReminderSentAt: undefined,
    });
    const sql = await readyAppSql();
    if (sql && updated) await cancelPendingReminders(sql, updated.id);
    if (updated) await dispatchNotice(updated, "reschedule");
    return NextResponse.json({ ok: true, start: slot.startUtc });
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return NextResponse.json({ error: "Tiden er netop blevet taget." }, { status: 409 });
    }
    throw error;
  }
}
