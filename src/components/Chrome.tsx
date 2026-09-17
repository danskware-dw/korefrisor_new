"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Skjuler den offentlige header og footer på dashboardet. */
export function Chrome({
  header,
  footer,
  schema,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  schema: ReactNode;
  children: ReactNode;
}) {
  const path = usePathname();
  if (path.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#indhold"
        data-btn
        className="sr-only inline-flex items-center focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-5 focus:py-3 focus:text-white"
      >
        Gå til indhold
      </a>
      {header}
      <main id="indhold" className="flex-1">
        {children}
      </main>
      {footer}
      {schema}
    </>
  );
}
