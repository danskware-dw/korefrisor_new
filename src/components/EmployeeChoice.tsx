"use client";

import Image from "next/image";
import Link from "next/link";
import type { Employee, Service, Travel } from "@/config/types";
import { EmployeeFacts } from "@/components/EmployeeFacts";
import { formatEmployeeBase } from "@/lib/employees";

type Props = {
  employee: Employee;
  selected: boolean;
  onSelect: () => void;
  travel: Travel;
  areaNames: string[];
  services: Service[];
  onConfirm?: () => void;
  confirmDisabled?: boolean;
};

/**
 * Vælg-frisør-kort i bookingen: rundt foto, fakta og link til profil.
 */
export function EmployeeChoice({
  employee,
  selected,
  onSelect,
  travel,
  areaNames,
  services,
  onConfirm,
  confirmDisabled,
}: Props) {
  const address = formatEmployeeBase(employee.base);

  return (
    <div
      className={`flex h-full flex-col rounded-card border-2 bg-surface p-5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
        selected ? "border-accent" : "border-line hover:border-brand"
      }`}
    >
      <label className="flex flex-1 cursor-pointer flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <span className="relative shrink-0">
          <Image
            src={employee.image}
            alt={employee.imageAlt}
            width={160}
            height={160}
            sizes="160px"
            className="size-28 rounded-full border border-line object-cover"
          />
          <span
            aria-hidden="true"
            className={`absolute right-0 top-0 grid size-10 place-items-center rounded-full border-2 ${
              selected
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-transparent"
            }`}
          >
            <CheckIcon />
          </span>
        </span>

        <span className="mt-4 flex-1 sm:mt-0 sm:ml-5">
          <input
            type="radio"
            name="employee"
            checked={selected}
            onChange={onSelect}
            className="sr-only"
          />
          <span className="block text-lg font-bold">{employee.name}</span>
          <span className="block text-ink-soft">{employee.role}</span>
          <span className="mt-2 flex items-start justify-center gap-2 text-base text-ink-soft sm:justify-start">
            <PinIcon />
            <span>
              <span className="font-semibold text-ink">Kører fra </span>
              {address}
            </span>
          </span>
          <EmployeeFacts
            employee={employee}
            travel={travel}
            areaNames={areaNames}
            services={services}
            compact
          />
        </span>
      </label>
      <div className="mt-4 flex flex-col gap-3">
        <Link
          href={`/frisorer/${employee.id}`}
          className="text-lg font-semibold text-brand underline"
        >
          Se profil
        </Link>
        {selected && onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-accent px-6 py-3 text-xl font-bold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink-soft disabled:opacity-60"
          >
            Godkend
          </button>
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-5 shrink-0 text-brand"
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
