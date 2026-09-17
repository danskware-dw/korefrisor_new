import type { Metadata } from "next";
import Link from "next/link";
import { summarizeEmployeeWork } from "@/lib/employee-work";
import { listBookings, listBookingsByTime, listCustomers } from "@/lib/store";
import { formatDkk } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";
import { isLoggedIn, login } from "./actions";
import { formatWhen } from "./BookingCard";

export const metadata: Metadata = {
  title: "Overblik",
};

export default async function AdminPage() {
  if (!(await isLoggedIn())) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-bold">Log ind</h1>
        <p className="mt-3 text-ink-soft">
          Dashboardet er kun til dig. Her kan du se bookinger, medarbejdere, kunder,
          kalender, behandlinger og indstillinger.
        </p>
        {!process.env.ADMIN_PASSWORD && (
          <p role="alert" className="mt-4 rounded-lg bg-brand/10 px-4 py-3 text-brand-dark">
            Der er ikke sat et kodeord. Tilføj ADMIN_PASSWORD i din .env.local-fil.
          </p>
        )}
        <form action={login} className="mt-6 space-y-4">
          <label htmlFor="kodeord" className="block text-lg font-semibold">
            Kodeord
          </label>
          <input
            id="kodeord"
            name="kodeord"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border-2 border-line bg-surface px-4 py-3 text-lg"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-brand px-6 py-4 text-lg font-bold text-white hover:bg-brand-dark"
          >
            Log ind
          </button>
        </form>
      </div>
    );
  }

  const [{ upcoming, past }, customers, config, allBookings] = await Promise.all([
    listBookingsByTime(),
    listCustomers(),
    getConfig(),
    listBookings(),
  ]);

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(
    new Date(),
  );
  const todayList = upcoming.filter((booking) => booking.start.startsWith(today));
  const revenue = past
    .filter((booking) => booking.status === "udfoert" || booking.status === "bekraeftet")
    .reduce((sum, booking) => sum + booking.pricing.total, 0);
  const work = summarizeEmployeeWork(config.employees, allBookings);
  const workingToday = work.filter((item) => item.statusToday === "skal-arbejde").length;
  const idleToday = work.filter((item) => item.statusToday === "ledig").length;
  const pendingManual = allBookings.filter(
    (b) => b.payment.mode === "manuel" && b.payment.status === "afventer" && !b.manualPaymentVerifiedAt,
  ).length;
  const authorizedOpen = allBookings.filter(
    (b) => b.payment.providerState === "AUTHORIZED" && (b.payment.capturedOre ?? 0) === 0,
  ).length;
  const pendingRefunds = allBookings.filter(
    (b) => b.payment.status === "refund_pending" || Boolean(b.refundPendingAt),
  ).length;

  const stats = [
    { label: "Kunder", value: String(customers.length), href: "/admin/kunder" },
    {
      label: "Medarbejdere",
      value: String(config.employees.filter((e) => e.active).length),
      href: "/admin/medarbejdere",
    },
    { label: "Kommende tider", value: String(upcoming.length), href: "/admin/bookinger" },
    { label: "I dag", value: String(todayList.length), href: "/admin/kalender" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold">Overblik</h1>
      <p className="mt-2 text-ink-soft">
        En simpel oversigt over kunder, bookinger og hvem der arbejder i dag.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link
              href={stat.href}
              className="block rounded-card border border-line bg-surface p-5 hover:border-brand"
            >
              <p className="text-ink-soft">{stat.label}</p>
              <p className="mt-1 text-4xl font-bold tabular-nums">{stat.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-ink-soft">
        Manuel verifikation: {pendingManual} · Authorized uden capture: {authorizedOpen} ·
        Afventer refundering: {pendingRefunds}
      </p>
      <p className="mt-4 text-ink-soft">
        Tidligere omsætning (bekræftet og udført):{" "}
        <strong className="text-ink tabular-nums">{formatDkk(revenue)}</strong>
      </p>

      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold">Medarbejdere i dag</h2>
          <Link href="/admin/medarbejdere" className="font-semibold text-brand underline">
            Se alle
          </Link>
        </div>
        <p className="mt-2 text-ink-soft">
          {workingToday} skal arbejde · {idleToday} ledige
        </p>
        {work.length === 0 ? (
          <p className="mt-3 text-ink-soft">Ingen medarbejdere endnu.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {work.map((item) => (
              <li
                key={item.employee.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4"
              >
                <div>
                  <p className="font-bold">{item.employee.name}</p>
                  <p className="text-ink-soft">{item.statusLabel}</p>
                </div>
                <p className="tabular-nums text-ink-soft">
                  {item.upcomingTotal} kommende · {item.doneThisMonth} udført denne måned
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold">Næste tider</h2>
          <Link href="/admin/bookinger" className="font-semibold text-brand underline">
            Se alle
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-ink-soft">Ingen kommende bookinger.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.slice(0, 6).map((booking) => (
              <li key={booking.id} className="rounded-card border border-line bg-surface p-4">
                <p className="font-bold">{formatWhen(booking.start)}</p>
                <p>
                  {booking.employee ? `${booking.employee.name} · ` : ""}
                  {booking.customer.name} · {booking.serviceIds.join(", ")} ·{" "}
                  {formatDkk(booking.pricing.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
