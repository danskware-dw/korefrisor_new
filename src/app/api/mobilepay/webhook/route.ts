import { NextResponse } from "next/server";
import { readyAppSql } from "@/lib/db/client";
import {
  getMobilePayPayment,
  verifyVippsWebhook,
} from "@/lib/mobilepay";
import { drainOutbox } from "@/lib/notify/drain";
import { drainCaptures } from "@/lib/payments/capture-worker";
import { AUTHORIZATION_PROVIDER_ID } from "@/lib/payments/operation-id";
import { reconcilePayment } from "@/lib/payments/reconcile";
import { getBookingByPaymentReference } from "@/lib/store";

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyVippsWebhook(request, raw)) {
    return NextResponse.json({ error: "Ugyldig webhook." }, { status: 401 });
  }

  let body: {
    reference?: string;
    name?: string;
  };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  const reference = body.reference;
  if (!reference) return NextResponse.json({ ok: true });

  const booking = await getBookingByPaymentReference(reference);
  if (!booking) return NextResponse.json({ ok: true });

  const payment = await getMobilePayPayment(reference);
  const sql = await readyAppSql();
  const name = (body.name ?? "").toLowerCase();

  if (name.includes("authorized") || payment?.state === "AUTHORIZED") {
    await reconcilePayment(sql, booking, {
      reference,
      state: "AUTHORIZED",
      operation: "authorization",
      providerId: AUTHORIZATION_PROVIDER_ID,
      amountOre: payment?.authorizedOre ?? Math.round(booking.payment.amountKr * 100),
      source: "webhook",
    });
  }

  const fresh = (await getBookingByPaymentReference(reference)) ?? booking;
  for (const capture of payment?.captures ?? []) {
    await reconcilePayment(sql, fresh, {
      reference,
      state: payment?.state,
      operation: "capture",
      providerId: capture.id,
      amountOre: capture.amountOre,
      source: "webhook",
    });
  }
  for (const refund of payment?.refunds ?? []) {
    await reconcilePayment(sql, fresh, {
      reference,
      state: payment?.state,
      operation: "refund",
      providerId: refund.id,
      amountOre: refund.amountOre,
      source: "webhook",
    });
  }

  if (sql) {
    await drainCaptures(sql);
    await drainOutbox(sql);
  }

  return NextResponse.json({ ok: true });
}
