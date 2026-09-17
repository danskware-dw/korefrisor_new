import { promises as fs } from "node:fs";
import path from "node:path";
import type { Sql } from "postgres";
import { paymentReference } from "@/lib/payment-policy";
import {
  occupiesSlot as occupiesCalendarSlot,
  holdUntilIso,
  shouldExpireHold,
} from "@/lib/schedule/holds";
import { SlotTakenError, visitFits } from "@/lib/schedule/fit";
import { driveBetween } from "@/lib/schedule/drive";
import { readyAppSql } from "@/lib/db/client";
import { claimEmployeeSlot } from "@/lib/db/claim-slot";
import {
  insertBookingRow,
  rowToBooking,
  updateBookingRow,
  type BookingRow,
} from "@/lib/db/rows";
import { getConfig } from "@/lib/runtime-config";
import type { VippsPaymentState } from "@/lib/payments/vipps-state";

export type BookingPayment = {
  method: "mobilepay" | "ved_besoeg" | "faktura";
  /** afventer = not settled; betalt = captured/verified; refund states from ledger */
  status: "afventer" | "betalt" | "refunderet" | "gebyr_beholdt" | "refund_pending";
  amountKr: number;
  reference: string;
  paidAt?: string;
  mode: "online" | "manuel" | "ved_besoeg" | "faktura";
  redirectUrl?: string;
  providerState?: VippsPaymentState;
  authorizedOre?: number;
  capturedOre?: number;
  refundedOre?: number;
};

export type Booking = {
  id: string;
  createdAt: string;
  status: "afventer_betaling" | "bekraeftet" | "aflyst" | "udfoert" | "udeblevet" | "udlobet";
  start: string;
  end: string;
  holdUntil?: string;
  slotOccupied?: boolean;
  serviceIds: string[];
  employee?: {
    id: string;
    name: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
    note?: string;
  };
  relative?: {
    name: string;
    phone: string;
    email: string;
  };
  repeatWeeks?: number;
  smsDayBefore?: boolean;
  reminderForStart?: string;
  smsReminderSentAt?: string;
  careHome?: {
    residents: number;
    weekday: number;
    facilityName?: string;
  };
  address: {
    text: string;
    postalCode: string;
    city: string;
    lat: number;
    lon: number;
  };
  pricing: {
    servicesTotal: number;
    travelFee: number;
    familyDiscount?: number;
    total: number;
    distanceKm: number;
    drivingMinutes: number;
  };
  payment: BookingPayment;
  cancelToken: string;
  cancel?: {
    at: string;
    feeKr: number;
    refundKr: number;
    reason?: string;
  };
  manualPaymentVerifiedAt?: string;
  manualPaymentVerifiedBy?: string;
  refundPendingAt?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "bookings.json");

let fileChain: Promise<unknown> = Promise.resolve();

function withFileLock<T>(work: () => Promise<T>): Promise<T> {
  const run = fileChain.then(work, work);
  fileChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function normalizeBooking(raw: Booking): Booking {
  const withPayment: Booking = raw.payment
    ? raw
    : {
        ...raw,
        payment: {
          method: "mobilepay",
          status: raw.status === "aflyst" ? "refunderet" : "betalt",
          amountKr: raw.pricing.total,
          reference: paymentReference(raw.id),
          mode: "manuel",
          paidAt: raw.createdAt,
        },
      };
  if (
    withPayment.status === "afventer_betaling" &&
    !withPayment.holdUntil &&
    withPayment.payment.mode === "online"
  ) {
    withPayment.holdUntil = holdUntilIso(withPayment.createdAt);
  }
  if (withPayment.slotOccupied === undefined) {
    withPayment.slotOccupied = occupiesCalendarSlot(withPayment);
  }
  if (!withPayment.reminderForStart) withPayment.reminderForStart = withPayment.start;
  return withPayment;
}

export function holdsSlot(booking: Booking, now = Date.now()): boolean {
  return occupiesCalendarSlot(booking, now);
}

async function readAllFiles(): Promise<Booking[]> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as Booking[];
    return raw.map(normalizeBooking);
  } catch {
    return [];
  }
}

async function writeAllFiles(bookings: Booking[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(bookings, null, 2), "utf8");
}

async function listFromSql(sql: Sql): Promise<Booking[]> {
  const rows = await sql<BookingRow[]>`SELECT * FROM bookings`;
  return rows.map(rowToBooking).map(normalizeBooking);
}

export async function listBookings(): Promise<Booking[]> {
  const sql = await readyAppSql();
  const all = sql ? await listFromSql(sql) : await readAllFiles();
  return all.sort((a, b) => a.start.localeCompare(b.start));
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  const sql = await readyAppSql();
  if (sql) {
    const rows = await sql<BookingRow[]>`SELECT * FROM bookings WHERE id = ${id} LIMIT 1`;
    return rows[0] ? normalizeBooking(rowToBooking(rows[0])) : undefined;
  }
  return (await readAllFiles()).find((booking) => booking.id === id);
}

export async function getBookingByCancelToken(
  token: string,
): Promise<Booking | undefined> {
  const sql = await readyAppSql();
  if (sql) {
    const rows = await sql<BookingRow[]>`
      SELECT * FROM bookings WHERE cancel_token = ${token} LIMIT 1
    `;
    return rows[0] ? normalizeBooking(rowToBooking(rows[0])) : undefined;
  }
  return (await readAllFiles()).find((booking) => booking.cancelToken === token);
}

export async function getBookingByPaymentReference(
  reference: string,
): Promise<Booking | undefined> {
  const sql = await readyAppSql();
  if (sql) {
    const rows = await sql<BookingRow[]>`
      SELECT * FROM bookings WHERE payment_reference = ${reference} LIMIT 1
    `;
    return rows[0] ? normalizeBooking(rowToBooking(rows[0])) : undefined;
  }
  return (await readAllFiles()).find((booking) => booking.payment?.reference === reference);
}

export async function listBookingsByTime(): Promise<{
  upcoming: Booking[];
  past: Booking[];
}> {
  const bookings = await listBookings();
  const now = Date.now();
  return {
    upcoming: bookings.filter((b) => new Date(b.start).getTime() >= now),
    past: bookings.filter((b) => new Date(b.start).getTime() < now).reverse(),
  };
}

export async function activeBookingsOn(dateIso: string): Promise<Booking[]> {
  return activeBookingsFor({ dateIso });
}

export async function activeBookingsFor(input: {
  dateIso: string;
  employeeId?: string;
}): Promise<Booking[]> {
  const all = await listBookings();
  const now = Date.now();
  return all.filter((booking) => {
    if (!holdsSlot(booking, now)) return false;
    if (input.employeeId && booking.employee?.id !== input.employeeId) return false;
    return booking.start.startsWith(input.dateIso);
  });
}

async function persistNew(booking: Booking): Promise<Booking> {
  const prepared = prepareNewBooking(booking);
  const sql = await readyAppSql();
  const config = await getConfig();
  if (sql && prepared.employee?.id) {
    return claimEmployeeSlot(sql, {
      booking: prepared,
      bufferMinutes: config.bufferMinutes,
      drive: driveBetween,
    });
  }
  if (sql) {
    await insertBookingRow(sql, prepared);
    return prepared;
  }

  return withFileLock(async () => {
    const all = await readAllFiles();
    for (const item of all) {
      if (shouldExpireHold(item)) {
        item.status = "udlobet";
        item.slotOccupied = false;
      }
    }
    if (prepared.employee?.id) {
      const occupied = all
        .filter((item) => item.employee?.id === prepared.employee?.id && holdsSlot(item))
        .map((item) => ({
          startMs: new Date(item.start).getTime(),
          endMs: new Date(item.end).getTime(),
          coord: { lat: item.address.lat, lon: item.address.lon },
        }));
      const fits = await visitFits({
        candidate: {
          startMs: new Date(prepared.start).getTime(),
          endMs: new Date(prepared.end).getTime(),
          coord: { lat: prepared.address.lat, lon: prepared.address.lon },
        },
        occupied,
        bufferMinutes: config.bufferMinutes,
        drive: driveBetween,
      });
      if (!fits) throw new SlotTakenError();
    }
    all.push(prepared);
    await writeAllFiles(all);
    return prepared;
  });
}

function prepareNewBooking(booking: Booking): Booking {
  const next = normalizeBooking({ ...booking });
  if (next.status === "afventer_betaling" && next.payment.mode !== "faktura") {
    next.holdUntil = next.holdUntil ?? holdUntilIso(next.createdAt);
    next.slotOccupied = true;
  } else {
    next.slotOccupied = next.status !== "aflyst" && next.status !== "udlobet";
  }
  next.reminderForStart = next.start;
  return next;
}

export async function createBooking(booking: Booking): Promise<Booking> {
  return persistNew(booking);
}

export async function updateBooking(
  id: string,
  patch: Partial<Booking>,
): Promise<Booking | undefined> {
  const current = await getBooking(id);
  if (!current) return undefined;
  const next = normalizeBooking({ ...current, ...patch, id: current.id });
  if (patch.start) next.reminderForStart = patch.reminderForStart ?? patch.start;

  const sql = await readyAppSql();
  const scheduleChanged =
    next.start !== current.start ||
    next.end !== current.end ||
    next.employee?.id !== current.employee?.id;

  if (sql && scheduleChanged && next.employee?.id && next.slotOccupied !== false) {
    const config = await getConfig();
    return claimEmployeeSlot(sql, {
      booking: next,
      bufferMinutes: config.bufferMinutes,
      drive: driveBetween,
      mode: "update",
    });
  }

  if (sql) {
    await updateBookingRow(sql, next);
    return next;
  }

  return withFileLock(async () => {
    const all = await readAllFiles();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    all[index] = next;
    await writeAllFiles(all);
    return all[index];
  });
}

export async function deleteBooking(id: string): Promise<boolean> {
  const sql = await readyAppSql();
  if (sql) {
    const result = await sql`DELETE FROM bookings WHERE id = ${id}`;
    return result.count > 0;
  }
  const all = await readAllFiles();
  const next = all.filter((booking) => booking.id !== id);
  if (next.length === all.length) return false;
  await writeAllFiles(next);
  return true;
}

export async function searchBookings(query: string): Promise<Booking[]> {
  const bookings = await listBookings();
  const needle = query.trim().toLowerCase();
  if (!needle) return bookings;
  const compact = needle.replace(/\s/g, "");
  return bookings.filter((booking) => {
    const hay = [
      booking.customer.name,
      booking.customer.phone,
      booking.customer.email,
      booking.relative?.name,
      booking.relative?.phone,
      booking.address.text,
      booking.serviceIds.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle) || booking.customer.phone.replace(/\s/g, "").includes(compact);
  });
}

export type Customer = {
  key: string;
  name: string;
  phone: string;
  email: string;
  bookings: number;
  lastVisit: string;
  totalSpent: number;
};

export async function listCustomers(): Promise<Customer[]> {
  const bookings = await listBookings();
  const map = new Map<string, Customer>();

  for (const booking of bookings) {
    const key =
      booking.customer.phone.replace(/\s/g, "") || booking.customer.email.toLowerCase();
    const existing = map.get(key);
    const spent =
      booking.status === "aflyst" || booking.status === "udlobet" ? 0 : booking.pricing.total;

    if (!existing) {
      map.set(key, {
        key,
        name: booking.customer.name,
        phone: booking.customer.phone,
        email: booking.customer.email,
        bookings: 1,
        lastVisit: booking.start,
        totalSpent: spent,
      });
      continue;
    }

    existing.bookings += 1;
    existing.totalSpent += spent;
    if (booking.start > existing.lastVisit) {
      existing.lastVisit = booking.start;
      existing.name = booking.customer.name;
    }
  }

  return [...map.values()].sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}

export async function bookingsInMonth(year: number, month: number): Promise<Booking[]> {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return (await listBookings()).filter((booking) => booking.start.startsWith(prefix));
}

export { SlotTakenError };
