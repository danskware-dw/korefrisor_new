export type PaymentOperation = "authorization" | "capture" | "refund" | "cancel";

/** Shared authorization identity when Vipps GET has no separate auth event id. */
export const AUTHORIZATION_PROVIDER_ID = "authorized";

/**
 * Stable id for one Vipps operation, shared by webhook, GET poll, and API responses.
 * Never prefix with poll: or webhook: — providerId is the Vipps operation/event id.
 */
export function providerOperationId(input: {
  reference: string;
  operation: PaymentOperation;
  providerId: string;
}): string {
  return `${input.reference}:${input.operation}:${input.providerId}`;
}
