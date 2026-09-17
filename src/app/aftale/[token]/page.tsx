import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelBookingForm } from "@/components/CancelBookingForm";
import { RescheduleForm } from "@/components/RescheduleForm";
import { cancelOutcome, hoursUntilStart } from "@/lib/payment-policy";
import { formatDkk } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";
import { getBookingByCancelToken } from "@/lib/store";

type Params = { token: string };

export const metadata: Metadata = {
  title: "Din aftale",
  robots: { index: false, follow: false },
};

export default async function AftalePage({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  const booking = await getBookingByCancelToken(token);
  if (!booking) notFound();

  const config = await getConfig();
  const outcome = cancelOutcome(booking, config);
  const when = new Intl.DateTimeFormat("da-DK", {
    timeZone: "Europe/Copenhagen",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(booking.start));
  const duration = Math.round(
    (new Date(booking.end).getTime() - new Date(booking.start).getTime()) / 60_000,
  );
  const canChange = hoursUntilStart(booking.start) >= 0 && booking.status === "bekraeftet";

  if (booking.status === "aflyst") {
    return (
      <div className="mx-auto max-w-xl px-4 py-14">
        <h1 className="text-3xl font-bold">Allerede aflyst</h1>
        <p className="mt-4 text-lg text-ink-soft">Din tid {when} er aflyst.</p>
        <p className="mt-6">
          <Link href="/book" className="font-semibold text-brand underline">
            Book en ny tid
          </Link>
        </p>
      </div>
    );
  }

  if (booking.status === "udlobet") {
    return (
      <div className="mx-auto max-w-xl px-4 py-14">
        <h1 className="text-3xl font-bold">Tiden er udløbet</h1>
        <p className="mt-4 text-lg">
          Reservationen gik ud, før betalingen blev registreret. Vælg en ny tid.
        </p>
        <p className="mt-6">
          <Link href="/book" className="font-semibold text-brand underline">
            Book igen
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="text-3xl font-bold">Din aftale</h1>
      <p className="mt-4 text-lg">
        <strong>{when}</strong>
        <br />
        {booking.address.text}
        <br />
        {booking.employee ? `${booking.employee.name} · ` : ""}
        {booking.serviceIds.join(", ")}
      </p>
      <p className="mt-3 text-ink-soft">
        MobilePay: {booking.payment.providerState ?? booking.payment.status}
        {typeof booking.payment.capturedOre === "number"
          ? ` · captured ${formatDkk(booking.payment.capturedOre / 100)}`
          : ""}
      </p>
      <p className="mt-4">
        <a href={`/aftale/${token}/ics`} className="font-semibold text-brand underline">
          Download til kalender
        </a>
      </p>

      {canChange && (
        <RescheduleForm
          token={token}
          durationMinutes={duration}
          employeeId={booking.employee?.id}
          lat={booking.address.lat}
          lon={booking.address.lon}
        />
      )}

      <div className="mt-8 rounded-card border-2 border-line bg-surface p-6 text-lg">
        <h2 className="text-xl font-bold">Afbudsregler</h2>
        <p className="mt-3 text-ink-soft">
          Mindst {config.cancelFreeHours} timer før: gratis. Senere: gebyr{" "}
          {formatDkk(config.lateCancelFeeKr)}.
        </p>
      </div>

      {outcome.hoursUntil >= 0 && booking.status !== "udfoert" ? (
        <CancelBookingForm token={token} />
      ) : null}

      <p className="mt-8">
        <Link href="/" className="font-semibold text-brand underline">
          Til forsiden
        </Link>
      </p>
    </div>
  );
}
