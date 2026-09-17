/** Vipps ePayment payment states. Captures/refunds are operations, not extra states. */
export const VIPPS_PAYMENT_STATES = [
  "CREATED",
  "ABORTED",
  "EXPIRED",
  "AUTHORIZED",
  "TERMINATED",
  "CAPTURED",
] as const;

export type VippsPaymentState = (typeof VIPPS_PAYMENT_STATES)[number];

export function isVippsPaymentState(value: string): value is VippsPaymentState {
  return (VIPPS_PAYMENT_STATES as readonly string[]).includes(value);
}
