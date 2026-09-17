import type { Metadata } from "next";
import { listCustomers } from "@/lib/store";
import { formatDkk } from "@/lib/pricing";
import { requireAdmin } from "../actions";
import { formatDay } from "../BookingCard";

export const metadata: Metadata = { title: "Kunder" };

export default async function KunderPage() {
  await requireAdmin();
  const customers = await listCustomers();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">Kunder</h1>
      <p className="mt-2 text-ink-soft">
        {customers.length} {customers.length === 1 ? "kunde" : "kunder"} i alt. Listen
        bygges automatisk ud fra bookingerne.
      </p>

      {customers.length === 0 ? (
        <p className="mt-8 text-ink-soft">Ingen kunder endnu.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="px-4 py-3">Navn</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3 text-right">Besøg</th>
                <th className="px-4 py-3 text-right">Sidst</th>
                <th className="px-4 py-3 text-right">Omsætning</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.key} className="border-b border-line">
                  <td className="px-4 py-3 font-semibold">{customer.name}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${customer.phone}`} className="underline">
                      {customer.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${customer.email}`} className="underline">
                      {customer.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{customer.bookings}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatDay(customer.lastVisit)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatDkk(customer.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
