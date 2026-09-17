import { NextResponse } from "next/server";
import { cancelOutcome } from "@/lib/payment-policy";
import { dispatchNotice } from "@/lib/notify/dispatch";
import { cancelMobilePay } from "@/lib/mobilepay";
import { getConfig } from "@/lib/runtime-config";
import { getBookingByCancelToken, updateBooking } from "@/lib/store";

/** Aflys booking via kundens unikke link. */
export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørgsel." }, { status: 400 });
  }

  const token = body.token?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ error: "Mangler afbuds-link." }, { status: 400 });
  }

  const booking = await getBookingByCancelToken(token);
  if (!booking) {
    return NextResponse.json({ error: "Booking ikke fundet." }, { status: 404 });
  }
  if (booking.status === "aflyst") {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }
  if (booking.status === "udfoert") {
    return NextResponse.json(
      { error: "Behandlingen er allerede udført og kan ikke aflyses." },
      { status: 400 },
    );
  }

  const config = await getConfig();
  const outcome = cancelOutcome(booking, config);

  if (outcome.hoursUntil < 0) {
    return NextResponse.json(
      { error: "Tiden er allerede passeret. Ring til mig, hvis du har spørgsmål." },
      { status: 400 },
    );
  }

  const updated = await updateBooking(booking.id, {
    status: "aflyst",
    slotOccupied: false,
    payment: {
      ...booking.payment,
      status: outcome.free
        ? outcome.paidKr > 0
          ? "refund_pending"
          : "afventer"
        : outcome.paidKr > 0
          ? "refund_pending"
          : "gebyr_beholdt",
    },
    refundPendingAt: outcome.paidKr > 0 ? new Date().toISOString() : undefined,
    cancel: {
      at: new Date().toISOString(),
      feeKr: outcome.feeKr,
      refundKr: outcome.refundKr,
    },
  });

  if (updated) {
    if (updated.payment.mode === "online" && (updated.payment.capturedOre ?? 0) === 0) {
      await cancelMobilePay(updated.payment.reference);
    }
    await dispatchNotice(updated, "cancel", outcome);
  }

  return NextResponse.json({
    ok: true,
    free: outcome.free,
    feeKr: outcome.feeKr,
    refundKr: outcome.refundKr,
    cancelFreeHours: config.cancelFreeHours,
  });
}
