"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Employee } from "@/config/types";
import {
  CARE_HOME_MAX_RESIDENTS,
  CARE_HOME_MIN_RESIDENTS,
  FAMILY_EXTRA_PERSON_DISCOUNT_KR,
  formatDkk,
  type Quote,
} from "@/lib/pricing";
import { RouteMap } from "@/components/map/TravelMap";
import { QuoteBreakdown } from "@/components/QuoteBreakdown";
import { EmployeeChoice } from "@/components/EmployeeChoice";
import {
  FieldError,
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
  weekdayNameDa,
} from "@/components/booking-ui";
import type { AddressSuggestion } from "@/app/api/adresser/route";

type Slot = { time: string; startUtc: string; endUtc: string };
type RouteInfo = { geometry: [number, number][]; source: "rute" | "estimat" };
type Step = 1 | 2 | 3 | 4;

export function CareHomeForm({
  employees,
  phone,
  maxAdvanceDays,
  home,
}: {
  employees: Employee[];
  phone: string;
  maxAdvanceDays: number;
  home: { lat: number; lon: number; city: string; postalCode: string };
}) {
  const formId = useId();
  const [step, setStep] = useState<Step>(1);
  const [employeeId, setEmployeeId] = useState(() =>
    employees.length === 1 ? employees[0].id : "",
  );
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [address, setAddress] = useState<AddressSuggestion | null>(null);
  const [facilityName, setFacilityName] = useState("");
  const [residents, setResidents] = useState(4);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState("");
  const [failed, setFailed] = useState({ quote: false, slots: false });
  const [contact, setContact] = useState({ name: "", phone: "", email: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [smsDayBefore, setSmsDayBefore] = useState(true);
  const [confirmed, setConfirmed] = useState<{
    start: string;
    cancelToken: string;
  } | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);
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
  const duration = quote?.durationMinutes ?? 0;
  const quoteLoading = Boolean(address) && !quote && !failed.quote;
  const slotsLoading = Boolean(date) && duration > 0 && slots === null && !failed.slots;

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
        /* forslag er ikke kritiske */
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [addressQuery, address]);

  useEffect(() => {
    if (!address || !employeeId) return;
    const controller = new AbortController();
    fetch("/api/tilbud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "plejehjem",
        residents,
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
        if (!controller.signal.aborted) setFailed((f) => ({ ...f, quote: true }));
      });
    return () => controller.abort();
  }, [address, employeeId, residents]);

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
        if (!controller.signal.aborted) setFailed((f) => ({ ...f, slots: true }));
      });
    return () => controller.abort();
  }, [date, duration, employeeId, address]);

  useEffect(() => {
    if (confirmed) confirmationRef.current?.focus();
  }, [confirmed]);

  function resetQuote() {
    setQuote(null);
    setRoute(null);
    setSlots(null);
    setTime("");
    setFailed({ quote: false, slots: false });
  }

  function goToStep(next: Step) {
    setErrors({});
    setStep(next);
  }

  function tryAdvance() {
    const nextErrors: Record<string, string> = {};
    if (step === 1 && !employeeId) nextErrors.employeeId = "Vælg hvem der skal komme.";
    if (step === 1 && !address) nextErrors.address = "Vælg adressen fra listen.";
    if (step === 2 && (residents < CARE_HOME_MIN_RESIDENTS || residents > CARE_HOME_MAX_RESIDENTS)) {
      nextErrors.residents = `Antal mellem ${CARE_HOME_MIN_RESIDENTS} og ${CARE_HOME_MAX_RESIDENTS}.`;
    }
    if (step === 2 && address && quote && !quote.withinServiceArea) {
      nextErrors.address = "Adressen ligger uden for mit område. Ring, så finder vi en løsning.";
    }
    if (step === 2 && address && !quote && !failed.quote) return;
    if (step === 3 && !date) nextErrors.date = "Vælg en dato.";
    if (step === 3 && !time) nextErrors.time = "Vælg et tidspunkt.";
    if (step === 4) {
      if (contact.name.trim().length < 2) nextErrors.name = "Skriv dit navn.";
      if (!isDanishPhone(contact.phone)) nextErrors.phone = "Skriv et dansk telefonnummer.";
      if (!isEmail(contact.email)) nextErrors.email = "Skriv en gyldig e-mail.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (step < 4) goToStep((step + 1) as Step);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== 4) {
      tryAdvance();
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/bookinger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "plejehjem",
          employeeId,
          residents,
          facilityName,
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
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          note: contact.note,
          payWhen: "invoice",
          repeatWeeks: 1,
          smsDayBefore,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        booking?: { start: string; cancelToken: string };
        errors?: Record<string, string>;
        error?: string;
      };
      if (!response.ok) {
        setErrors(data.errors ?? { form: data.error ?? "Noget gik galt." });
        return;
      }
      setConfirmed({
        start: data.booking?.start ?? "",
        cancelToken: data.booking?.cancelToken ?? "",
      });
    } catch {
      setErrors({ form: `Kunne ikke sendes. Ring på ${phone}.` });
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="scroll-mt-28 rounded-card border-2 border-accent bg-surface p-8"
      >
        <h2 className="text-3xl font-bold">Besøget er booket</h2>
        <p className="mt-4 text-lg">
          Tak, {contact.name.split(" ")[0]}. Jeg kommer{" "}
          <strong>
            {confirmed.start
              ? new Intl.DateTimeFormat("da-DK", {
                  timeZone: "Europe/Copenhagen",
                  dateStyle: "full",
                  timeStyle: "short",
                }).format(new Date(confirmed.start))
              : "på den aftalte dag"}
          </strong>{" "}
          og klipper {residents} beboere. Kørsel tælles kun én gang.
        </p>
        <p className="mt-4 text-lg">
          Fast tid samme ugedag fremover. E-mail dagen før til {contact.email}. Faktura til{" "}
          {contact.email}.
        </p>
        {confirmed.cancelToken && (
          <p className="mt-4 text-lg">
            <a href={`/aflys/${confirmed.cancelToken}`} className="font-semibold text-brand underline">
              Aflys her
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div ref={formTopRef} className="scroll-mt-28" />

      {step === 1 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={1}
              title="Hvor skal jeg komme?"
              hint="Plejehjem, bosted eller ældrebolig. Vælg adressen fra listen."
            />
            {employees.length > 1 && (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                {employees.map((employee) => (
                  <li key={employee.id}>
                    <EmployeeChoice
                      employee={employee}
                      selected={employeeId === employee.id}
                      onSelect={() => {
                        setEmployeeId(employee.id);
                        resetQuote();
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
            <TextField
              id={`${formId}-sted`}
              label="Navn på sted (frivilligt)"
              value={facilityName}
              onChange={setFacilityName}
            />
            <label htmlFor={`${formId}-adresse`} className="mt-5 block text-lg font-semibold">
              Adresse
            </label>
            <input
              id={`${formId}-adresse`}
              type="text"
              value={address ? address.text : addressQuery}
              onChange={(e) => {
                setAddress(null);
                setSuggestions([]);
                setAddressQuery(e.target.value);
                resetQuote();
              }}
              placeholder="Fx Kastrupvej 12, 2770 Kastrup"
              className={`${fieldClass} mt-2`}
            />
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
            {errors.employeeId && <FieldError>{errors.employeeId}</FieldError>}
            {errors.address && <FieldError>{errors.address}</FieldError>}
          </fieldset>
          <StepActions onNext={tryAdvance} nextLabel="Godkend" nextDisabled={!address || !employeeId} />
        </StepBox>
      )}

      {step === 2 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={2}
              title="Hvor mange skal klippes?"
              hint={`Pensionistklip til hver. ${formatDkk(FAMILY_EXTRA_PERSON_DISCOUNT_KR)} rabat pr. ekstra person. Kørsel kun én gang.`}
            />
            <label htmlFor={`${formId}-antal`} className="mt-6 block text-lg font-semibold">
              Antal beboere
            </label>
            <input
              id={`${formId}-antal`}
              type="number"
              min={CARE_HOME_MIN_RESIDENTS}
              max={CARE_HOME_MAX_RESIDENTS}
              value={residents}
              onChange={(e) => {
                setResidents(Number(e.target.value));
                resetQuote();
              }}
              className={`${fieldClass} mt-2 sm:max-w-xs`}
            />
            {errors.residents && <FieldError>{errors.residents}</FieldError>}
          </fieldset>
          <div aria-live="polite" className="mt-6">
            {quoteLoading && <p className="text-ink-soft">Regner pris ud …</p>}
            {quote && address && !quoteLoading && quote.withinServiceArea && (
              <section className="overflow-hidden rounded-card border-2 border-brand bg-canvas">
                <h2 className="border-b border-line bg-brand-light px-6 py-4 text-2xl font-bold">
                  Samlet pris
                </h2>
                <div className="p-6">
                  <QuoteBreakdown quote={quote} employeeName={selectedEmployee?.name} />
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
            {quote && !quote.withinServiceArea && (
              <FieldError>Adressen ligger uden for mit område. Ring på {phone}.</FieldError>
            )}
          </div>
          <StepActions
            onBack={() => goToStep(1)}
            onNext={tryAdvance}
            nextLabel="Godkend"
            nextDisabled={!quote?.withinServiceArea}
          />
        </StepBox>
      )}

      {step === 3 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={3}
              title="Hvilken ugedag?"
              hint="Jeg kommer samme ugedag fremover. Vælg første dag og et tidspunkt."
            />
            <label htmlFor={`${formId}-dato`} className="mt-6 block text-lg font-semibold">
              Første dag
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
            {date && (
              <p className="mt-2 text-ink-soft">
                Fast {weekdayNameDa(new Date(`${date}T12:00:00Z`).getUTCDay())} fremover.
              </p>
            )}
            {errors.date && <FieldError>{errors.date}</FieldError>}
            <div aria-live="polite" className="mt-6">
              {slotsLoading && <p className="text-ink-soft">Finder ledige tider …</p>}
              {date && slots?.length === 0 && (
                <p className="text-lg">
                  Der er ikke plads til {residents} beboere {danishDate(date)}. Prøv en anden
                  dag, færre beboere, eller ring.
                </p>
              )}
              {slots && slots.length > 0 && (
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
              )}
            </div>
            {errors.time && <FieldError>{errors.time}</FieldError>}
          </fieldset>
          <StepActions onBack={() => goToStep(2)} onNext={tryAdvance} nextLabel="Godkend" nextDisabled={!time} />
        </StepBox>
      )}

      {step === 4 && (
        <StepBox>
          <fieldset>
            <StepHeading
              step={4}
              title="Faktura og kontakt"
              hint="Én faktura til stedet eller pårørende. E-mail dagen før til dig."
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <TextField
                id={`${formId}-navn`}
                label="Dit navn"
                value={contact.name}
                onChange={(v) => setContact({ ...contact, name: v })}
                error={errors.name}
              />
              <TextField
                id={`${formId}-telefon`}
                label="Telefon"
                type="tel"
                value={contact.phone}
                onChange={(v) => setContact({ ...contact, phone: v })}
                error={errors.phone}
              />
            </div>
            <div className="mt-5">
              <TextField
                id={`${formId}-email`}
                label="E-mail til faktura"
                type="email"
                value={contact.email}
                onChange={(v) => setContact({ ...contact, email: v })}
                error={errors.email}
              />
            </div>
            <p className="mt-6 rounded-lg border-2 border-accent bg-brand-light p-4 text-lg">
              <strong>Én faktura</strong>
              <span className="mt-1 block text-ink-soft">
                Sendes til din e-mail, når du booker — inden jeg kører.
              </span>
            </p>
            <label className="mt-4 flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border-2 border-line p-4">
              <input
                type="checkbox"
                checked={smsDayBefore}
                onChange={(e) => setSmsDayBefore(e.target.checked)}
                className="mt-1 size-6 accent-[var(--color-accent)]"
              />
              <span className="font-bold">E-mail dagen før</span>
            </label>
          </fieldset>
          {quote && (
            <p className="mt-6 flex justify-between gap-4 text-xl font-bold">
              <span>I alt</span>
              <span className="tabular-nums">{formatDkk(quote.total)}</span>
            </p>
          )}
          {errors.form && <FieldError>{errors.form}</FieldError>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="inline-flex min-h-14 items-center justify-center rounded-lg border-2 border-brand px-8 py-4 text-xl font-semibold text-brand hover:bg-brand-light"
            >
              Tilbage
            </button>
            <button
              type="submit"
              disabled={submitting || !quote?.withinServiceArea}
              className="inline-flex min-h-14 flex-1 items-center justify-center rounded-lg bg-accent px-8 py-4 text-xl font-bold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {submitting ? "Sender …" : "Book plejehjemsbesøg"}
            </button>
          </div>
        </StepBox>
      )}
    </form>
  );
}
