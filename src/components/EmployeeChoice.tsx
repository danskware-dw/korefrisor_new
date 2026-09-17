"use client";

import Image from "next/image";
import type { Employee } from "@/config/types";
import { formatEmployeeBase } from "@/lib/employees";

type Props = {
  employee: Employee;
  selected: boolean;
  onSelect: () => void;
};

/**
 * Vælg-frisør-kort i bookingen: foto, navn, rolle og hvor personen kører fra.
 */
export function EmployeeChoice({ employee, selected, onSelect }: Props) {
  const address = formatEmployeeBase(employee.base);

  return (
    <label
      className={`flex h-full cursor-pointer flex-col overflow-hidden rounded-card border-2 bg-surface ${
        selected ? "border-accent" : "border-line hover:border-brand"
      }`}
    >
      <span className="relative block">
        <Image
          src={employee.image}
          alt={employee.imageAlt}
          width={640}
          height={640}
          sizes="(min-width: 640px) 45vw, 92vw"
          className="aspect-square w-full object-cover"
        />
        <span
          aria-hidden="true"
          className={`absolute right-3 top-3 grid size-10 place-items-center rounded-full border-2 ${
            selected
              ? "border-accent bg-accent text-white"
              : "border-line bg-surface/90 text-transparent"
          }`}
        >
          <CheckIcon />
        </span>
      </span>

      <span className="flex flex-1 items-start gap-4 p-5">
        <input
          type="radio"
          name="employee"
          checked={selected}
          onChange={onSelect}
          className="mt-1 size-6 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="flex-1">
          <span className="block text-lg font-bold">{employee.name}</span>
          <span className="block text-ink-soft">{employee.role}</span>
          {employee.bio && (
            <span className="mt-2 block text-base text-ink">{employee.bio}</span>
          )}
          {employee.qualifications && employee.qualifications.length > 0 && (
            <span className="mt-2 block text-base text-ink-soft">
              {employee.qualifications.join(" · ")}
            </span>
          )}
          <span className="mt-3 flex items-start gap-2 text-base text-ink-soft">
            <PinIcon />
            <span>
              <span className="block font-semibold text-ink">Kører fra</span>
              {address}
            </span>
          </span>
        </span>
      </span>
    </label>
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
