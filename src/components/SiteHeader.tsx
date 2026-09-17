import Link from "next/link";
import { getConfig } from "@/lib/runtime-config";

const navigation = [
  { href: "/behandlinger", label: "Behandlinger" },
  { href: "/priser", label: "Priser" },
  { href: "/saadan-foregaar-det", label: "Sådan foregår det" },
  { href: "/omraade", label: "Hvor jeg kører" },
  { href: "/for-parorende", label: "For pårørende" },
  { href: "/om-mig", label: "Om mig" },
];

export async function SiteHeader() {
  const config = await getConfig();
  const tel = config.phone.replace(/\s/g, "");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="mr-auto flex items-center gap-3">
          <ScissorsMark />
          <span className="text-xl font-bold leading-tight text-brand">
            {config.name}
            <span className="block text-base font-normal text-ink-soft">{config.tagline}</span>
          </span>
        </Link>

        <a
          href={`tel:${tel}`}
          data-btn
          className="inline-flex items-center gap-2 rounded-lg px-4 py-3 font-semibold text-brand hover:bg-brand-light"
        >
          <PhoneIcon />
          {config.phone}
        </a>
        <Link
          href="/book"
          data-btn
          className="inline-flex items-center rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dark"
        >
          Book tid
        </Link>
      </div>

      <nav aria-label="Hovedmenu" className="border-t border-line">
        <ul className="mx-auto flex max-w-5xl flex-wrap gap-x-6 px-4">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex min-h-12 items-center font-medium underline-offset-4 hover:text-brand hover:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function ScissorsMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
      >
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
      </svg>
    </span>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
