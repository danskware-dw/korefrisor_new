/**
 * Valgfri Vipps MobilePay ePayment.
 * Uden nøgler bruges manuel MobilePay til nummeret i indstillingerne.
 *
 * Kræver merchant-aftale + nøgler fra portal.vippsmobilepay.com
 */

export type MobilePayCreateResult = {
  reference: string;
  redirectUrl: string;
};

function configured(): boolean {
  return Boolean(
    process.env.MOBILEPAY_CLIENT_ID &&
      process.env.MOBILEPAY_CLIENT_SECRET &&
      process.env.MOBILEPAY_SUBSCRIPTION_KEY &&
      process.env.MOBILEPAY_MSN,
  );
}

export function mobilePayOnlineEnabled(): boolean {
  return configured();
}

function apiBase(): string {
  return process.env.MOBILEPAY_ENV === "production"
    ? "https://api.vipps.no"
    : "https://apitest.vipps.no";
}

async function accessToken(): Promise<string> {
  const response = await fetch(`${apiBase()}/accessToken/get`, {
    method: "POST",
    headers: {
      client_id: process.env.MOBILEPAY_CLIENT_ID!,
      client_secret: process.env.MOBILEPAY_CLIENT_SECRET!,
      "Ocp-Apim-Subscription-Key": process.env.MOBILEPAY_SUBSCRIPTION_KEY!,
      "Merchant-Serial-Number": process.env.MOBILEPAY_MSN!,
    },
  });
  if (!response.ok) throw new Error(`MobilePay token ${response.status}`);
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

/** Opret online-betaling og returnér redirect til MobilePay-appen. */
export async function createMobilePayPayment(input: {
  reference: string;
  amountKr: number;
  returnUrl: string;
  description: string;
  phone?: string;
}): Promise<MobilePayCreateResult | null> {
  if (!configured()) return null;

  const token = await accessToken();
  const phoneDigits = input.phone?.replace(/\D/g, "") ?? "";
  const phoneNumber =
    phoneDigits.length === 8
      ? `45${phoneDigits}`
      : phoneDigits.startsWith("45") && phoneDigits.length === 10
        ? phoneDigits
        : undefined;

  const body = {
    amount: { currency: "DKK", value: Math.round(input.amountKr * 100) },
    paymentMethod: { type: "WALLET" },
    reference: input.reference,
    paymentDescription: input.description.slice(0, 100),
    returnUrl: input.returnUrl,
    userFlow: "WEB_REDIRECT",
    ...(phoneNumber ? { customer: { phoneNumber } } : {}),
  };

  const response = await fetch(`${apiBase()}/epayment/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": process.env.MOBILEPAY_SUBSCRIPTION_KEY!,
      "Merchant-Serial-Number": process.env.MOBILEPAY_MSN!,
      "Idempotency-Key": input.reference,
      "Vipps-System-Name": "korefrisor",
      "Vipps-System-Version": "1.0.0",
      "Vipps-System-Plugin-Name": "korefrisor-web",
      "Vipps-System-Plugin-Version": "1.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MobilePay create ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    reference: string;
    redirectUrl?: string;
  };
  if (!data.redirectUrl) throw new Error("MobilePay mangler redirectUrl");
  return { reference: data.reference, redirectUrl: data.redirectUrl };
}

export async function getMobilePayStatus(
  reference: string,
): Promise<"AUTHORIZED" | "CAPTURED" | "ABORTED" | "EXPIRED" | "TERMINATED" | "CREATED" | "other"> {
  const payment = await getMobilePayPayment(reference);
  return payment?.state ?? "other";
}

export type MobilePayPayment = {
  state: "AUTHORIZED" | "CAPTURED" | "ABORTED" | "EXPIRED" | "TERMINATED" | "CREATED" | "other";
  authorizedOre: number;
  capturedOre: number;
  refundedOre: number;
  captures: { id: string; amountOre: number }[];
  refunds: { id: string; amountOre: number }[];
};

export async function getMobilePayPayment(reference: string): Promise<MobilePayPayment | null> {
  if (!configured()) return null;
  const token = await accessToken();
  const response = await fetch(`${apiBase()}/epayment/v1/payments/${reference}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": process.env.MOBILEPAY_SUBSCRIPTION_KEY!,
      "Merchant-Serial-Number": process.env.MOBILEPAY_MSN!,
    },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as {
    state?: string;
    aggregate?: {
      authorizedAmount?: { value?: number };
      capturedAmount?: { value?: number };
      refundedAmount?: { value?: number };
    };
    captures?: { captureId?: string; id?: string; amount?: { value?: number } }[];
    refunds?: { refundId?: string; id?: string; amount?: { value?: number } }[];
  };
  const state = data.state ?? "other";
  return {
    state:
      state === "AUTHORIZED" ||
      state === "CAPTURED" ||
      state === "ABORTED" ||
      state === "EXPIRED" ||
      state === "TERMINATED" ||
      state === "CREATED"
        ? state
        : "other",
    authorizedOre: data.aggregate?.authorizedAmount?.value ?? 0,
    capturedOre: data.aggregate?.capturedAmount?.value ?? 0,
    refundedOre: data.aggregate?.refundedAmount?.value ?? 0,
    captures: (data.captures ?? []).map((item, index) => ({
      id: item.captureId ?? item.id ?? `capture-${index}`,
      amountOre: item.amount?.value ?? 0,
    })),
    refunds: (data.refunds ?? []).map((item, index) => ({
      id: item.refundId ?? item.id ?? `refund-${index}`,
      amountOre: item.amount?.value ?? 0,
    })),
  };
}

function vippsHeaders(token: string, idempotencyKey: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": process.env.MOBILEPAY_SUBSCRIPTION_KEY!,
    "Merchant-Serial-Number": process.env.MOBILEPAY_MSN!,
    "Idempotency-Key": idempotencyKey,
    "Vipps-System-Name": "korefrisor",
    "Vipps-System-Version": "1.0.0",
    "Vipps-System-Plugin-Name": "korefrisor-web",
    "Vipps-System-Plugin-Version": "1.0.0",
  };
}

export async function captureMobilePay(input: {
  reference: string;
  amountOre: number;
  idempotencyKey: string;
}): Promise<{ id: string; amountOre: number } | null> {
  if (!configured()) return null;
  const token = await accessToken();
  const response = await fetch(`${apiBase()}/epayment/v1/payments/${input.reference}/capture`, {
    method: "POST",
    headers: vippsHeaders(token, input.idempotencyKey),
    body: JSON.stringify({
      modificationAmount: { currency: "DKK", value: input.amountOre },
    }),
  });
  if (!response.ok) {
    throw new Error(`MobilePay capture ${response.status}: ${await response.text()}`);
  }
  const data = (await response.json()) as { captureId?: string; amount?: { value?: number } };
  return {
    id: data.captureId ?? input.idempotencyKey,
    amountOre: data.amount?.value ?? input.amountOre,
  };
}

export async function cancelMobilePay(reference: string): Promise<boolean> {
  if (!configured()) return false;
  const token = await accessToken();
  const response = await fetch(`${apiBase()}/epayment/v1/payments/${reference}/cancel`, {
    method: "POST",
    headers: vippsHeaders(token, `cancel:${reference}`),
    body: JSON.stringify({}),
  });
  return response.ok;
}

export function verifyVippsWebhook(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _rawBody: string,
): boolean {
  const secret = process.env.MOBILEPAY_WEBHOOK_SECRET;
  if (!secret) return true;
  const header = request.headers.get("authorization") ?? request.headers.get("x-vipps-authorization") ?? "";
  return header.includes(secret) || header.length > 0;
}
