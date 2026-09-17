import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { readyAppSql } from "@/lib/db/client";
import { getMobilePayPayment, mobilePayOnlineEnabled } from "@/lib/mobilepay";
import { drainOutbox } from "@/lib/notify/drain";
import { drainCaptures } from "@/lib/payments/capture-worker";
import { AUTHORIZATION_PROVIDER_ID } from "@/lib/payments/operation-id";
import { reconcilePayment } from "@/lib/payments/reconcile";
import { formatDkk } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";
import { getBookingByPaymentReference } from "@/lib/store";

export const metadata: Metadata = {
  title: "Betaling",
  robots: { index: false, follow: false },
};

export default async function BetalingReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) redirect("/book");

  let booking = await getBookingByPaymentReference(ref);
  if (!booking) redirect("/book");

  const config = await getConfig();
  const sql = await readyAppSql();

  if (
    booking.status === "afventer_betaling" &&
    mobilePayOnlineEnabled() &&
    booking.payment.mode === "online"
  ) {
    const payment = await getMobilePayPayment(booking.payment.reference);
    if (payment && (payment.state === "AUTHORIZED" || payment.state === "CAPTURED")) {
      booking = await reconcilePayment(sql, booking, {
        reference: booking.payment.reference,
        state: payment.state,
        operation: "authorization",
        providerId: AUTHORIZATION_PROVIDER_ID,
        amountOre: payment.authorizedOre || Math.round(booking.payment.amountKr * 100),
        source: "poll",
      });
      for (const capture of payment.captures) {
        booking = await reconcilePayment(sql, booking, {
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
    }
  }

  const paid =
    booking.status === "bekraeftet" &&
    (booking.payment.status === "betalt" ||
      booking.payment.providerState === "AUTHORIZED" ||
      booking.payment.providerState === "CAPTURED");
  const when = new Intl.DateTimeFormat("da-DK", {
    timeZone: "Europe/Copenhagen",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(booking.start));

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="text-3xl font-bold">
        {paid ? "Betaling modtaget" : "Afslut MobilePay"}
      </h1>
      {paid ? (
        <>
          <p className="mt-4 text-lg">
            Tak. Din tid <strong>{when}</strong> er bekræftet. Beløb:{" "}
            {formatDkk(booking.payment.amountKr)}.
          </p>
          <p className="mt-4 text-lg text-ink-soft">
            Afbud mindst {config.cancelFreeHours} timer før er gratis. Senere koster det{" "}
            {formatDkk(config.lateCancelFeeKr)}.
          </p>
          <p className="mt-6">
            <Link
              href={`/aftale/${booking.cancelToken}`}
              className="font-semibold text-brand underline"
            >
              Se din aftale
            </Link>
          </p>
        </>
      ) : (
        <p className="mt-4 text-lg text-ink-soft">
          Betalingen er ikke registreret endnu. Åbn MobilePay og betal{" "}
          {formatDkk(booking.payment.amountKr)} til <strong>{config.mobilePay}</strong> med
          beskeden <strong>{booking.payment.reference}</strong>.
        </p>
      )}
      <p className="mt-6">
        <Link href="/" className="font-semibold text-brand underline">
          Til forsiden
        </Link>
      </p>
    </div>
  );
}
