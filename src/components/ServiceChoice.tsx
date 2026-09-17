"use client";

import Image from "next/image";
import { formatDkk, formatDuration } from "@/lib/pricing";

type Props = {
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    image: string;
    imageAlt: string;
  };
  checked: boolean;
  onToggle: () => void;
};

/**
 * Behandlingskort man kan vælge i bookingen.
 * Selve valget er et rigtigt afkrydsningsfelt, så det virker med tastatur
 * og skærmlæser — kortet er blot den synlige del.
 */
export function ServiceChoice({ service, checked, onToggle }: Props) {
  return (
    <label
      className={`flex h-full cursor-pointer flex-col overflow-hidden rounded-card border-2 bg-surface ${
        checked ? "border-accent" : "border-line hover:border-brand"
      }`}
    >
      <span className="relative block">
        <Image
          src={service.image}
          alt={service.imageAlt}
          width={1024}
          height={768}
          sizes="(min-width: 640px) 45vw, 92vw"
          className="aspect-4/3 w-full object-cover"
        />
        <span
          aria-hidden="true"
          className={`absolute right-3 top-3 grid size-10 place-items-center rounded-full border-2 ${
            checked
              ? "border-accent bg-accent text-white"
              : "border-line bg-surface/90 text-transparent"
          }`}
        >
          <CheckIcon />
        </span>
      </span>

      <span className="flex flex-1 items-start gap-4 p-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 size-6 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="flex-1">
          <span className="block text-lg font-bold">{service.name}</span>
          <span className="block text-ink-soft">{service.description}</span>
          <span className="mt-2 block font-semibold tabular-nums">
            {formatDkk(service.price)}
            <span className="font-normal text-ink-soft">
              {" "}
              · {formatDuration(service.durationMinutes)}
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
