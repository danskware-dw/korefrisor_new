import type { Metadata } from "next";
import Link from "next/link";
import { getConfig } from "@/lib/runtime-config";
import {
  addVacation,
  removeVacation,
  requireAdmin,
  saveInfo,
  saveOpeningHours,
} from "../actions";

export const metadata: Metadata = { title: "Indstillinger" };

const field =
  "w-full rounded-lg border-2 border-line bg-surface px-4 py-3 text-lg";

const weekdays: { day: number; label: string }[] = [
  { day: 1, label: "Mandag" },
  { day: 2, label: "Tirsdag" },
  { day: 3, label: "Onsdag" },
  { day: 4, label: "Torsdag" },
  { day: 5, label: "Fredag" },
  { day: 6, label: "Lørdag" },
  { day: 0, label: "Søndag" },
];

export default async function IndstillingerPage() {
  await requireAdmin();
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-3xl space-y-14">
      <div>
        <h1 className="text-3xl font-bold">Indstillinger</h1>
        <p className="mt-2 text-ink-soft">
          Oplysninger, åbningstider, ferie og medarbejdere. Det du retter her, vises på
          hjemmesiden.
        </p>
      </div>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-2xl font-bold">Oplysninger</h2>
        <form action={saveInfo} className="mt-4 grid gap-4">
          <label className="block">
            <span className="font-semibold">Firmanavn</span>
            <input name="name" defaultValue={config.name} className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">Underoverskrift</span>
            <input name="tagline" defaultValue={config.tagline} className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">Dit navn</span>
            <input name="ownerName" defaultValue={config.ownerName} className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">Års erfaring</span>
            <input
              name="yearsOfExperience"
              type="number"
              min={0}
              defaultValue={config.yearsOfExperience}
              className={`mt-1 ${field}`}
            />
          </label>
          <label className="block">
            <span className="font-semibold">Telefon</span>
            <input name="phone" defaultValue={config.phone} className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">E-mail</span>
            <input name="email" type="email" defaultValue={config.email} className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">MobilePay</span>
            <input name="mobilePay" defaultValue={config.mobilePay} className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">CVR (valgfrit)</span>
            <input name="cvr" defaultValue={config.cvr} className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">Adresse</span>
            <input name="street" defaultValue={config.home.street} className={`mt-1 ${field}`} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-semibold">Postnr.</span>
              <input name="postalCode" defaultValue={config.home.postalCode} className={`mt-1 ${field}`} />
            </label>
            <label className="block">
              <span className="font-semibold">By</span>
              <input name="city" defaultValue={config.home.city} className={`mt-1 ${field}`} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-semibold">Breddegrad</span>
              <input name="lat" defaultValue={config.home.lat} className={`mt-1 ${field}`} />
            </label>
            <label className="block">
              <span className="font-semibold">Længdegrad</span>
              <input name="lon" defaultValue={config.home.lon} className={`mt-1 ${field}`} />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Gem oplysninger
          </button>
        </form>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-2xl font-bold">Åbningstider og weekend</h2>
        <p className="mt-2 text-ink-soft">
          Sæt flueben ved Lukket for dage, du ikke kører — fx søndag. Lørdag kan have
          kortere tid.
        </p>
        <form action={saveOpeningHours} className="mt-4 space-y-4">
          {weekdays.map(({ day, label }) => {
            const hours = config.openingHours[day];
            return (
              <div key={day} className="grid items-end gap-3 sm:grid-cols-[8rem_auto_1fr_1fr]">
                <p className="font-semibold">{label}</p>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={`closed-${day}`}
                    defaultChecked={!hours}
                    className="size-6"
                  />
                  Lukket
                </label>
                <label>
                  <span className="sr-only">Fra {label}</span>
                  <input
                    type="time"
                    name={`from-${day}`}
                    defaultValue={hours?.from ?? "09:00"}
                    className={field}
                  />
                </label>
                <label>
                  <span className="sr-only">Til {label}</span>
                  <input
                    type="time"
                    name={`to-${day}`}
                    defaultValue={hours?.to ?? "17:00"}
                    className={field}
                  />
                </label>
              </div>
            );
          })}
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="font-semibold">Pause mellem tider (min.)</span>
              <input
                name="bufferMinutes"
                type="number"
                min={0}
                defaultValue={config.bufferMinutes}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="block">
              <span className="font-semibold">Mindst varsel (timer)</span>
              <input
                name="minNoticeHours"
                type="number"
                min={0}
                defaultValue={config.minNoticeHours}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="block">
              <span className="font-semibold">Kan bookes (dage frem)</span>
              <input
                name="maxAdvanceDays"
                type="number"
                min={1}
                defaultValue={config.maxAdvanceDays}
                className={`mt-1 ${field}`}
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Gem tider
          </button>
        </form>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-2xl font-bold">Ferie</h2>
        <p className="mt-2 text-ink-soft">
          I de dage kan kunderne ikke booke. Kalenderen viser ferien med blå baggrund.
        </p>
        {config.vacations.length > 0 && (
          <ul className="mt-4 space-y-3">
            {config.vacations.map((vacation) => (
              <li
                key={vacation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3"
              >
                <p>
                  {vacation.from} – {vacation.to}
                  {vacation.note ? ` · ${vacation.note}` : ""}
                </p>
                <form action={removeVacation}>
                  <input type="hidden" name="id" value={vacation.id} />
                  <button type="submit" className="font-semibold underline">
                    Slet
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form action={addVacation} className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="font-semibold">Fra</span>
            <input type="date" name="from" required className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">Til</span>
            <input type="date" name="to" required className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="font-semibold">Note</span>
            <input name="note" placeholder="Sommerferie" className={`mt-1 ${field}`} />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark sm:col-span-3"
          >
            Tilføj ferie
          </button>
        </form>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-2xl font-bold">Medarbejdere</h2>
        <p className="mt-2 text-ink-soft">
          Ansæt, rediger, aktiver/deaktiver og se hvem der har arbejdet — alt samlet under
          Medarbejdere.
        </p>
        <p className="mt-3">
          <Link
            href="/admin/medarbejdere"
            className="inline-flex rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Åbn medarbejdere ({config.employees.length})
          </Link>
        </p>
      </section>
    </div>
  );
}
