import { formatDkk } from "@/lib/pricing";
import type { CancelOutcome } from "@/lib/payment-policy";
import { getConfig } from "@/lib/runtime-config";
import { isPlaceholderEmail } from "@/lib/placeholders";
import { visitPrepPlainList } from "@/lib/visit-prep";
import type { JobApplication } from "@/lib/applications";
import type { Booking } from "@/lib/store";

/**
 * Customer-facing mail. With RESEND_API_KEY the message is sent; otherwise it
 * is written to the server log so you can still see the wording locally.
 */

function formatDanishDateTime(iso: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    timeZone: "Europe/Copenhagen",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

async function sendMail(input: {
  to: string;
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(
      `\n--- E-mail der ville blive sendt til ${input.to} ---\n${input.subject}\n\n${input.body}\n`,
    );
    return;
  }

  const from = process.env.RESEND_FROM || `${input.fromName} <${input.fromEmail}>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.body,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${await response.text()}`);
  }
}

function contactName(booking: Booking): string {
  return booking.relative?.name ?? booking.customer.name;
}

function standingLine(booking: Booking): string {
  if (!booking.repeatWeeks) return "";
  if (booking.repeatWeeks === 1) return "Fast tid: samme ugedag hver uge.";
  return `Fast tid: hver ${booking.repeatWeeks}. uge.`;
}

function reminderLine(booking: Booking): string {
  if (!booking.smsDayBefore) return "";
  return `Påmindelse dagen før sendes til ${booking.customer.email}.`;
}

function appointmentUrl(booking: Booking, siteUrl: string): string {
  return `${siteUrl}/aftale/${booking.cancelToken}`;
}

async function mail(
  to: string,
  subject: string,
  body: string,
  config: { name: string; email: string; ownerName: string },
): Promise<void> {
  await sendMail({
    to,
    subject,
    body,
    fromName: config.name,
    fromEmail: config.email,
  });
}

/** Sendes når bookingen er oprettet, men betaling mangler. */
export async function sendPaymentInstructions(booking: Booking): Promise<void> {
  const config = await getConfig();
  const when = formatDanishDateTime(booking.start);

  await mail(
    booking.customer.email,
    `Betal din tid hos ${config.name} med MobilePay`,
    [
      `Hej ${booking.customer.name}`,
      "",
      `Din tid er reserveret, men først bekræftet når betalingen er på plads:`,
      "",
      `Tid: ${when}`,
      `Adresse: ${booking.address.text}`,
      `Beløb: ${formatDkk(booking.payment.amountKr)}`,
      `MobilePay-nummer: ${config.mobilePay}`,
      `Skriv i beskeden: ${booking.payment.reference}`,
      "",
      `Afbud mindst ${config.cancelFreeHours} timer før: du betaler intet (fuld refundering).`,
      `Afbud senere: gebyr ${formatDkk(config.lateCancelFeeKr)} — resten refunders.`,
      "",
      `Aflys eller flyt her: ${appointmentUrl(booking, config.siteUrl)}`,
      "",
      `Venlig hilsen`,
      config.ownerName,
      config.name,
    ].join("\n"),
    config,
  );

  await mail(
    config.email,
    `Afventer MobilePay: ${when}`,
    [
      `${booking.customer.name} — ${booking.customer.phone}`,
      `Beløb: ${formatDkk(booking.payment.amountKr)} · Ref: ${booking.payment.reference}`,
      booking.address.text,
    ].join("\n"),
    config,
  );
}

export async function sendBookingMessages(booking: Booking): Promise<void> {
  const config = await getConfig();
  const when = formatDanishDateTime(booking.start);
  const payLater = booking.payment.mode === "ved_besoeg" && booking.payment.status !== "betalt";
  const invoice = booking.payment.mode === "faktura" && booking.payment.status !== "betalt";
  const who = contactName(booking);

  await mail(
    booking.customer.email,
    `Din tid hos ${config.name} er bekræftet`,
    [
      `Hej ${who}`,
      "",
      booking.relative
        ? `Tak. Jeg kommer hjem til ${booking.customer.name}:`
        : payLater
          ? `Tak. Jeg kommer hjem til dig:`
          : invoice
            ? `Tak. Jeg kommer, og sender faktura til ${booking.customer.email}:`
            : `Tak — betalingen er modtaget. Jeg kommer hjem til dig:`,
      "",
      `Tid: ${when}`,
      `Adresse: ${booking.address.text}`,
      booking.employee ? `Frisør: ${booking.employee.name}` : "",
      booking.careHome
        ? `Plejehjem: ${booking.careHome.residents} beboere, én kørsel, én faktura.`
        : `Behandling: ${booking.serviceIds.join(", ")}`,
      booking.pricing.familyDiscount
        ? `Flere-samme-besøg rabat: ${formatDkk(booking.pricing.familyDiscount)}`
        : "",
      payLater
        ? `At betale: ${formatDkk(booking.payment.amountKr)} med MobilePay eller kontant, når jeg er færdig.`
        : invoice
          ? `Faktura ${booking.payment.reference}: ${formatDkk(booking.payment.amountKr)}. Betales med MobilePay til ${config.mobilePay} (skriv referencen).`
          : `Betalt: ${formatDkk(booking.payment.amountKr)} med MobilePay`,
      standingLine(booking),
      reminderLine(booking),
      "",
      "Inden jeg kommer:",
      visitPrepPlainList(),
      "",
      `Afbud mindst ${config.cancelFreeHours} timer før: du betaler intet.`,
      `Afbud senere: gebyr ${formatDkk(config.lateCancelFeeKr)}.`,
      `Aflys eller flyt her: ${appointmentUrl(booking, config.siteUrl)}`,
      "",
      `Eller ring på ${config.phone}.`,
      "",
      `Venlig hilsen`,
      config.ownerName,
      config.name,
    ]
      .filter(Boolean)
      .join("\n"),
    config,
  );

  await mail(
    config.email,
    payLater
      ? `Ny booking (betales ved besøg): ${when}`
      : invoice
        ? `Ny booking (faktura): ${when}`
        : `Ny betalt booking: ${when}`,
    [
      `${booking.customer.name} — ${booking.customer.phone}`,
      booking.relative ? `Pårørende: ${booking.relative.name}` : "",
      booking.customer.email,
      "",
      booking.employee ? `Frisør: ${booking.employee.name}` : "",
      `Adresse: ${booking.address.text}`,
      `Afstand: ${booking.pricing.distanceKm} km, ca. ${booking.pricing.drivingMinutes} min. kørsel`,
      `Behandling: ${booking.serviceIds.join(", ")}`,
      booking.careHome ? `${booking.careHome.residents} beboere · én kørsel` : "",
      standingLine(booking),
      reminderLine(booking),
      payLater
        ? `Betales ved besøg: ${formatDkk(booking.payment.amountKr)} · ${booking.payment.reference}`
        : invoice
          ? `Faktura: ${formatDkk(booking.payment.amountKr)} · ${booking.payment.reference}`
          : `Betalt: ${formatDkk(booking.payment.amountKr)} · ${booking.payment.reference}`,
      booking.customer.note ? `Bemærkning: ${booking.customer.note}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    config,
  );
}

export async function sendCancelMessages(
  booking: Booking,
  outcome: CancelOutcome,
): Promise<void> {
  const config = await getConfig();
  const when = formatDanishDateTime(booking.start);

  await mail(
    booking.customer.email,
    `Din tid hos ${config.name} er aflyst`,
    [
      `Hej ${booking.customer.name}`,
      "",
      `Din tid ${when} er aflyst.`,
      outcome.free
        ? outcome.refundKr > 0
          ? `Du aflyste mindst ${config.cancelFreeHours} timer før — du betaler intet. ${formatDkk(outcome.refundKr)} refunders.`
          : `Du aflyste mindst ${config.cancelFreeHours} timer før — du betaler intet.`
        : outcome.paidKr > 0
          ? `Du aflyste med under ${config.cancelFreeHours} timers varsel. Gebyr: ${formatDkk(outcome.feeKr)}. ${formatDkk(outcome.refundKr)} refunders.`
          : `Du aflyste med under ${config.cancelFreeHours} timers varsel. Gebyr: ${formatDkk(outcome.feeKr)} — betal med MobilePay til ${config.mobilePay}.`,
      "",
      `Spørgsmål? Ring ${config.phone}.`,
      "",
      `Venlig hilsen`,
      config.ownerName,
      config.name,
    ].join("\n"),
    config,
  );

  await mail(
    config.email,
    `Aflyst: ${when}`,
    [
      `${booking.customer.name} — ${booking.customer.phone}`,
      outcome.free
        ? outcome.refundKr > 0
          ? `Gratis afbud — refundér ${formatDkk(outcome.refundKr)}`
          : "Gratis afbud — intet at refundere"
        : outcome.paidKr > 0
          ? `Sen aflysning — behold ${formatDkk(outcome.feeKr)}, refundér ${formatDkk(outcome.refundKr)}`
          : `Sen aflysning — opkræv gebyr ${formatDkk(outcome.feeKr)}`,
      `Ref: ${booking.payment.reference}`,
    ].join("\n"),
    config,
  );
}

export async function sendReminderEmail(booking: Booking): Promise<void> {
  const config = await getConfig();
  const when = formatDanishDateTime(booking.start);
  await mail(
    booking.customer.email,
    `Påmindelse: i morgen kommer ${config.name}`,
    [
      `Hej ${contactName(booking)}`,
      "",
      `I morgen ${when} kommer ${config.name} og klipper ${booking.customer.name} på ${booking.address.text}.`,
      "",
      `Ændr eller aflys: ${appointmentUrl(booking, config.siteUrl)}`,
      "",
      `Venlig hilsen`,
      config.ownerName,
      config.name,
    ].join("\n"),
    config,
  );
}

export async function sendRescheduleMessages(booking: Booking): Promise<void> {
  const config = await getConfig();
  const when = formatDanishDateTime(booking.start);
  await mail(
    booking.customer.email,
    `Din tid hos ${config.name} er flyttet`,
    [
      `Hej ${contactName(booking)}`,
      "",
      `Ny tid: ${when}`,
      `Adresse: ${booking.address.text}`,
      `Se eller aflys: ${appointmentUrl(booking, config.siteUrl)}`,
    ].join("\n"),
    config,
  );
}

export async function sendExpireMessages(booking: Booking): Promise<void> {
  const config = await getConfig();
  await mail(
    booking.customer.email,
    `Tiden hos ${config.name} er udløbet`,
    [
      `Hej ${contactName(booking)}`,
      "",
      "Betalingen kom først, efter reservationens 45 minutter var gået, og tiden er ikke længere ledig.",
      `Book en ny tid eller se detaljer: ${appointmentUrl(booking, config.siteUrl)}`,
    ].join("\n"),
    config,
  );
}

export async function sendJobApplicationNotice(
  application: JobApplication,
): Promise<void> {
  const config = await getConfig();
  if (isPlaceholderEmail(config.email)) return;
  await mail(
    config.email,
    `Ny ansøgning fra ${application.name}`,
    [
      `${application.name} har søgt som udekørende frisør.`,
      `Telefon: ${application.phone}`,
      `Område: ${application.city}`,
      "",
      application.message,
    ].join("\n"),
    config,
  );
}
