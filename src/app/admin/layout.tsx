import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isLoggedIn } from "./actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return <div className="min-h-full bg-canvas">{children}</div>;
  }

  return (
    <div className="flex min-h-full flex-col bg-canvas md:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</div>
    </div>
  );
}
