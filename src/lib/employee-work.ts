import type { Employee } from "@/config/types";
import type { Booking } from "@/lib/store";

export type EmployeeWorkStatus =
  | "har-arbejdet"
  | "skal-arbejde"
  | "ledig"
  | "inaktiv";

export type EmployeeWorkSummary = {
  employee: Employee;
  statusToday: EmployeeWorkStatus;
  statusLabel: string;
  todayDone: number;
  todayUpcoming: number;
  upcomingTotal: number;
  doneThisMonth: number;
  revenueThisMonth: number;
  lastWorkedAt: string | null;
  todayBookings: Booking[];
  upcomingBookings: Booking[];
};

function copenhagenToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(
    new Date(),
  );
}

function monthPrefix(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" })
    .format(now)
    .slice(0, 7);
}

function forEmployee(booking: Booking, employeeId: string): boolean {
  return booking.employee?.id === employeeId;
}

/** Status pr. medarbejder: har de arbejdet i dag, skal de, eller er de ledige. */
export function summarizeEmployeeWork(
  employees: Employee[],
  bookings: Booking[],
): EmployeeWorkSummary[] {
  const today = copenhagenToday();
  const month = monthPrefix();
  const now = Date.now();

  return employees.map((employee) => {
    const mine = bookings.filter((booking) => forEmployee(booking, employee.id));
    const notCancelled = mine.filter((booking) => booking.status !== "aflyst");

    const todayBookings = notCancelled.filter((booking) => booking.start.startsWith(today));
    const todayDone = todayBookings.filter((booking) => booking.status === "udfoert").length;
    const todayUpcoming = todayBookings.filter(
      (booking) =>
        booking.status === "bekraeftet" && new Date(booking.start).getTime() >= now,
    ).length;

    const upcomingBookings = notCancelled.filter(
      (booking) =>
        booking.status === "bekraeftet" && new Date(booking.start).getTime() >= now,
    );
    const doneThisMonth = notCancelled.filter(
      (booking) =>
        booking.status === "udfoert" && booking.start.startsWith(month),
    );
    const revenueThisMonth = doneThisMonth.reduce(
      (sum, booking) => sum + booking.pricing.total,
      0,
    );
    const lastDone = notCancelled
      .filter((booking) => booking.status === "udfoert")
      .sort((a, b) => b.start.localeCompare(a.start))[0];

    let statusToday: EmployeeWorkStatus = "ledig";
    let statusLabel = "Ingen tider i dag";

    if (!employee.active) {
      statusToday = "inaktiv";
      statusLabel = "Inaktiv — kan ikke bookes";
    } else if (todayDone > 0 && todayUpcoming === 0) {
      statusToday = "har-arbejdet";
      statusLabel = "Har arbejdet i dag";
    } else if (todayUpcoming > 0) {
      statusToday = "skal-arbejde";
      statusLabel =
        todayDone > 0
          ? `Har arbejdet — ${todayUpcoming} tid${todayUpcoming === 1 ? "" : "er"} tilbage`
          : `Skal arbejde i dag (${todayUpcoming})`;
    }

    return {
      employee,
      statusToday,
      statusLabel,
      todayDone,
      todayUpcoming,
      upcomingTotal: upcomingBookings.length,
      doneThisMonth: doneThisMonth.length,
      revenueThisMonth,
      lastWorkedAt: lastDone?.start ?? null,
      todayBookings,
      upcomingBookings: upcomingBookings.slice(0, 5),
    };
  });
}
