"use client";

export const fieldClass =
  "w-full rounded-lg border-2 border-line bg-surface px-4 py-3 text-lg focus:border-brand";

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function isDanishPhone(value: string): boolean {
  return /^(\+45)?\s?(\d\s?){8}$/.test(value.trim());
}

export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(
    new Date(),
  );
}

export function isoPlusDays(days: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(
    new Date(Date.now() + days * 86_400_000),
  );
}

export function danishDate(dateIso: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateIso}T12:00:00Z`));
}

export function weekdayNameDa(weekday: number): string {
  return ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"][weekday] ?? "";
}

export function StepBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border-2 border-line bg-surface p-6 sm:p-8">{children}</div>
  );
}

export function StepActions({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-14 items-center justify-center rounded-lg border-2 border-brand px-8 py-4 text-xl font-semibold text-brand hover:bg-brand-light"
        >
          Tilbage
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex min-h-14 flex-1 items-center justify-center rounded-lg bg-accent px-8 py-4 text-xl font-bold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink-soft disabled:opacity-60"
      >
        {nextLabel}
      </button>
    </div>
  );
}

export function StepHeading({
  step,
  title,
  hint,
}: {
  step: number;
  title: string;
  hint?: string;
}) {
  return (
    <>
      <legend className="text-2xl font-bold sm:text-3xl">
        <span className="text-brand">{step}.</span> {title}
      </legend>
      {hint && <p className="mt-2 text-ink-soft">{hint}</p>}
    </>
  );
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-3 rounded-lg border border-[#DC2626] bg-[#FEF2F2] px-4 py-3 font-semibold text-[#991B1B]"
    >
      {children}
    </p>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hjaelp`} className="text-ink-soft">
          {hint}
        </p>
      )}
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hjaelp` : undefined}
        aria-invalid={error ? true : undefined}
        className={`${fieldClass} mt-2`}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
