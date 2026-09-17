import { NextResponse } from "next/server";
import { readyAppSql } from "@/lib/db/client";
import { getMobilePayPayment, mobilePayOnlineEnabled } from "@/lib/mobilepay";
import { reconcilePayment } from "@/lib/payments/reconcile";
import { AUTHORIZATION_PROVIDER_ID } from "@/lib/payments/operation-id";
import { drainOutbox } from "@/lib/notify/drain";
import { drainCaptures } from "@/lib/payments/capture-worker";
import {
  getBooking,
  getBookingByPaymentReference,
  updateBooking,
} from "@/lib/store";

export async function POST(request: Request) {
  let body: { bookingId?: string; reference?: string; manual?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørgsel." }, { status: 400 });
  }

  const booking =
    (body.bookingId ? await getBooking(body.bookingId) : undefined) ??
    (body.reference ? await getBookingByPaymentReference(body.reference) : undefined);

  if (!booking) {
    return NextResponse.json({ error: "Booking ikke fundet." }, { status: 404 });
  }

  if (booking.status === "bekraeftet" && (booking.payment.status === "betalt" || (booking.payment.capturedOre ?? 0) > 0)) {
    return NextResponse.json({
      ok: true,
      booking: { id: booking.id, start: booking.start, cancelToken: booking.cancelToken },
    });
  }

  if (booking.status === "aflyst" || booking.status === "udlobet") {
    return NextResponse.json({ error: "Bookingen er aflyst." }, { status: 400 });
  }

  const sql = await readyAppSql();

  if (mobilePayOnlineEnabled() && booking.payment.mode === "online" && !body.manual) {
    const payment = await getMobilePayPayment(booking.payment.reference);
    if (!payment || (payment.state !== "AUTHORIZED" && payment.state !== "CAPTURED")) {
      return NextResponse.json(
        {
          error:
            "Betalingen er ikke registreret endnu. Afslut MobilePay, og prøv igen om et øjeblik.",
          state: payment?.state ?? "other",
        },
        { status: 402 },
      );
    }
    if (payment.state === "AUTHORIZED" || payment.authorizedOre > 0) {
      await reconcilePayment(sql, booking, {
        reference: booking.payment.reference,
        state: "AUTHORIZED",
        operation: "authorization",
        providerId: AUTHORIZATION_PROVIDER_ID,
        amountOre: payment.authorizedOre || Math.round(booking.payment.amountKr * 100),
        source: "poll",
      });
    }
    for (const capture of payment.captures) {
      await reconcilePayment(sql, (await getBooking(booking.id)) ?? booking, {
        reference: booking.payment.reference,
        state: payment.state,
        operation: "capture",
        providerId: capture.id,
        amountOre: capture.amountOre,
        source: "poll",
      });
    }
    if (sql) {
      await drainCaptures(sql);
      await drainOutbox(sql);
    }
    const updated = await getBooking(booking.id);
    return NextResponse.json({
      ok: true,
      booking: {
        id: booking.id,
        start: booking.start,
        cancelToken: booking.cancelToken,
        status: updated?.status,
      },
    });
  }

  if (body.manual && mobilePayOnlineEnabled()) {
    return NextResponse.json(
      { error: "Online-betaling skal bekræftes af MobilePay, ikke manuelt." },
      { status: 400 },
    );
  }

  if (!body.manual) {
    return NextResponse.json(
      { error: "Bekræft at du har betalt med MobilePay." },
      { status: 400 },
    );
  }

  const updated = await updateBooking(booking.id, {
    status: "bekraeftet",
    payment: {
      ...booking.payment,
      status: "afventer",
    },
    manualPaymentVerifiedAt: undefined,
  });

  return NextResponse.json({
    ok: true,
    pendingVerification: true,
    booking: {
      id: booking.id,
      start: booking.start,
      cancelToken: booking.cancelToken,
      status: updated?.status,
    },
  });
}
