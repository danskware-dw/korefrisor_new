"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "./actions";

const links = [
  { href: "/admin", label: "Overblik" },
  { href: "/admin/bookinger", label: "Bookinger" },
  { href: "/admin/medarbejdere", label: "Medarbejdere" },
  { href: "/admin/kunder", label: "Kunder" },
  { href: "/admin/kalender", label: "Kalender" },
  { href: "/admin/behandlinger", label: "Behandlinger" },
  { href: "/admin/indstillinger", label: "Indstillinger" },
];

export function AdminNav() {
  const path = usePathname();

  return (
    <aside className="border-b border-line bg-surface md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-4 py-4 md:block">
        <p className="text-lg font-bold text-brand">Dashboard</p>
        <form action={logout} className="md:mt-3">
          <button type="submit" className="rounded-lg border-2 border-line px-4 py-2 font-semibold">
            Log ud
          </button>
        </form>
      </div>
      <nav aria-label="Dashboard">
        <ul className="flex flex-wrap gap-1 px-2 pb-3 md:flex-col md:px-3 md:pb-6">
          {links.map((link) => {
            const active =
              link.href === "/admin" ? path === link.href : path.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-flex min-h-12 items-center rounded-lg px-4 font-semibold ${
                    active ? "bg-brand text-white" : "hover:bg-brand-light"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
