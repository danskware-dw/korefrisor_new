import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatEmployeeBase } from "@/lib/employees";
import { summarizeEmployeeWork } from "@/lib/employee-work";
import { formatDkk } from "@/lib/pricing";
import { getConfig } from "@/lib/runtime-config";
import { listBookings } from "@/lib/store";
import {
  addEmployee,
  removeEmployee,
  requireAdmin,
  setEmployeeActive,
  updateEmployee,
} from "../actions";
import { formatWhen } from "../BookingCard";

export const metadata: Metadata = { title: "Medarbejdere" };

const field =
  "w-full rounded-lg border-2 border-line bg-surface px-4 py-3 text-lg focus:border-brand";

const statusStyle: Record<string, string> = {
  "har-arbejdet": "bg-accent/15 text-accent",
  "skal-arbejde": "bg-brand-light text-brand-dark",
  ledig: "bg-muted text-ink-soft",
  inaktiv: "bg-[#FEF2F2] text-[#991B1B]",
};

export default async function MedarbejderePage() {
  await requireAdmin();
  const [config, bookings] = await Promise.all([getConfig(), listBookings()]);
  const summaries = summarizeEmployeeWork(config.employees, bookings);

  const workingToday = summaries.filter((s) => s.statusToday === "skal-arbejde").length;
  const doneToday = summaries.filter((s) => s.statusToday === "har-arbejdet").length;
  const idleToday = summaries.filter((s) => s.statusToday === "ledig").length;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold">Medarbejdere</h1>
      <p className="mt-2 text-ink-soft">
        Fuld kontrol over hvem der kan bookes, og oversigt over hvem der har arbejdet —
        eller ikke — i dag.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        <li className="rounded-card border border-line bg-surface p-5">
          <p className="text-ink-soft">Skal arbejde i dag</p>
          <p className="mt-1 text-4xl font-bold tabular-nums">{workingToday}</p>
        </li>
        <li className="rounded-card border border-line bg-surface p-5">
          <p className="text-ink-soft">Har arbejdet i dag</p>
          <p className="mt-1 text-4xl font-bold tabular-nums">{doneToday}</p>
        </li>
        <li className="rounded-card border border-line bg-surface p-5">
          <p className="text-ink-soft">Ledige i dag</p>
          <p className="mt-1 text-4xl font-bold tabular-nums">{idleToday}</p>
        </li>
      </ul>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Status i dag</h2>
        {summaries.length === 0 ? (
          <p className="mt-3 text-ink-soft">Ingen medarbejdere endnu. Tilføj den første nedenfor.</p>
        ) : (
          <ul className="mt-6 space-y-6">
            {summaries.map((summary) => {
              const { employee } = summary;
              return (
                <li
                  key={employee.id}
                  className="overflow-hidden rounded-card border border-line bg-surface"
                >
                  <div className="flex flex-wrap items-start gap-5 border-b border-line p-5">
                    <Image
                      src={employee.image}
                      alt={employee.imageAlt}
                      width={112}
                      height={112}
                      className="size-28 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold">{employee.name}</h3>
                        <span
                          className={`rounded-lg px-3 py-1 text-sm font-semibold ${statusStyle[summary.statusToday]}`}
                        >
                          {summary.statusLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-ink-soft">
                        {employee.role} · Kører fra {formatEmployeeBase(employee.base)}
                      </p>
                      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <dt className="text-sm text-ink-soft">Kommende tider</dt>
                          <dd className="text-xl font-bold tabular-nums">
                            {summary.upcomingTotal}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-ink-soft">Udført denne måned</dt>
                          <dd className="text-xl font-bold tabular-nums">
                            {summary.doneThisMonth}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-ink-soft">Omsætning denne måned</dt>
                          <dd className="text-xl font-bold tabular-nums">
                            {formatDkk(summary.revenueThisMonth)}
                          </dd>
                        </div>
                      </dl>
                      {summary.lastWorkedAt && (
                        <p className="mt-3 text-ink-soft">
                          Sidst udført: {formatWhen(summary.lastWorkedAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={setEmployeeActive}>
                        <input type="hidden" name="id" value={employee.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={employee.active ? "0" : "1"}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border-2 border-line px-4 py-2 font-semibold hover:border-brand"
                        >
                          {employee.active ? "Sæt inaktiv" : "Aktiver"}
                        </button>
                      </form>
                      <form action={removeEmployee}>
                        <input type="hidden" name="id" value={employee.id} />
                        <button
                          type="submit"
                          className="rounded-lg border-2 border-line px-4 py-2 font-semibold text-[#991B1B] hover:border-[#991B1B]"
                        >
                          Slet
                        </button>
                      </form>
                    </div>
                  </div>

                  {(summary.todayBookings.length > 0 ||
                    summary.upcomingBookings.length > 0) && (
                    <div className="grid gap-6 border-b border-line p-5 md:grid-cols-2">
                      <div>
                        <h4 className="font-bold">I dag</h4>
                        {summary.todayBookings.length === 0 ? (
                          <p className="mt-2 text-ink-soft">Ingen tider i dag.</p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {summary.todayBookings.map((booking) => (
                              <li key={booking.id} className="text-ink-soft">
                                <Link
                                  href="/admin/bookinger"
                                  className="font-semibold text-brand underline"
                                >
                                  {formatWhen(booking.start)}
                                </Link>
                                {" · "}
                                {booking.customer.name}
                                {" · "}
                                {booking.status === "udfoert"
                                  ? "Udført"
                                  : booking.status === "bekraeftet"
                                    ? "Bekræftet"
                                    : booking.status}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold">Næste tider</h4>
                        {summary.upcomingBookings.length === 0 ? (
                          <p className="mt-2 text-ink-soft">Ingen kommende tider.</p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {summary.upcomingBookings.map((booking) => (
                              <li key={booking.id} className="text-ink-soft">
                                {formatWhen(booking.start)} · {booking.customer.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  <details className="p-5">
                    <summary className="cursor-pointer text-lg font-semibold">
                      Rediger {employee.name}
                    </summary>
                    <form action={updateEmployee} className="mt-4 grid gap-4 sm:grid-cols-2">
                      <input type="hidden" name="id" value={employee.id} />
                      <label className="block">
                        <span className="font-semibold">Navn</span>
                        <input
                          name="name"
                          required
                          defaultValue={employee.name}
                          className={`mt-1 ${field}`}
                        />
                      </label>
                      <label className="block">
                        <span className="font-semibold">Rolle</span>
                        <input
                          name="role"
                          defaultValue={employee.role}
                          className={`mt-1 ${field}`}
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="font-semibold">Kort om dig</span>
                        <textarea
                          name="bio"
                          defaultValue={employee.bio ?? ""}
                          className={`mt-1 ${field}`}
                          rows={2}
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="font-semibold">Kvalifikationer (kommasepareret)</span>
                        <input
                          name="qualifications"
                          defaultValue={(employee.qualifications ?? []).join(", ")}
                          className={`mt-1 ${field}`}
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="font-semibold">Foto (sti)</span>
                        <input
                          name="image"
                          defaultValue={employee.image}
                          className={`mt-1 ${field}`}
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="font-semibold">Vej og nummer</span>
                        <input
                          name="street"
                          defaultValue={
                            employee.base.street.includes("[RET DETTE]")
                              ? ""
                              : employee.base.street
                          }
                          className={`mt-1 ${field}`}
                        />
                      </label>
                      <label className="block">
                        <span className="font-semibold">Postnr.</span>
                        <input
                          name="postalCode"
                          defaultValue={employee.base.postalCode}
                          className={`mt-1 ${field}`}
                        />
                      </label>
                      <label className="block">
                        <span className="font-semibold">By</span>
                        <input
                          name="city"
                          defaultValue={employee.base.city}
                          className={`mt-1 ${field}`}
                        />
                      </label>
                      <label className="flex items-center gap-3 sm:col-span-2">
                        <input type="hidden" name="active" value="0" />
                        <input
                          type="checkbox"
                          name="active"
                          value="1"
                          defaultChecked={employee.active}
                          className="size-6 accent-[var(--color-accent)]"
                        />
                        <span className="text-lg font-semibold">
                          Aktiv — kan vælges ved booking
                        </span>
                      </label>
                      <button
                        type="submit"
                        className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark sm:col-span-2"
                      >
                        Gem ændringer
                      </button>
                    </form>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12 rounded-card border border-line bg-surface p-5">
        <h2 className="text-2xl font-bold">Ansæt ny medarbejder</h2>
        <p className="mt-2 text-ink-soft">
          Tilføj navn, foto og hvor personen kører fra. Kunden kan så vælge dem ved
          booking.
        </p>
        <form action={addEmployee} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-semibold">Navn</span>
            <input name="name" required className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">Rolle</span>
            <input name="role" placeholder="Frisør" className={`mt-1 ${field}`} />
          </label>
          <label className="block sm:col-span-2">
            <span className="font-semibold">Foto (sti)</span>
            <input
              name="image"
              placeholder="/medarbejdere/anna.jpg"
              className={`mt-1 ${field}`}
            />
            <span className="mt-1 block text-sm text-ink-soft">
              Læg billedet i <code>public/medarbejdere/</code>
            </span>
          </label>
          <label className="block sm:col-span-2">
            <span className="font-semibold">Vej og nummer</span>
            <input
              name="street"
              placeholder={config.home.street}
              className={`mt-1 ${field}`}
            />
          </label>
          <label className="block">
            <span className="font-semibold">Postnr.</span>
            <input
              name="postalCode"
              placeholder={config.home.postalCode}
              className={`mt-1 ${field}`}
            />
          </label>
          <label className="block">
            <span className="font-semibold">By</span>
            <input name="city" placeholder={config.home.city} className={`mt-1 ${field}`} />
          </label>
          <input type="hidden" name="active" value="1" />
          <button
            type="submit"
            className="rounded-lg bg-accent px-6 py-3 text-lg font-bold text-white hover:bg-accent-dark sm:col-span-2"
          >
            Tilføj medarbejder
          </button>
        </form>
      </section>
    </div>
  );
}
