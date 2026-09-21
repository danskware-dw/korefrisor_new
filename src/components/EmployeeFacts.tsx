import type { ReactNode } from "react";
import type { Employee, Service, Travel } from "@/config/types";
import {
  employeeServices,
  genderLabel,
  hasPublicReviews,
  travelCoverageLabel,
  travelZoneLines,
} from "@/lib/employees";

type Props = {
  employee: Employee;
  travel: Travel;
  areaNames: string[];
  services: Service[];
  compact?: boolean;
};

export function EmployeeFacts({
  employee,
  travel,
  areaNames,
  services,
  compact = false,
}: Props) {
  const gender = genderLabel(employee.gender);
  const offered = employeeServices(employee, services);
  const primary = offered.filter((service) => !service.addon);
  const addons = offered.filter((service) => service.addon);
  const names = primary.map((service) => service.name).join(", ");
  const rated = hasPublicReviews(employee);
  const areas =
    compact && areaNames.length > 4
      ? `${areaNames.slice(0, 4).join(", ")} m.fl.`
      : areaNames.join(", ");

  if (compact) {
    return (
      <div className="mt-3 space-y-3">
        <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
          {gender && <Chip>{gender}</Chip>}
          <Chip>{travelCoverageLabel(travel, employee.base.city)}</Chip>
          <Chip>{areas}</Chip>
        </ul>
        {names && <p className="text-base text-ink-soft">{names}</p>}
        <p className="text-base text-ink-soft">
          Tiden til døren vises, når du skriver din adresse.
        </p>
        <StarRating
          average={rated ? employee.rating!.average : 0}
          count={rated ? employee.rating!.count : 0}
        />
      </div>
    );
  }

  return (
    <dl className="mt-8 space-y-5 text-lg">
      {gender && <Fact label="Køn">{gender}</Fact>}
      <Fact label="Kørsel">
        {travelCoverageLabel(travel, employee.base.city)}
        <ul className="mt-2 space-y-1 text-ink-soft">
          {travelZoneLines(travel).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Fact>
      <Fact label="Dækker">{areas}</Fact>
      <Fact label="Behandlinger">
        {[
          names,
          addons.length ? `Tillæg: ${addons.map((service) => service.name).join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(". ")}
      </Fact>
      <Fact label="Anmeldelser">
        <StarRating
          average={rated ? employee.rating!.average : 0}
          count={rated ? employee.rating!.count : 0}
        />
      </Fact>
    </dl>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-ink">
      {children}
    </li>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-line pb-4 last:border-0 last:pb-0">
      <dt className="font-semibold text-ink">{label}</dt>
      <dd className="text-ink-soft">{children}</dd>
    </div>
  );
}

function StarRating({ average, count }: { average: number; count: number }) {
  const rounded = count === 0 ? 0 : Math.round(average);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span aria-hidden="true" className="inline-flex">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon key={index} filled={index < rounded} />
        ))}
      </span>
      <span>
        {count === 0
          ? "Ingen anmeldelser endnu"
          : `${average.toFixed(1)} · ${count} ${count === 1 ? "anmeldelse" : "anmeldelser"}`}
      </span>
    </span>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`size-5 ${filled ? "text-accent" : "text-line"}`}
      fill="currentColor"
    >
      <path d="M10 1.5 12.5 7l6 .9-4.3 4.2 1 5.9L10 15.2 4.8 18l1-5.9L1.5 7.9 7.5 7 10 1.5Z" />
    </svg>
  );
}
