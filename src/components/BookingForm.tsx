"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Employee, Service } from "@/config/types";
import { FAMILY_EXTRA_PERSON_DISCOUNT_KR, formatDkk, type Quote } from "@/lib/pricing";
import { RouteMap } from "@/components/map/TravelMap";
import { ServiceChoice } from "@/components/ServiceChoice";
import { EmployeeChoice } from "@/components/EmployeeChoice";
import { QuoteBreakdown } from "@/components/QuoteBreakdown";
import {
  FieldError,
  LoadingSpinner,
  StepActions,
  StepBox,
  StepHeading,
  TextField,
  danishDate,
  fieldClass,
  isDanishPhone,
  isEmail,
  isoPlusDays,
  todayIso,
} from "@/components/booking-ui";
import type { AddressSuggestion } from "@/app/api/adresser/route";
import { visitPrepChecklist } from "@/lib/visit-prep";

type Slot = { time: string; startUtc: string; endUtc: string };
type RouteInfo = { geometry: [number, number][]; source: "rute" | "estimat" };
type WizardStep = 1 | 2 | 3 | 4 | 5;
type ExtraPerson = { key: string; serviceIds: string[] };
type PayWhen = "now" | "invoice";

const STEP_LABELS = [
  "Behandling",
  "Frisør",
  "Adresse og tid",
  "Dine oplysninger",
  "Betaling",
] as const;

function hasPrimaryService(ids: string[], services: Service[]): boolean {
  return ids.some((id) => services.find((service) => service.id === id && !service.addon));
}

function togglePersonServices(
  current: string[],
  id: string,
  catalog: Service[],
): string[] {
  const service = catalog.find((item) => item.id === id);
  if (!service) return current;
  if (service.addon) {
    return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  }
  const addons = current.filter((item) => catalog.find((s) => s.id === item)?.addon);
  return current.includes(id) ? addons : [...addons, id];
}

type BookingFormProps = {
  services: Service[];
  employees: Employee[];
  phone: string;
  maxAdvanceDays: number;
  home: { lat: number; lon: number; city: string; postalCode: string };
  initialServiceId?: string;
  initialForRelative?: boolean;
};

export function BookingForm({
  services,
  employees,
  phone,
  maxAdvanceDays,
  home,
  initialServiceId,
  initialForRelative = false,
}: BookingFormProps) {
  const formId = useId();
  const [employeeId, setEmployeeId] = useState<string>(() =>
    employees.length === 1 ? employees[0].id : "",
  );
  const [selected, setSelected] = useState<string[]>(() =>
    initialServiceId &&
    services.some((service) => service.id === initialServiceId && !service.contactOnly)
      ? [initialServiceId]
      : [],
  );
  const [extras, setExtras] = useState<ExtraPerson[]>([]);
  const [forRelative, setForRelative] = useState(initialForRelative);
  const [clientName, setClientName] = useState("");
  const [relativeName, setRelativeName] = useState("");
  const [repeatWeeks, setRepeatWeeks] = useState<number | "">("");
  const [smsDayBefore, setSmsDayBefore] = useState(true);

  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [address, setAddress] = useState<AddressSuggestion | null>(null);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);

  const [date, setDate] = useState("");
  // null betyder "ikke hentet endnu" — det er sådan vi ved, at vi stadig venter.
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState("");
  const [failed, setFailed] = useState({ quote: false, slots: false });

  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [payWhen, setPayWhen] = useState<PayWhen>(initialForRelative ? "invoice" : "now");
  const [step, setStep] = useState<WizardStep>(1);
  const formTopRef = useRef<HTMLDivElement>(null);
  const [confirmed, setConfirmed] = useState<{
    start: string;
    cancelToken: string;
    paid: boolean;
  } | null>(null);
  const [payment, setPayment] = useState<{
    bookingId: string;
    start: string;
    cancelToken: string;
    amountKr: number;
    reference: string;
    mobilePayNumber: string;
    mode: "online" | "manuel" | "ved_besoeg" | "faktura";
    redirectUrl?: string;
    cancelFreeHours: number;
    lateCancelFeeKr: number;
  } | null>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === employeeId) ?? null,
    [employees, employeeId],
  );
  const mapHome = selectedEmployee
    ? {
        lat: selectedEmployee.base.lat,
        lon: selectedEmployee.base.lon,
        city: selectedEmployee.base.city,
        postalCode: selectedEmployee.base.postalCode,
      }
    : home;

  const primaryServices = useMemo(
    () => services.filter((s) => !s.addon),
    [services],
  );
  const addonServices = useMemo(
    () => services.filter((s) => s.addon),
    [services],
  );
  const allServiceIds = useMemo(
    () => [...selected, ...extras.flatMap((person) => person.serviceIds)],
    [selected, extras],
  );
  const selectedServices = useMemo(
    () =>
      allServiceIds
        .map((id) => services.find((service) => service.id === id))
        .filter((service): service is Service => Boolean(service)),
    [allServiceIds, services],
  );
  const duration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const hasPrimary = hasPrimaryService(selected, services);
  const extrasReady = extras.every((person) => hasPrimaryService(person.serviceIds, services));
  const canPickTime = Boolean(quote?.withinServiceArea);

  // Ventetilstandene udledes af, hvad vi har hentet — de er ikke selvstændig state.
  const quoteLoading = Boolean(address) && allServiceIds.length > 0 && !quote && !failed.quote;
  const slotsLoading = Boolean(date) && duration > 0 && slots === null && !failed.slots;

  // Adresseforslag fra DAWA, med en lille forsinkelse så vi ikke kalder på hvert tastetryk.
  useEffect(() => {
    if (address || addressQuery.trim().length < 3) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/adresser?q=${encodeURIComponent(addressQuery)}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as { suggestions: AddressSuggestion[] };
        setSuggestions(data.suggestions ?? []);
      } catch {
        /* afbrudt eller netværksfejl — forslagene er ikke kritiske */
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [addressQuery, address]);

  // Pris, afstand og rute beregnes på serveren, hver gang valg eller adresse ændres.
  useEffect(() => {
    if (!address || allServiceIds.length === 0 || !employeeId) return;

    const controller = new AbortController();

    fetch("/api/tilbud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceIds: allServiceIds,
        lat: address.lat,
        lon: address.lon,
        employeeId,
      }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { quote?: Quote; route?: RouteInfo }) => {
        if (!data.quote) throw new Error("Intet svar");
        setQuote(data.quote);
        setRoute(data.route ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFailed((f) => ({ ...f, quote: true }));
        }
      });

    return () => controller.abort();
  }, [address, allServiceIds, employeeId]);

  // Ledige tider for den valgte dag.
  useEffect(() => {
    if (!date || duration === 0) return;

    const controller = new AbortController();

    const loc =
      address && Number.isFinite(address.lat) && Number.isFinite(address.lon)
        ? `&lat=${address.lat}&lon=${address.lon}`
        : "";
    const frisor = employeeId ? `&frisor=${encodeURIComponent(employeeId)}` : "";
    fetch(`/api/ledige-tider?dato=${date}&varighed=${duration}${frisor}${loc}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { slots?: Slot[] }) => setSlots(data.slots ?? []))
      .catch(() => {
        if (!controller.signal.aborted) {
          setFailed((f) => ({ ...f, slots: true }));
        }
      });

    return () => controller.abort();
  }, [date, duration, employeeId, address]);

  useEffect(() => {
    if (confirmed) confirmationRef.current?.focus();
  }, [confirmed]);

  const didMountStep = useRef(false);
  useEffect(() => {
    if (!didMountStep.current) {
      didMountStep.current = true;
      return;
    }
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function goToStep(next: WizardStep) {
    setErrors({});
    setStep(next);
  }

  function tryAdvance() {
    const nextErrors: Record<string, string> = {};
    if (step === 1 && !hasPrimary) {
      nextErrors.serviceIds = "Du skal vælge mindst ét klip (fx klip, pensionistklip eller børneklip). Skæg, pandehår og bryn er tillæg, der bookes sammen med et klip.";
    }
    if (step === 1 && extras.length > 0 && !extrasReady) {
      nextErrors.serviceIds = "Husk at vælge et klip til hver ekstra person, du har tilføjet.";
    }
    if (step === 2 && !employeeId) {
      nextErrors.employeeId = "Vælg hvem der skal komme ud til dig.";
    }
    if (step === 3 && !address) {
      nextErrors.address = "Skriv din adresse, og vælg den fra listen med forslag, der kommer fra Danmarks Adresseregister.";
    }
    if (step === 3 && address && quote && !quote.withinServiceArea) {
      nextErrors.address = `Din adresse ligger ${quote.distanceKm} km væk, og det er desværre længere, end jeg normalt kører. Ring til mig på ${phone}, så finder vi ud af, om det kan lade sig gøre alligevel.`;
    }
    if (step === 3 && address && !quote && !failed.quote) {
      return;
    }
    if (step === 3 && !date) nextErrors.date = "Vælg en dag, hvor det passer dig.";
    if (step === 3 && !time) nextErrors.time = "Vælg et tidspunkt fra de ledige tider.";
    if (step === 4) {
      if (forRelative) {
        if (clientName.trim().length < 2) nextErrors.clientName = "Skriv navnet på den, der skal klippes (fx dit barn, din mor eller far).";
        if (relativeName.trim().length < 2) nextErrors.relativeName = "Skriv dit eget navn, så jeg ved, hvem jeg skal ringe til.";
      } else if (customer.name.trim().length < 2) {
        nextErrors.name = "Skriv dit fulde navn.";
      }
      if (!isDanishPhone(customer.phone)) nextErrors.phone = "Skriv et gyldigt dansk telefonnummer med 8 cifre (fx 12 34 56 78 eller +45 12 34 56 78).";
      if (!isEmail(customer.email)) nextErrors.email = "Skriv en gyldig e-mailadresse, så jeg kan sende bekræftelse og påmindelse.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (step < 5) goToStep((step + 1) as WizardStep);
  }

  /** Ryd beregnet pris og tider, så kunden aldrig ser et gammelt resultat. */
  function resetDerived() {
    setQuote(null);
    setRoute(null);
    setSlots(null);
    setTime("");
    setFailed({ quote: false, slots: false });
  }

  function selectEmployee(id: string) {
    setEmployeeId(id);
    resetDerived();
  }

  function toggleService(id: string) {
    setSelected((current) => togglePersonServices(current, id, services));
    resetDerived();
  }

  function addExtraPerson() {
    const fallback =
      selected.find((id) => !services.find((service) => service.id === id)?.addon) ??
      primaryServices[0]?.id;
    if (!fallback) return;
    setExtras((current) => [
      ...current,
      { key: `${Date.now()}-${current.length}`, serviceIds: [fallback] },
    ]);
    resetDerived();
  }

  function removeExtraPerson(key: string) {
    setExtras((current) => current.filter((person) => person.key !== key));
    resetDerived();
  }

  function toggleExtraService(key: string, id: string) {
    setExtras((current) =>
      current.map((person) =>
        person.key === key
          ? { ...person, serviceIds: togglePersonServices(person.serviceIds, id, services) }
          : person,
      ),
    );
    resetDerived();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== 5) {
      tryAdvance();
      return;
    }
    setSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/bookinger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          serviceIds: allServiceIds,
          address: address
            ? {
                text: address.text,
                postalCode: address.postalCode,
                city: address.city,
                lat: address.lat,
                lon: address.lon,
              }
            : null,
          date,
          time,
          name: forRelative ? clientName : customer.name,
          phone: customer.phone,
          email: customer.email,
          note: customer.note,
          forRelative,
          relativeName: forRelative ? relativeName : undefined,
          repeatWeeks: repeatWeeks === "" ? undefined : repeatWeeks,
          smsDayBefore,
          payWhen,
          honeypot: formData.get("firmanavn"),
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        needsPayment?: boolean;
        booking?: {
          id: string;
          start: string;
          cancelToken: string;
          total: number;
          payment: {
            reference: string;
            mode: "online" | "manuel" | "ved_besoeg" | "faktura";
            redirectUrl?: string;
            mobilePayNumber: string;
            amountKr: number;
            cancelFreeHours: number;
            lateCancelFeeKr: number;
          };
        };
        errors?: Record<string, string>;
        error?: string;
      };

      if (!response.ok) {
        const fieldErrors = data.errors ?? { form: data.error ?? "Noget gik galt. Prøv igen." };
        setErrors(fieldErrors);
        if (fieldErrors.serviceIds) goToStep(1);
        else if (fieldErrors.employeeId) goToStep(2);
        else if (fieldErrors.address || fieldErrors.date || fieldErrors.time) goToStep(3);
        else if (
          fieldErrors.name ||
          fieldErrors.phone ||
          fieldErrors.email ||
          fieldErrors.clientName ||
          fieldErrors.relativeName
        ) {
          goToStep(4);
        }
        return;
      }

      if (data.needsPayment && data.booking?.payment) {
        const pay = data.booking.payment;
        if (pay.mode === "online" && pay.redirectUrl) {
          window.location.href = pay.redirectUrl;
          return;
        }
        setPayment({
          bookingId: data.booking.id,
          start: data.booking.start,
          cancelToken: data.booking.cancelToken,
          amountKr: pay.amountKr,
          reference: pay.reference,
          mobilePayNumber: pay.mobilePayNumber,
          mode: pay.mode,
          redirectUrl: pay.redirectUrl,
          cancelFreeHours: pay.cancelFreeHours,
          lateCancelFeeKr: pay.lateCancelFeeKr,
        });
        return;
      }

      setConfirmed({
        start: data.booking?.start ?? "",
        cancelToken: data.booking?.cancelToken ?? "",
        paid: false,
      });
    } catch {
      setErrors({
        form: `Bookingen kunne ikke sendes. Prøv igen, eller ring til mig på ${phone}.`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmPaid() {
    if (!payment) return;
    setSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/bookinger/bekraeft-betaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: payment.bookingId, manual: true }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        booking?: { start: string; cancelToken: string };
        error?: string;
      };
      if (!response.ok) {
        setErrors({ form: data.error ?? "Betalingen kunne ikke bekræftes." });
        return;
      }
      setConfirmed({
        start: data.booking?.start ?? payment.start,
        cancelToken: data.booking?.cancelToken ?? payment.cancelToken,
        paid: true,
      });
      setPayment(null);
    } catch {
      setErrors({ form: "Noget gik galt. Prøv igen." });
    } finally {
      setSubmitting(false);
    }
  }

  if (payment) {
    return (
      <div className="scroll-mt-28 rounded-card border-2 border-brand bg-surface p-8">
        <h2 className="text-3xl font-bold">Betal med MobilePay</h2>
        <p className="mt-4 text-lg">
          Din tid er reserveret. Betal nu — så er bookingen bekræftet.
        </p>
        <dl className="mt-6 space-y-3 text-lg">
          <div className="flex justify-between gap-4">
            <dt>Beløb</dt>
            <dd className="font-bold tabular-nums">{formatDkk(payment.amountKr)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>MobilePay</dt>
            <dd className="font-bold">{payment.mobilePayNumber}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Skriv i beskeden</dt>
            <dd className="font-bold">{payment.reference}</dd>
          </div>
        </dl>
        <ol className="mt-6 list-decimal space-y-2 pl-6 text-lg text-ink-soft">
          <li>Åbn MobilePay</li>
          <li>Send {formatDkk(payment.amountKr)} til {payment.mobilePayNumber}</li>
          <li>Skriv {payment.reference} i beskeden</li>
          <li>Tryk herunder, når du har betalt</li>
        </ol>
        <p className="mt-6 rounded-lg bg-muted px-4 py-3 text-ink-soft">
          Afbud mindst {payment.cancelFreeHours} timer før: du betaler intet. Senere: gebyr{" "}
          {formatDkk(payment.lateCancelFeeKr)}.
        </p>
        <button
          type="button"
          disabled={submitting}
          onClick={confirmPaid}
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-lg bg-accent px-8 py-5 text-xl font-bold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting && <LoadingSpinner size="sm" />}
          <span>{submitting ? "Bekræfter …" : "Jeg har betalt med MobilePay"}</span>
        </button>
        {errors.form && <FieldError>{errors.form}</FieldError>}
      </div>
    );
  }

  if (confirmed) {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="scroll-mt-28 rounded-card border-2 border-accent bg-surface p-8"
      >
        <span
          aria-hidden="true"
          className="grid size-14 place-items-center rounded-full bg-accent text-white"
        >
          <CheckIcon className="size-8" />
        </span>
        <h2 className="mt-5 text-3xl font-bold">Din tid er bekræftet</h2>
        <p className="mt-4 text-lg">
          Tak, {(forRelative ? relativeName : customer.name).split(" ")[0]}.{" "}
          {selectedEmployee ? (
            <>
              <strong>{selectedEmployee.name}</strong> kommer{" "}
            </>
          ) : (
            "Jeg kommer "
          )}
          <strong>
            {confirmed.start
              ? new Intl.DateTimeFormat("da-DK", {
                  timeZone: "Europe/Copenhagen",
                  dateStyle: "full",
                  timeStyle: "short",
                }).format(new Date(confirmed.start))
              : "på det aftalte tidspunkt"}
          </strong>{" "}
          til {address?.text}
          {forRelative && clientName ? ` hos ${clientName}` : ""}.
        </p>
        <p className="mt-4 text-lg">
          {confirmed.paid
            ? `Du har betalt med MobilePay. Bekræftelse sendes til ${customer.email}.`
            : payWhen === "invoice"
              ? `Jeg sender faktura til ${customer.email}. Betales med MobilePay, inden jeg kører.`
              : `Du betaler med MobilePay, når du booker. Bekræftelse sendes til ${customer.email}.`}
        </p>
        {smsDayBefore && (
          <p className="mt-4 text-lg">
            Jeg sender en e-mail dagen før til {customer.email}.
          </p>
        )}
        {repeatWeeks !== "" && (
          <p className="mt-4 text-lg">
            Fast tid hver {repeatWeeks}. uge — jeg sætter jer i kalenderen, og I får e-mail
            dagen før.
          </p>
        )}
        <p className="mt-4 text-lg text-ink-soft">
          Skal du aflyse? Mindst 24 timer før betaler du intet. Senere koster det 100 kr.{" "}
          {confirmed.cancelToken && (
            <a
              href={`/aflys/${confirmed.cancelToken}`}
              className="font-semibold text-brand underline"
            >
              Aflys her
            </a>
          )}
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div ref={formTopRef} className="scroll-mt-28">
        <StepIndicator
          steps={[...STEP_LABELS]}
          current={step}
          onSelect={(index) => {
            const next = (index + 1) as WizardStep;
            if (next <= step) goToStep(next);
          }}
        />
      </div>

      {step === 1 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={1}
              title="Hvad skal du have lavet?"
              hint="Vælg et klip. Skæg, pandehår og bryn kan du lægge til."
            />
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {primaryServices.map((service) => (
                <li key={service.id}>
                  <ServiceChoice
                    service={service}
                    checked={selected.includes(service.id)}
                    onToggle={() => toggleService(service.id)}
                  />
                </li>
              ))}
            </ul>
            {addonServices.length > 0 && (
              <>
                <h3 className="mt-8 text-lg font-bold">Tillæg</h3>
                <p className="mt-1 text-ink-soft">Valgfrit. Vælges sammen med et klip.</p>
                <ul className="mt-4 grid gap-5 sm:grid-cols-2">
                  {addonServices.map((service) => (
                    <li key={service.id}>
                      <ServiceChoice
                        service={service}
                        checked={selected.includes(service.id)}
                        onToggle={() => toggleService(service.id)}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="mt-8 text-lg font-bold">Flere samme sted?</h3>
            <p className="mt-1 text-ink-soft">
              {formatDkk(FAMILY_EXTRA_PERSON_DISCOUNT_KR)} rabat pr. ekstra person. Kørsel
              betales kun én gang — så I ikke sammenligner ét klip med salonpris.
            </p>
            {extras.map((person, index) => (
              <div key={person.key} className="mt-4 rounded-lg border border-line p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">Person {index + 2}</p>
                  <button
                    type="button"
                    onClick={() => removeExtraPerson(person.key)}
                    className="text-lg font-semibold text-brand underline"
                  >
                    Fjern
                  </button>
                </div>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {primaryServices.map((service) => (
                    <li key={service.id}>
                      <ServiceChoice
                        service={service}
                        checked={person.serviceIds.includes(service.id)}
                        onToggle={() => toggleExtraService(person.key, service.id)}
                      />
                    </li>
                  ))}
                </ul>
                {addonServices.length > 0 && (
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {addonServices.map((service) => (
                      <li key={service.id}>
                        <ServiceChoice
                          service={service}
                          checked={person.serviceIds.includes(service.id)}
                          onToggle={() => toggleExtraService(person.key, service.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addExtraPerson}
              className="mt-4 inline-flex min-h-14 items-center justify-center rounded-lg border-2 border-brand px-6 py-3 text-lg font-semibold text-brand hover:bg-brand-light"
            >
              Tilføj en person
            </button>
            {errors.serviceIds && <FieldError>{errors.serviceIds}</FieldError>}
          </fieldset>
          <StepActions
            onNext={tryAdvance}
            nextLabel="Godkend"
            nextDisabled={!hasPrimary || !extrasReady}
          />
        </StepBox>
      )}

      {step === 2 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={2}
              title="Hvem skal komme?"
              hint="Vælg frisør. Du kan se billede og hvor personen kører fra."
            />
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {employees.map((employee) => (
                <li key={employee.id}>
                  <EmployeeChoice
                    employee={employee}
                    selected={employeeId === employee.id}
                    onSelect={() => selectEmployee(employee.id)}
                  />
                </li>
              ))}
            </ul>
            {errors.employeeId && <FieldError>{errors.employeeId}</FieldError>}
          </fieldset>
          <StepActions
            onBack={() => goToStep(1)}
            onNext={tryAdvance}
            nextLabel="Godkend"
            nextDisabled={!employeeId}
          />
        </StepBox>
      )}

      {step === 3 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={3}
              title="Hvor og hvornår?"
              hint="Vælg adressen fra listen, se den låste pris, og vælg så dag og tid."
            />

            <label htmlFor={`${formId}-adresse`} className="mt-6 block text-lg font-semibold">
              Din adresse
            </label>
            <input
              id={`${formId}-adresse`}
              type="text"
              autoComplete="street-address"
              value={address ? address.text : addressQuery}
              onChange={(e) => {
                setAddress(null);
                setSuggestions([]);
                setAddressQuery(e.target.value);
                resetDerived();
              }}
              placeholder="Fx Kastrupvej 12, 2770 Kastrup"
              className={`${fieldClass} mt-2`}
              aria-describedby={`${formId}-adresse-hjaelp`}
            />
            <p id={`${formId}-adresse-hjaelp`} className="mt-2 text-ink-soft">
              Adresserne kommer fra Danmarks officielle adresseregister.
            </p>

            {suggestions.length > 0 && (
              <ul className="mt-3 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setAddress(suggestion);
                        setSuggestions([]);
                      }}
                      className="w-full px-5 py-3 text-left text-lg hover:bg-brand-light"
                    >
                      {suggestion.text}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.address && <FieldError>{errors.address}</FieldError>}
          </fieldset>

          <div aria-live="polite" className="mt-6">
            {quoteLoading && (
              <div className="flex items-center gap-3 rounded-card border border-line bg-surface px-6 py-5 text-lg text-ink-soft">
                <LoadingSpinner />
                <span>Regner afstand og pris ud …</span>
              </div>
            )}

            {failed.quote && (
              <FieldError>
                Prisen kunne ikke beregnes lige nu. Prøv at vælge adressen igen, eller ring til
                mig på {phone}.
              </FieldError>
            )}

            {quote && address && !quoteLoading && (
              <section className="overflow-hidden rounded-card border-2 border-brand bg-canvas">
                <h2 className="border-b border-line bg-brand-light px-6 py-4 text-2xl font-bold">
                  Din pris
                </h2>
                <div className="p-6">
                  {!quote.withinServiceArea ? (
                    <p className="text-lg">
                      Din adresse ligger{" "}
                      <strong className="tabular-nums">{quote.distanceKm} km</strong> fra{" "}
                      {selectedEmployee?.name ?? "mig"}, og det er desværre længere, end jeg
                      kører til normalt. Ring til mig på{" "}
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="font-semibold text-brand underline"
                      >
                        {phone}
                      </a>
                      , så finder vi ud af, om det kan lade sig gøre alligevel.
                    </p>
                  ) : (
                    <QuoteBreakdown
                      quote={quote}
                      employeeName={selectedEmployee?.name}
                    />
                  )}
                  <div className="mt-6">
                    <RouteMap
                      home={mapHome}
                      destination={{ lat: address.lat, lon: address.lon }}
                      addressText={address.text}
                      distanceKm={quote.distanceKm}
                      drivingMinutes={quote.drivingMinutes}
                      route={route?.geometry ?? []}
                      isEstimate={route?.source === "estimat"}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>

          {canPickTime && (
            <fieldset className="mt-8">
              <legend className="text-2xl font-bold">Hvornår passer det dig?</legend>
              <label htmlFor={`${formId}-dato`} className="mt-6 block text-lg font-semibold">
                Vælg dag
              </label>
              <input
                id={`${formId}-dato`}
                type="date"
                value={date}
                min={todayIso()}
                max={isoPlusDays(maxAdvanceDays)}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSlots(null);
                  setTime("");
                  setFailed((f) => ({ ...f, slots: false }));
                }}
                className={`${fieldClass} mt-2 sm:max-w-xs`}
              />
              {errors.date && <FieldError>{errors.date}</FieldError>}

              <div aria-live="polite" className="mt-6">
                {slotsLoading && (
                  <div className="flex items-center gap-3 text-lg text-ink-soft">
                    <LoadingSpinner />
                    <span>Finder ledige tider …</span>
                  </div>
                )}

                {failed.slots && (
                  <FieldError>
                    De ledige tider kunne ikke hentes. Prøv igen, eller ring til mig på {phone}.
                  </FieldError>
                )}

                {date && slots?.length === 0 && (
                  <p className="text-lg">
                    Der er ingen ledige tider {danishDate(date)}. Prøv en anden dag, eller ring
                    til mig.
                  </p>
                )}

                {slots && slots.length > 0 && (
                  <>
                    <p className="text-lg font-semibold">Ledige tider {danishDate(date)}</p>
                    <ul className="mt-3 flex flex-wrap gap-3">
                      {slots.map((slot) => (
                        <li key={slot.time}>
                          <button
                            type="button"
                            onClick={() => setTime(slot.time)}
                            aria-pressed={time === slot.time}
                            className={`inline-flex min-w-24 items-center justify-center rounded-lg border-2 px-5 py-3 text-lg font-semibold tabular-nums ${
                              time === slot.time
                                ? "border-accent bg-accent text-white"
                                : "border-line bg-surface hover:border-brand"
                            }`}
                          >
                            {slot.time}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              {errors.time && <FieldError>{errors.time}</FieldError>}
            </fieldset>
          )}
          <StepActions
            onBack={() => goToStep(2)}
            onNext={tryAdvance}
            nextLabel="Godkend"
            nextDisabled={!time}
          />
        </StepBox>
      )}

      {step === 4 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={4}
              title={forRelative ? "Hvem booker, og hvem skal klippes?" : "Hvem er du?"}
              hint={
                forRelative
                  ? "Adressen er deres. Telefon og e-mail er dine, så jeg ringer til dig."
                  : "Du kan også booke for mor, far eller bedsteforældre."
              }
            />

            <label className="mt-6 flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border-2 border-line p-4">
              <input
                type="checkbox"
                checked={forRelative}
                onChange={(e) => {
                  const on = e.target.checked;
                  setForRelative(on);
                  if (on) setPayWhen((current) => (current === "now" ? current : "invoice"));
                  else setPayWhen((current) => (current === "invoice" ? "now" : current));
                }}
                className="mt-1 size-6 accent-[var(--color-accent)]"
              />
              <span>
                <span className="block font-bold">Jeg booker for en pårørende</span>
                <span className="text-ink-soft">
                  Deres adresse, dit telefonnummer. Faktura og e-mail dagen før til dig.
                </span>
              </span>
            </label>

            {forRelative ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <TextField
                  id={`${formId}-klippes`}
                  label="Hvem skal klippes?"
                  autoComplete="off"
                  value={clientName}
                  onChange={setClientName}
                  error={errors.clientName}
                />
                <TextField
                  id={`${formId}-parorende`}
                  label="Dit navn (pårørende)"
                  autoComplete="name"
                  value={relativeName}
                  onChange={setRelativeName}
                  error={errors.relativeName}
                />
              </div>
            ) : (
              <div className="mt-6">
                <TextField
                  id={`${formId}-navn`}
                  label="Navn"
                  autoComplete="name"
                  value={customer.name}
                  onChange={(v) => setCustomer({ ...customer, name: v })}
                  error={errors.name}
                />
              </div>
            )}

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                id={`${formId}-telefon`}
                label={forRelative ? "Dit telefonnummer" : "Telefonnummer"}
                type="tel"
                autoComplete="tel"
                hint="Så jeg kan ringe, hvis jeg bliver forsinket."
                value={customer.phone}
                onChange={(v) => setCustomer({ ...customer, phone: v })}
                error={errors.phone}
              />
              <TextField
                id={`${formId}-email`}
                label={forRelative ? "Din e-mail" : "E-mail"}
                type="email"
                autoComplete="email"
                hint="Bekræftelse, påmindelse og faktura sendes hertil."
                value={customer.email}
                onChange={(v) => setCustomer({ ...customer, email: v })}
                error={errors.email}
              />
            </div>

            <fieldset className="mt-8">
              <legend className="text-lg font-bold">Fast tid</legend>
              <p className="mt-1 text-ink-soft">
                Mange ældre klippes hver 4. eller 6. uge. Jeg sætter det i kalenderen.
              </p>
              <ul className="mt-3 flex flex-wrap gap-3">
                {[
                  { value: "" as const, label: "Kun denne gang" },
                  { value: 4 as const, label: "Hver 4. uge" },
                  { value: 6 as const, label: "Hver 6. uge" },
                  { value: 8 as const, label: "Hver 8. uge" },
                ].map((option) => (
                  <li key={String(option.value)}>
                    <button
                      type="button"
                      aria-pressed={repeatWeeks === option.value}
                      onClick={() => setRepeatWeeks(option.value)}
                      className={`inline-flex min-h-12 items-center rounded-lg border-2 px-5 py-3 text-lg font-semibold ${
                        repeatWeeks === option.value
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-surface hover:border-brand"
                      }`}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>

            <label className="mt-6 flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border-2 border-line p-4">
              <input
                type="checkbox"
                checked={smsDayBefore}
                onChange={(e) => setSmsDayBefore(e.target.checked)}
                className="mt-1 size-6 accent-[var(--color-accent)]"
              />
              <span>
                <span className="block font-bold">E-mail dagen før</span>
                <span className="text-ink-soft">
                  En påmindelse på e-mail, så ingen glemmer stolen.
                </span>
              </span>
            </label>

            <label htmlFor={`${formId}-note`} className="mt-5 block text-lg font-semibold">
              Er der noget, jeg skal vide? (frivilligt)
            </label>
            <p id={`${formId}-note-hjaelp`} className="text-ink-soft">
              Fx dørkode, hvilken etage du bor på, om der er elevator, eller om jeg skal ringe
              to gange på klokken.
            </p>
            <textarea
              id={`${formId}-note`}
              rows={4}
              maxLength={1000}
              value={customer.note}
              onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
              aria-describedby={`${formId}-note-hjaelp`}
              className={`${fieldClass} mt-2`}
            />

            <input
              type="text"
              name="firmanavn"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
          </fieldset>
          <StepActions onBack={() => goToStep(3)} onNext={tryAdvance} nextLabel="Godkend" />
        </StepBox>
      )}

      {step === 5 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={5}
              title="Hvordan vil du betale?"
              hint={
                forRelative
                  ? "Faktura til dig, eller MobilePay nu — inden jeg kører."
                  : "Du betaler med MobilePay, når du booker. Pårørende kan få faktura."
              }
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              <li>
                <label
                  className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border-2 p-4 ${
                    payWhen === "now" ? "border-accent bg-brand-light" : "border-line bg-canvas"
                  }`}
                >
                  <input
                    type="radio"
                    name="betaling"
                    checked={payWhen === "now"}
                    onChange={() => setPayWhen("now")}
                    className="mt-1 size-6 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="block font-bold">MobilePay nu</span>
                    <span className="text-ink-soft">Tiden bekræftes, når beløbet er sendt — inden jeg kører.</span>
                  </span>
                </label>
              </li>
              <li>
                <label
                  className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border-2 p-4 ${
                    payWhen === "invoice" ? "border-accent bg-brand-light" : "border-line bg-canvas"
                  }`}
                >
                  <input
                    type="radio"
                    name="betaling"
                    checked={payWhen === "invoice"}
                    onChange={() => setPayWhen("invoice")}
                    className="mt-1 size-6 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="block font-bold">Faktura</span>
                    <span className="text-ink-soft">
                      Sendes til {customer.email || "din e-mail"} når du booker. Godt når du booker for andre.
                    </span>
                  </span>
                </label>
              </li>
            </ul>
          </fieldset>

          {quote?.withinServiceArea && (
            <p className="mt-6 flex justify-between gap-4 text-xl font-bold">
              <span>I alt</span>
              <span className="tabular-nums">{formatDkk(quote.total)}</span>
            </p>
          )}

          <div className="mt-8 rounded-card border border-line bg-canvas p-5">
            <h3 className="text-lg font-bold">Hav klar inden besøget</h3>
            <ul className="mt-3 space-y-2 text-ink-soft">
              {visitPrepChecklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          {errors.form && <FieldError>{errors.form}</FieldError>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="inline-flex min-h-14 items-center justify-center rounded-lg border-2 border-brand px-8 py-4 text-xl font-semibold text-brand hover:bg-brand-light"
            >
              Tilbage
            </button>
            <button
              type="submit"
              disabled={submitting || !time || !employeeId || !quote?.withinServiceArea}
              className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-lg bg-accent px-8 py-4 text-xl font-bold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink-soft disabled:opacity-60"
            >
              {submitting && <LoadingSpinner size="sm" />}
              <span>
                {submitting
                  ? "Sender …"
                  : payWhen === "now"
                    ? "Betal med MobilePay og book"
                    : "Book og send faktura"}
              </span>
            </button>
          </div>
          <p className="mt-3 text-center text-ink-soft">
            {payWhen === "now"
              ? "Du betaler nu med MobilePay — inden jeg kører."
              : "Jeg sender faktura til din e-mail."}{" "}
            Afbud mindst 24 timer før er gratis — ellers 100 kr. Er noget uklart, så ring på{" "}
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="font-semibold text-brand underline"
            >
              {phone}
            </a>
            .
          </p>
        </StepBox>
      )}
    </form>
  );
}

/** Viser hvor langt kunden er nået. Tidligere trin kan åbnes igen. */
function StepIndicator({
  steps,
  current,
  onSelect,
}: {
  steps: string[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2">
      {steps.map((step, index) => {
        const done = index + 1 < current;
        const active = index + 1 === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(index)}
              disabled={index + 1 > current}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span
                aria-hidden="true"
                className={`grid size-8 place-items-center rounded-full text-base font-bold ${
                  done || active ? "bg-accent text-white" : "bg-muted text-ink-soft"
                }`}
              >
                {done ? <CheckIcon className="size-4" /> : index + 1}
              </span>
              <span className={done || active ? "font-semibold" : "text-ink-soft"}>
                {step}
                {done && <span className="sr-only"> (udfyldt)</span>}
                {active && <span className="sr-only"> (nuværende trin)</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function CheckIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
