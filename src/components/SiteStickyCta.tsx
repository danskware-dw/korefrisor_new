import Link from "next/link";
import { isPlaceholderPhone } from "@/lib/placeholders";
import { getConfig } from "@/lib/runtime-config";

/** Fast bundlinje på mobil: Book + Ring. Skjules på booking-sider. */
export async function SiteStickyCta() {
  const config = await getConfig();
  const tel = config.phone.replace(/\s/g, "");
  const showPhone = !isPlaceholderPhone(config.phone);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-5xl gap-3">
        <Link
          href="/book"
          data-btn
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 font-bold text-white hover:bg-accent-dark"
        >
          Book hjemmeklip
        </Link>
        {showPhone ? (
          <a
            href={`tel:${tel}`}
            data-btn
            className="inline-flex items-center justify-center rounded-xl border-2 border-brand px-4 py-3 font-bold text-brand hover:bg-brand-light"
          >
            Ring
          </a>
        ) : (
          <Link
            href="/priser"
            data-btn
            className="inline-flex items-center justify-center rounded-xl border border-line px-4 py-3 font-bold text-brand hover:bg-brand-light"
          >
            Pris
          </Link>
        )}
      </div>
    </div>
  );
}
