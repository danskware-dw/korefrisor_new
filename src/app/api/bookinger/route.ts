import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { availableSlots } from "@/lib/availability";
import { createMobilePayPayment, mobilePayOnlineEnabled } from "@/lib/mobilepay";
import { paymentReference } from "@/lib/payment-policy";
import {
  buildCareHomeQuote,
  buildQuote,
  CARE_HOME_MAX_RESIDENTS,
  CARE_HOME_MIN_RESIDENTS,
  careHomeServiceIds,
} from "@/lib/pricing";
import { getRoute } from "@/lib/routing";
import { dispatchNotice } from "@/lib/notify/dispatch";
import { bookableServicesOf, getConfig } from "@/lib/runtime-config";
import { isAddon } from "@/config/business";
import { createBooking, SlotTakenError, type Booking } from "@/lib/store";

/** Simpel hastighedsbegrænsning, så formularen ikke kan spammes. */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isDanishPhone(value: string): boolean {
  return /^(\+45)?\s?(\d\s?){8}$/.test(value.trim());
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "ukendt";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "For mange forsøg. Prøv igen om lidt, eller ring til mig." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørgsel." }, { status: 400 });
  }

  const {
    serviceIds,
    address,
    date,
    time,
    name,
    phone,
    email,
    note,
    honeypot,
    employeeId,
    payWhen,
    forRelative,
    relativeName,
    repeatWeeks,
    smsDayBefore,
    kind,
    residents,
    facilityName,
  } = body as {
    serviceIds?: unknown;
    address?: { text?: string; postalCode?: string; city?: string; lat?: number; lon?: number };
    date?: string;
    time?: string;
    name?: string;
    phone?: string;
    email?: string;
    note?: string;
    honeypot?: string;
    employeeId?: string;
    payWhen?: unknown;
    forRelative?: unknown;
    relativeName?: unknown;
    repeatWeeks?: unknown;
    smsDayBefore?: unknown;
    kind?: unknown;
    residents?: unknown;
    facilityName?: unknown;
  };

  if (honeypot) return NextResponse.json({ ok: true });

  const errors: Record<string, string> = {};

  const config = await getConfig();
  const catalog = bookableServicesOf(config);
  const validIds = new Set<string>(catalog.map((s) => s.id));
  const isCareHome = kind === "plejehjem";
  const residentCount =
    typeof residents === "number" ? Math.round(residents) : Number(residents);
  const ids = isCareHome
    ? careHomeServiceIds(residentCount, config.services)
    : Array.isArray(serviceIds)
      ? serviceIds.filter((id): id is string => typeof id === "string" && validIds.has(id))
      : [];
  if (isCareHome) {
    if (
      !Number.isFinite(residentCount) ||
      residentCount < CARE_HOME_MIN_RESIDENTS ||
      residentCount > CARE_HOME_MAX_RESIDENTS
    ) {
      errors.residents = `Skriv antal beboere mellem ${CARE_HOME_MIN_RESIDENTS} og ${CARE_HOME_MAX_RESIDENTS}.`;
    }
  } else if (ids.length === 0) {
    errors.serviceIds = "Vælg mindst én behandling.";
  }
  const hasPrimary = ids.some((id) => {
    const service = catalog.find((item) => item.id === id) ?? config.services.find((item) => item.id === id);
    return Boolean(service && !isAddon(service));
  });
  if (ids.length > 0 && !hasPrimary) {
    errors.serviceIds = "Vælg et klip. Skæg, pandehår og bryn er tillæg.";
  }

  const payNow = payWhen !== "invoice";

  const bookAsRelative = forRelative === true;
  if (bookAsRelative && (typeof relativeName !== "string" || relativeName.trim().length < 2)) {
    errors.relativeName = "Skriv dit navn.";
  }

  const interval =
    typeof repeatWeeks === "number"
      ? repeatWeeks
      : typeof repeatWeeks === "string" && repeatWeeks
        ? Number(repeatWeeks)
        : undefined;
  const standing =
    interval === 1 || interval === 4 || interval === 6 || interval === 8 ? interval : undefined;

  const employee =
    typeof employeeId === "string"
      ? config.employees.find((item) => item.id === employeeId)
      : undefined;
  if (config.employees.length > 0 && !employee) {
    errors.employeeId = "Vælg hvem der skal komme.";
  }

  if (
    !address ||
    typeof address.lat !== "number" ||
    typeof address.lon !== "number" ||
    !address.text
  ) {
    errors.address = "Vælg din adresse fra listen med forslag.";
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Vælg en dato.";
  if (!time || !/^\d{2}:\d{2}$/.test(time)) errors.time = "Vælg et tidspunkt.";
  if (!name || name.trim().length < 2) errors.name = "Skriv dit navn.";
  if (!phone || !isDanishPhone(phone)) errors.phone = "Skriv et dansk telefonnummer på 8 cifre.";
  if (!email || !isEmail(email)) errors.email = "Skriv en gyldig e-mailadresse.";
  if (note && note.length > 1000) errors.note = "Bemærkningen er for lang.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const origin = employee
    ? { lat: employee.base.lat, lon: employee.base.lon }
    : undefined;
  const route = await getRoute({ lat: address!.lat!, lon: address!.lon! }, origin);
  const quote = isCareHome
    ? buildCareHomeQuote(residentCount, route, config.services, config.travel)
    : buildQuote(ids, route, config.services, config.travel);

  if (!quote.withinServiceArea) {
    return NextResponse.json(
      {
        errors: {
          address: `Adressen ligger ${quote.distanceKm} km væk, hvilket er uden for mit område. Ring til mig, så finder vi en løsning.`,
        },
      },
      { status: 400 },
    );
  }
  if (quote.belowMinimum) {
    return NextResponse.json(
      {
        errors: {
          serviceIds: `Ved kørsel så langt er mindste ordre ${quote.minimumRequired} kr.`,
        },
      },
      { status: 400 },
    );
  }

  const slots = await availableSlots({
    date: date!,
    durationMinutes: quote.durationMinutes,
    employeeId: employee?.id,
    destination: { lat: address!.lat!, lon: address!.lon! },
  });
  const slot = slots.find((s) => s.time === time);
  if (!slot) {
    return NextResponse.json(
      { errors: { time: "Tiden er desværre lige blevet booket. Vælg en anden." } },
      { status: 409 },
    );
  }

  const id = randomUUID();
  const reference = paymentReference(id);
  let redirectUrl: string | undefined;
  let mode: Booking["payment"]["mode"] = payNow ? "manuel" : "faktura";

  if (payNow && mobilePayOnlineEnabled()) {
    try {
      const online = await createMobilePayPayment({
        reference,
        amountKr: quote.total,
        returnUrl: `${config.siteUrl}/book/betaling?ref=${encodeURIComponent(reference)}`,
        description: `Hjemmeklip ${date} ${time}`,
        phone: phone!.trim(),
      });
      if (online?.redirectUrl) {
        redirectUrl = online.redirectUrl;
        mode = "online";
      }
    } catch (error) {
      console.error("MobilePay online fejlede — falder tilbage til manuel betaling", error);
    }
  }

  const serviceNames = ids.map(
    (sid) =>
      catalog.find((s) => s.id === sid)?.name ??
      config.services.find((s) => s.id === sid)?.name ??
      sid,
  );
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();

  const booking: Booking = {
    id,
    createdAt: new Date().toISOString(),
    status: payNow ? "afventer_betaling" : "bekraeftet",
    start: slot.startUtc,
    end: slot.endUtc,
    reminderForStart: slot.startUtc,
    serviceIds: serviceNames,
    ...(employee ? { employee: { id: employee.id, name: employee.name } } : {}),
    customer: {
      name: name!.trim(),
      phone: phone!.trim(),
      email: email!.trim(),
      note: note?.trim() || undefined,
    },
    ...(bookAsRelative
      ? {
          relative: {
            name: String(relativeName).trim(),
            phone: phone!.trim(),
            email: email!.trim(),
          },
        }
      : {}),
    ...(standing ? { repeatWeeks: standing } : {}),
    smsDayBefore: smsDayBefore !== false,
    ...(isCareHome
      ? {
          careHome: {
            residents: residentCount,
            weekday,
            facilityName:
              typeof facilityName === "string" && facilityName.trim()
                ? facilityName.trim()
                : undefined,
          },
        }
      : {}),
    address: {
      text: address!.text!,
      postalCode: address!.postalCode ?? "",
      city: address!.city ?? "",
      lat: address!.lat!,
      lon: address!.lon!,
    },
    pricing: {
      servicesTotal: quote.servicesTotal,
      travelFee: quote.travelFee,
      familyDiscount: quote.familyDiscount,
      total: quote.total,
      distanceKm: quote.distanceKm,
      drivingMinutes: quote.drivingMinutes,
    },
    payment: {
      method: payNow ? "mobilepay" : "faktura",
      status: "afventer",
      amountKr: quote.total,
      reference,
      mode,
      ...(redirectUrl ? { redirectUrl } : {}),
    },
    cancelToken: randomUUID(),
  };

  let saved: Booking;
  try {
    saved = await createBooking(booking);
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return NextResponse.json(
        { errors: { time: "Tiden er netop blevet taget. Vælg en anden." } },
        { status: 409 },
      );
    }
    throw error;
  }
  if (payNow) {
    await dispatchNotice(saved, "payment_instructions");
  } else {
    await dispatchNotice(saved, "confirmation");
  }

  return NextResponse.json({
    ok: true,
    needsPayment: payNow,
    booking: {
      id: saved.id,
      start: saved.start,
      cancelToken: saved.cancelToken,
      total: saved.pricing.total,
      payment: {
        reference: saved.payment.reference,
        mode: saved.payment.mode,
        redirectUrl: saved.payment.redirectUrl,
        mobilePayNumber: config.mobilePay,
        amountKr: saved.payment.amountKr,
        cancelFreeHours: config.cancelFreeHours,
        lateCancelFeeKr: config.lateCancelFeeKr,
      },
    },
  });
}
