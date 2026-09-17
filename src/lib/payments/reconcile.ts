import { randomUUID } from "node:crypto";
import type { Sql } from "postgres";
import type { Booking } from "@/lib/store";
import { occupiesSlot } from "@/lib/schedule/holds";
import { SlotTakenError } from "@/lib/schedule/fit";
import { visitFits } from "@/lib/schedule/fit";
import { driveBetween } from "@/lib/schedule/drive";
import { getConfig } from "@/lib/runtime-config";
import { claimEmployeeSlot } from "@/lib/db/claim-slot";
import { updateBooking } from "@/lib/store";
import type { VippsPaymentState } from "./vipps-state";
import { isVippsPaymentState } from "./vipps-state";
import { providerOperationId, type PaymentOperation } from "./operation-id";
import { enqueueOutbox, outboxSendKey } from "@/lib/notify/outbox";

export type ProviderEventInput = {
  reference: string;
  state?: string;
  operation: PaymentOperation;
  providerId: string;
  amountOre: number;
  source: "webhook" | "poll" | "api";
};

async function insertEvent(sql: Sql, booking: Booking, input: ProviderEventInput): Promise<boolean> {
  const id = providerOperationId({
    reference: input.reference,
    operation: input.operation,
    providerId: input.providerId,
  });
  try {
    await sql`
      INSERT INTO payment_events (id, booking_id, operation, amount_ore, payload)
      VALUES (
        ${id},
        ${booking.id},
        ${input.operation},
        ${input.amountOre},
        ${sql.json({ source: input.source, state: input.state ?? null })}
      )
    `;
    return true;
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    if (text.includes("payment_events_pkey") || text.includes("duplicate") || text.includes("23505")) {
      return false;
    }
    throw error;
  }
}

async function sums(sql: Sql, bookingId: string) {
  const rows = await sql<{ operation: string; total: number }[]>`
    SELECT operation, COALESCE(SUM(amount_ore), 0)::int AS total
    FROM payment_events
    WHERE booking_id = ${bookingId}
    GROUP BY operation
  `;
  const map = Object.fromEntries(rows.map((row) => [row.operation, row.total]));
  return {
    authorizedOre: map.authorization ?? 0,
    capturedOre: map.capture ?? 0,
    refundedOre: map.refund ?? 0,
  };
}

export async function enqueueCapture(sql: Sql, booking: Booking): Promise<void> {
  const key = `capture:${booking.payment.reference}`;
  await sql`
    INSERT INTO payment_operations (
      id, booking_id, kind, status, attempts, next_attempt_at, idempotency_key
    ) VALUES (
      ${randomUUID()}, ${booking.id}, 'capture', 'pending', 0, now(), ${key}
    )
    ON CONFLICT (idempotency_key) DO NOTHING
  `;
}

async function reoccupyIfPossible(booking: Booking): Promise<Booking> {
  const config = await getConfig();
  const next: Booking = {
    ...booking,
    status: "bekraeftet",
    slotOccupied: true,
    holdUntil: undefined,
  };
  const { readyAppSql } = await import("@/lib/db/client");
  const sql = await readyAppSql();
  if (sql && next.employee?.id) {
    try {
      return await claimEmployeeSlot(sql, {
        booking: next,
        bufferMinutes: config.bufferMinutes,
        drive: driveBetween,
        mode: "update",
      });
    } catch (error) {
      if (error instanceof SlotTakenError) throw error;
      throw error;
    }
  }
  const occupied = (await (await import("@/lib/store")).listBookings()).filter(
    (item) => item.id !== booking.id && item.employee?.id === booking.employee?.id && occupiesSlot(item),
  );
  const fits = await visitFits({
    candidate: {
      startMs: new Date(next.start).getTime(),
      endMs: new Date(next.end).getTime(),
      coord: { lat: next.address.lat, lon: next.address.lon },
    },
    occupied: occupied.map((item) => ({
      startMs: new Date(item.start).getTime(),
      endMs: new Date(item.end).getTime(),
      coord: { lat: item.address.lat, lon: item.address.lon },
    })),
    bufferMinutes: config.bufferMinutes,
    drive: driveBetween,
  });
  if (!fits) throw new SlotTakenError();
  return (await updateBooking(next.id, next)) ?? next;
}

/**
 * Apply one Vipps operation from webhook, poll, or API — same providerOperationId.
 */
export async function reconcilePayment(
  sql: Sql | null,
  booking: Booking,
  input: ProviderEventInput,
): Promise<Booking> {
  const state = input.state && isVippsPaymentState(input.state) ? input.state : booking.payment.providerState;
  let current = booking;

  if (sql) {
    const inserted = await insertEvent(sql, booking, input);
    if (!inserted && input.operation !== "authorization") {
      const totals = await sums(sql, booking.id);
      return {
        ...booking,
        payment: { ...booking.payment, ...totals, providerState: state },
      };
    }
  }

  if (input.operation === "authorization" || state === "AUTHORIZED") {
    if (current.status === "udlobet" || !occupiesSlot(current)) {
      try {
        current = await reoccupyIfPossible(current);
      } catch (error) {
        if (error instanceof SlotTakenError) {
          const expired: Booking = {
            ...current,
            status: "udlobet",
            slotOccupied: false,
            refundPendingAt: current.payment.capturedOre ? new Date().toISOString() : current.refundPendingAt,
          };
          await updateBooking(expired.id, expired);
          if (sql) {
            await enqueueOutbox(sql, expired, "expire", outboxSendKey(expired, "expire"));
          }
          return expired;
        }
        throw error;
      }
    }

    const amountOre = input.amountOre || Math.round(current.payment.amountKr * 100);
    current = (await updateBooking(current.id, {
      status: "bekraeftet",
      slotOccupied: true,
      payment: {
        ...current.payment,
        providerState: "AUTHORIZED",
        authorizedOre: amountOre,
        status: "afventer",
      },
    })) ?? current;

    if (sql) {
      await enqueueCapture(sql, current);
      await enqueueOutbox(sql, current, "confirmation", outboxSendKey(current, "confirmation"));
    }
  }

  if (input.operation === "capture" || state === "CAPTURED") {
    const totals = sql ? await sums(sql, current.id) : {
      authorizedOre: current.payment.authorizedOre ?? 0,
      capturedOre: (current.payment.capturedOre ?? 0) + input.amountOre,
      refundedOre: current.payment.refundedOre ?? 0,
    };
    current = (await updateBooking(current.id, {
      status: current.status === "udlobet" ? current.status : "bekraeftet",
      payment: {
        ...current.payment,
        providerState: state === "CAPTURED" ? "CAPTURED" : current.payment.providerState,
        ...totals,
        status: totals.capturedOre > 0 ? "betalt" : current.payment.status,
        paidAt: new Date().toISOString(),
      },
    })) ?? current;
  }

  if (input.operation === "refund") {
    const totals = sql ? await sums(sql, current.id) : {
      authorizedOre: current.payment.authorizedOre ?? 0,
      capturedOre: current.payment.capturedOre ?? 0,
      refundedOre: (current.payment.refundedOre ?? 0) + input.amountOre,
    };
    const outstanding = totals.capturedOre - totals.refundedOre;
    current = (await updateBooking(current.id, {
      payment: {
        ...current.payment,
        ...totals,
        status: outstanding <= 0 ? "refunderet" : "refund_pending",
      },
      refundPendingAt: outstanding > 0 ? current.refundPendingAt ?? new Date().toISOString() : undefined,
    })) ?? current;
  }

  return current;
}

export type { VippsPaymentState };
