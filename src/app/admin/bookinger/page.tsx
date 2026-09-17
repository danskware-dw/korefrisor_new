import type { Metadata } from "next";
import { getConfig } from "@/lib/runtime-config";
import { listBookings, listBookingsByTime, searchBookings } from "@/lib/store";
import { requireAdmin } from "../actions";
import { BookingCard } from "../BookingCard";

export const metadata: Metadata = { title: "Bookinger" };

export default async function BookingerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const [matchIds, { upcoming, past }, config, all] = await Promise.all([
    q.trim()
      ? searchBookings(q).then((list) => new Set(list.map((b) => b.id)))
      : Promise.resolve(null as Set<string> | null),
    listBookingsByTime(),
    getConfig(),
    listBookings(),
  ]);
  const upcomingShown = matchIds ? upcoming.filter((b) => matchIds.has(b.id)) : upcoming;
  const pastShown = matchIds ? past.filter((b) => matchIds.has(b.id)) : past;
  const verifyQueue = all.filter(
    (b) => b.payment.mode === "manuel" && b.payment.status === "afventer" && !b.manualPaymentVerifiedAt,
  );
  const refundQueue = all.filter(
    (b) => b.payment.status === "refund_pending" || Boolean(b.refundPendingAt),
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">Bookinger</h1>
      <p className="mt-2 text-ink-soft">
        Søg på navn, telefon, e-mail eller adresse. Tildel frisør og sæt status til{" "}
        <strong>Udført</strong>, når personen har arbejdet.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin/bookinger">
        <label htmlFor="q" className="sr-only">
          Søg
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Søg i bookinger"
          className="min-w-60 flex-1 rounded-lg border-2 border-line bg-surface px-4 py-3 text-lg"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Søg
        </button>
      </form>

      {!q.trim() && (verifyQueue.length > 0 || refundQueue.length > 0) && (
        <>
          {verifyQueue.length > 0 && (
            <Section
              title={`Manuel betaling til tjek (${verifyQueue.length})`}
              bookings={verifyQueue}
              employees={config.employees}
            />
          )}
          {refundQueue.length > 0 && (
            <Section
              title={`Afventer refundering (${refundQueue.length})`}
              bookings={refundQueue}
              employees={config.employees}
            />
          )}
        </>
      )}

      <Section
        title={`Kommende (${upcomingShown.length})`}
        bookings={upcomingShown}
        employees={config.employees}
      />
      <Section
        title={`Tidligere (${pastShown.length})`}
        bookings={pastShown}
        employees={config.employees}
      />
    </div>
  );
}

function Section({
  title,
  bookings,
  employees,
}: {
  title: string;
  bookings: Awaited<ReturnType<typeof listBookingsByTime>>["upcoming"];
  employees: Awaited<ReturnType<typeof getConfig>>["employees"];
}) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-ink-soft">Ingen bookinger her.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} employees={employees} />
          ))}
        </ul>
      )}
    </section>
  );
}
