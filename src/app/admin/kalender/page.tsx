import type { Metadata } from "next";
import Link from "next/link";
import { bookingsInMonth } from "@/lib/store";
import { getConfig } from "@/lib/runtime-config";
import { requireAdmin } from "../actions";
import { statusLabels } from "../BookingCard";

export const metadata: Metadata = { title: "Kalender" };

const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("da-DK", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

function shiftMonth(year: number, month: number, delta: number): string {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ maaned?: string }>;
}) {
  await requireAdmin();
  const { maaned } = await searchParams;
  const now = new Date();
  const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const value = maaned && /^\d{4}-\d{2}$/.test(maaned) ? maaned : fallback;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));

  const [bookings, config] = await Promise.all([bookingsInMonth(year, month), getConfig()]);
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = firstWeekday + daysInMonth;
  const rows = Math.ceil(cells / 7);

  const byDay = new Map<number, typeof bookings>();
  for (const booking of bookings) {
    const localDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Copenhagen",
    }).format(new Date(booking.start));
    const day = Number(localDate.slice(8, 10));
    const list = byDay.get(day) ?? [];
    list.push(booking);
    byDay.set(day, list);
  }

  const vacationDays = new Set<number>();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${value}-${String(day).padStart(2, "0")}`;
    if (config.vacations.some((v) => iso >= v.from && iso <= v.to)) {
      vacationDays.add(day);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold capitalize">{monthLabel(year, month)}</h1>
        <div className="flex gap-2">
          <Link
            href={`/admin/kalender?maaned=${shiftMonth(year, month, -1)}`}
            className="rounded-lg border-2 border-line px-4 py-2 font-semibold"
          >
            Forrige
          </Link>
          <Link
            href={`/admin/kalender?maaned=${shiftMonth(year, month, 1)}`}
            className="rounded-lg border-2 border-line px-4 py-2 font-semibold"
          >
            Næste
          </Link>
        </div>
      </div>
      <p className="mt-2 text-ink-soft">
        Ferie vises med blå baggrund. Klik på en booking for at se den under Bookinger.
      </p>

      <div className="mt-8 overflow-x-auto">
        <div className="grid min-w-[48rem] grid-cols-7 gap-px rounded-card border border-line bg-line">
          {weekdays.map((day) => (
            <div key={day} className="bg-muted px-2 py-3 text-center font-semibold">
              {day}
            </div>
          ))}
          {Array.from({ length: rows * 7 }, (_, index) => {
            const day = index - firstWeekday + 1;
            const inMonth = day >= 1 && day <= daysInMonth;
            const items = inMonth ? (byDay.get(day) ?? []) : [];
            const vacation = inMonth && vacationDays.has(day);
            return (
              <div
                key={index}
                className={`min-h-28 bg-surface p-2 ${vacation ? "bg-brand-light" : ""} ${
                  inMonth ? "" : "bg-muted/50"
                }`}
              >
                {inMonth && <p className="font-semibold tabular-nums">{day}</p>}
                <ul className="mt-1 space-y-1">
                  {items.map((booking) => (
                    <li key={booking.id}>
                      <Link
                        href="/admin/bookinger"
                        className="block rounded bg-canvas px-2 py-1 text-sm hover:bg-brand-light"
                      >
                        {new Intl.DateTimeFormat("da-DK", {
                          timeZone: "Europe/Copenhagen",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(booking.start))}{" "}
                        {booking.customer.name}
                        <span className="block text-ink-soft">
                          {statusLabels[booking.status]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
