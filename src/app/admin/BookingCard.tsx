import type { Employee } from "@/config/types";
import type { Booking } from "@/lib/store";
import { formatDkk } from "@/lib/pricing";
import { assignBookingEmployee, markBookingPaid, markRefundDone, removeBooking, setStatus, verifyManualPayment } from "./actions";

export const statusLabels: Record<string, string> = {
  afventer_betaling: "Afventer betaling",
  bekraeftet: "Bekræftet",
  udfoert: "Udført",
  aflyst: "Aflyst",
  udeblevet: "Udeblevet",
  udlobet: "Udløbet hold",
};

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    timeZone: "Europe/Copenhagen",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    timeZone: "Europe/Copenhagen",
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function BookingCard({
  booking,
  employees = [],
}: {
  booking: Booking;
  employees?: Employee[];
}) {
  return (
    <li className="rounded-card border border-line bg-surface p-5">
      <p className="text-lg font-bold">{formatWhen(booking.start)}</p>
      <p className="mt-1">
        {booking.customer.name} ·{" "}
        <a href={`tel:${booking.customer.phone}`} className="underline">
          {booking.customer.phone}
        </a>{" "}
        ·{" "}
        <a href={`mailto:${booking.customer.email}`} className="underline">
          {booking.customer.email}
        </a>
      </p>
      <p className="mt-1">{booking.address.text}</p>
      <p className="mt-1 text-ink-soft">
        {booking.employee ? `${booking.employee.name} · ` : "Ingen frisør valgt · "}
        {booking.serviceIds.join(", ")} · {booking.pricing.distanceKm} km, ca.{" "}
        {booking.pricing.drivingMinutes} min. kørsel · {formatDkk(booking.pricing.total)}{" "}
        (kørsel {formatDkk(booking.pricing.travelFee)}
        {booking.pricing.familyDiscount
          ? ` · rabat ${formatDkk(booking.pricing.familyDiscount)}`
          : ""}
        )
      </p>
      {booking.relative && (
        <p className="mt-1 text-ink-soft">
          Pårørende: {booking.relative.name} · {booking.relative.phone}
        </p>
      )}
      {(booking.repeatWeeks || booking.smsDayBefore || booking.careHome) && (
        <p className="mt-1 text-ink-soft">
          {booking.careHome
            ? `${booking.careHome.residents} beboere · `
            : ""}
          {booking.repeatWeeks
            ? booking.repeatWeeks === 1
              ? "Fast hver uge · "
              : `Fast hver ${booking.repeatWeeks}. uge · `
            : ""}
          {booking.smsDayBefore ? "E-mail dagen før" : ""}
        </p>
      )}
      <div className="mt-2 rounded-lg bg-muted px-4 py-2">
        <p className="font-semibold">
          💳 Betaling:{" "}
          <span
            className={
              booking.payment?.status === "betalt"
                ? "text-green-700"
                : booking.payment?.status === "afventer"
                  ? "text-orange-700"
                  : "text-ink"
            }
          >
            {booking.payment?.status === "betalt"
              ? "✓ Betalt"
              : booking.payment?.status === "afventer"
                ? "⏳ Afventer"
                : booking.payment?.status === "refunderet"
                  ? "↩ Refunderet"
                  : booking.payment?.status ?? "Ukendt"}
          </span>
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {booking.payment?.mode === "ved_besoeg"
            ? "Betales ved besøg"
            : booking.payment?.mode === "faktura"
              ? "Faktura sendt"
              : booking.payment?.mode === "online"
                ? "MobilePay Online"
                : "Manuel MobilePay"}
          {booking.payment?.reference ? ` · Ref: ${booking.payment.reference}` : ""}
          {booking.payment?.paidAt ? ` · ${formatDay(booking.payment.paidAt)}` : ""}
          {booking.payment?.providerState ? ` · ${booking.payment.providerState}` : ""}
          {typeof booking.payment?.capturedOre === "number"
            ? ` · captured ${formatDkk(booking.payment.capturedOre / 100)}`
            : ""}
          {booking.cancel
            ? ` · Aflyst (gebyr ${formatDkk(booking.cancel.feeKr)}, refund ${formatDkk(booking.cancel.refundKr)})`
            : ""}
        </p>
      </div>
      {booking.customer.note && (
        <p className="mt-2 rounded-lg bg-muted px-4 py-2">Bemærkning: {booking.customer.note}</p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        {booking.payment?.status === "afventer" && !booking.manualPaymentVerifiedAt && booking.payment.mode === "manuel" && (
          <form action={verifyManualPayment}>
            <input type="hidden" name="id" value={booking.id} />
            <button
              type="submit"
              className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-dark"
            >
              Betaling tjekket
            </button>
          </form>
        )}
        {booking.payment?.status === "afventer" && booking.payment.mode !== "manuel" && (
          <form action={markBookingPaid}>
            <input type="hidden" name="id" value={booking.id} />
            <button
              type="submit"
              className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-dark"
            >
              Marker som betalt
            </button>
          </form>
        )}
        {(booking.payment?.status === "refund_pending" || booking.refundPendingAt) && (
          <form action={markRefundDone}>
            <input type="hidden" name="id" value={booking.id} />
            <button
              type="submit"
              className="rounded-lg border-2 border-brand px-5 py-2 font-semibold hover:bg-brand-light"
            >
              Refundering udført
            </button>
          </form>
        )}
        {employees.length > 0 && (
          <form action={assignBookingEmployee} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="bookingId" value={booking.id} />
            <label htmlFor={`frisor-${booking.id}`} className="font-semibold">
              Frisør
            </label>
            <select
              id={`frisor-${booking.id}`}
              name="employeeId"
              defaultValue={booking.employee?.id ?? ""}
              className="rounded-lg border-2 border-line bg-surface px-4 py-2 text-lg"
            >
              <option value="">Ikke tildelt</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                  {employee.active ? "" : " (inaktiv)"}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark"
            >
              Tildel
            </button>
          </form>
        )}
        <form action={setStatus} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={booking.id} />
          <label htmlFor={`status-${booking.id}`} className="font-semibold">
            Status
          </label>
          <select
            id={`status-${booking.id}`}
            name="status"
            defaultValue={booking.status}
            className="rounded-lg border-2 border-line bg-surface px-4 py-2 text-lg"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Gem
          </button>
        </form>
        <form action={removeBooking}>
          <input type="hidden" name="id" value={booking.id} />
          <button
            type="submit"
            className="rounded-lg border-2 border-line px-5 py-2 font-semibold hover:border-brand"
          >
            Slet
          </button>
        </form>
      </div>
    </li>
  );
}
