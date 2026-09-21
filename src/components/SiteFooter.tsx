import Link from "next/link";
import { isPlaceholderEmail, isPlaceholderPhone } from "@/lib/placeholders";
import { getConfig } from "@/lib/runtime-config";

const weekdayNames: Record<number, string> = {
  1: "Mandag",
  2: "Tirsdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lørdag",
  0: "Søndag",
};

export async function SiteFooter() {
  const config = await getConfig();
  const tel = config.phone.replace(/\s/g, "");
  const showPhone = !isPlaceholderPhone(config.phone);
  const showEmail = !isPlaceholderEmail(config.email);

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:grid-cols-3">
        <div>
          <h2 className="text-xl font-bold">Kontakt</h2>
          <p className="mt-3">
            {showPhone && (
              <>
                <a href={`tel:${tel}`} className="text-lg font-semibold text-brand underline">
                  {config.phone}
                </a>
                <br />
              </>
            )}
            {showEmail && (
              <a href={`mailto:${config.email}`} className="underline">
                {config.email}
              </a>
            )}
            {!showPhone && !showEmail && (
              <Link href="/book" className="text-lg font-semibold text-brand underline">
                Book en tid
              </Link>
            )}
          </p>
          <p className="mt-3 text-ink-soft">
            Jeg kører ud fra {config.home.postalCode} {config.home.city}.
            {config.cvr ? ` CVR ${config.cvr}.` : ""}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">Åbningstider</h2>
          <ul className="mt-3 space-y-1">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
              const hours = config.openingHours[day];
              return (
                <li key={day} className="flex justify-between gap-4">
                  <span>{weekdayNames[day]}</span>
                  <span className="tabular-nums text-ink-soft">
                    {hours ? `${hours.from}–${hours.to}` : "Lukket"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold">Genveje</h2>
          <ul className="mt-3 space-y-1">
            {[
              { href: "/book", label: "Book en tid" },
              { href: "/priser", label: "Priser" },
              { href: "/for-parorende", label: "For pårørende" },
              { href: "/om-mig", label: "Om mig" },
              { href: "/behandlinger", label: "Behandlinger" },
              { href: "/omraade", label: "Hvor jeg kører" },
              { href: "/kontakt", label: "Kontakt" },
              { href: "/privatliv", label: "Privatlivspolitik" },
              { href: "/betingelser", label: "Betingelser og afbud" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="border-t border-line px-4 py-5 text-center text-ink-soft">
        © {new Date().getFullYear()} {config.name}
      </p>
    </footer>
  );
}
