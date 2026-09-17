export const COPENHAGEN_TZ = "Europe/Copenhagen";

/** "2026-09-16" -> weekday 0-6. Noon UTC is the same calendar day in Denmark. */
export function weekdayOf(dateIso: string): number {
  return new Date(`${dateIso}T12:00:00Z`).getUTCDay();
}

/**
 * Danish local time -> UTC instant. Handles DST by measuring the offset on that date.
 */
export function copenhagenToUtc(dateIso: string, time: string): Date {
  const naive = new Date(`${dateIso}T${time}:00Z`);
  const local = new Intl.DateTimeFormat("sv-SE", {
    timeZone: COPENHAGEN_TZ,
    dateStyle: "short",
    timeStyle: "short",
  }).format(naive);
  const offsetMs = new Date(`${local.replace(" ", "T")}:00Z`).getTime() - naive.getTime();
  return new Date(naive.getTime() - offsetMs);
}

export function copenhagenDateIso(at: Date | number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: COPENHAGEN_TZ }).format(new Date(at));
}

export function copenhagenHourMinute(at: Date | number): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: COPENHAGEN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(at));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return { hour, minute };
}

export function addCalendarDaysIso(dateIso: string, days: number): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day + days);
  return new Date(utc).toISOString().slice(0, 10);
}

/** True when `start` is tomorrow in Copenhagen relative to `now`. */
export function isCopenhagenTomorrow(startIso: string, now = Date.now()): boolean {
  const tomorrow = addCalendarDaysIso(copenhagenDateIso(now), 1);
  return copenhagenDateIso(new Date(startIso)) === tomorrow;
}

/** Daytime reminder window 09:00–18:00 Europe/Copenhagen (end exclusive). */
export function isCopenhagenDaytime(now = Date.now()): boolean {
  const { hour, minute } = copenhagenHourMinute(now);
  const minutes = hour * 60 + minute;
  return minutes >= 9 * 60 && minutes < 18 * 60;
}
