import type { Travel } from "@/config/types";
import { formatDkk } from "@/lib/pricing";

/**
 * Kørselstillæg efter afstand. Behandlingernes priser vises som kort,
 * se ServiceGrid — men zoner er tal, og tal hører i en tabel.
 */
export function TravelFeeTable({
  travel,
  city,
}: {
  travel: Travel;
  city: string;
}) {
  const { freeRadiusKm, zones, maxServiceRadiusKm } = travel;

  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">Kørselstillæg efter afstand fra {city}.</caption>
      <thead>
        <tr className="border-b-2 border-ink">
          <th scope="col" className="py-3 pr-4 font-semibold">
            Afstand fra {city}
          </th>
          <th scope="col" className="py-3 text-right font-semibold">
            Kørsel
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-line">
          <th scope="row" className="py-4 pr-4 font-normal tabular-nums">
            0–{freeRadiusKm} km
          </th>
          <td className="py-4 text-right font-bold text-accent">Gratis</td>
        </tr>
        {zones.map((zone) => (
          <tr key={zone.label} className="border-b border-line">
            <th scope="row" className="py-4 pr-4 font-normal tabular-nums">
              {zone.label}
            </th>
            <td className="py-4 text-right font-bold tabular-nums">{formatDkk(zone.fee)}</td>
          </tr>
        ))}
        <tr>
          <th scope="row" className="py-4 pr-4 font-normal tabular-nums">
            Over {maxServiceRadiusKm} km
          </th>
          <td className="py-4 text-right">Ring og spørg</td>
        </tr>
      </tbody>
    </table>
  );
}
