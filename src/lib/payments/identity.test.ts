import { describe, expect, it } from "vitest";
import { AUTHORIZATION_PROVIDER_ID, providerOperationId } from "./operation-id";
import { isVippsPaymentState } from "./vipps-state";
import { isStaleOutbox } from "@/lib/notify/outbox";
import type { Booking } from "@/lib/store";

const base = {
  id: "b1",
  createdAt: "2026-09-17T08:00:00.000Z",
  status: "bekraeftet",
  start: "2026-09-20T10:00:00.000Z",
  end: "2026-09-20T10:40:00.000Z",
  reminderForStart: "2026-09-20T10:00:00.000Z",
  serviceIds: ["klip"],
  customer: { name: "A", phone: "1", email: "a@b.dk" },
  address: { text: "x", postalCode: "2770", city: "Kastrup", lat: 1, lon: 2 },
  pricing: { servicesTotal: 1, travelFee: 0, total: 1, distanceKm: 1, drivingMinutes: 1 },
  payment: {
    method: "mobilepay",
    status: "betalt",
    amountKr: 1,
    reference: "KF",
    mode: "online",
  },
  cancelToken: "t",
} as Booking;

describe("providerOperationId", () => {
  it("is the same for webhook, poll, and API of one capture", () => {
    const id = { reference: "KF-1", operation: "capture" as const, providerId: "cap_abc" };
    expect(providerOperationId(id)).toBe("KF-1:capture:cap_abc");
    expect(providerOperationId({ ...id })).toBe(providerOperationId(id));
  });

  it("reuses one authorization id for webhook, poll, and API", () => {
    const input = {
      reference: "KF-1",
      operation: "authorization" as const,
      providerId: AUTHORIZATION_PROVIDER_ID,
    };
    expect(providerOperationId(input)).toBe("KF-1:authorization:authorized");
    expect(providerOperationId({ ...input })).toBe(providerOperationId(input));
  });

  it("does not treat REFUNDED as a payment state", () => {
    expect(isVippsPaymentState("CAPTURED")).toBe(true);
    expect(isVippsPaymentState("AUTHORIZED")).toBe(true);
    expect(isVippsPaymentState("REFUNDED")).toBe(false);
    expect(isVippsPaymentState("CANCELLED")).toBe(false);
  });
});

describe("stale outbox by type", () => {
  it("skips confirmation after cancel but still sends cancel/expire", () => {
    const cancelled = { ...base, status: "aflyst" as const };
    expect(isStaleOutbox("confirmation", cancelled, { start: cancelled.start })).toBe(true);
    expect(isStaleOutbox("reminder", cancelled, { start: cancelled.start })).toBe(true);
    expect(isStaleOutbox("cancel", cancelled, { start: cancelled.start })).toBe(false);
    expect(isStaleOutbox("expire", { ...base, status: "udlobet" }, { start: base.start })).toBe(
      false,
    );
  });

  it("skips reminder when the start moved", () => {
    const moved = {
      ...base,
      status: "bekraeftet" as const,
      start: "2026-09-21T10:00:00.000Z",
      reminderForStart: "2026-09-21T10:00:00.000Z",
    };
    expect(isStaleOutbox("reminder", moved, { start: "2026-09-20T10:00:00.000Z" })).toBe(true);
  });

  it("skips a payload for a different booking", () => {
    expect(isStaleOutbox("cancel", base, { bookingId: "other" })).toBe(true);
  });
});
