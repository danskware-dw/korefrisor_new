import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { SeoBody } from "@/components/SeoBody";
import { ServiceGrid } from "@/components/ServiceGrid";
import { behandlingerSeo } from "@/content/seo";
import { formatDkk } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo-meta";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = pageMetadata(behandlingerSeo, "/behandlinger");

export default async function BehandlingerPage() {
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">{behandlingerSeo.h1}</h1>
      <SeoBody paragraphs={behandlingerSeo.paragraphs} />

      <div className="mt-12">
        <ServiceGrid services={config.services} phone={config.phone} />
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {config.services
          .filter((s) => !s.contactOnly && !s.addon)
          .map((service) => (
            <li key={service.id}>
              <Link
                href={`/behandlinger/${service.id}`}
                className="flex min-h-14 items-center justify-between rounded-card border border-line bg-surface px-5 font-semibold hover:border-brand"
              >
                {service.name}
                <span className="font-normal text-ink-soft tabular-nums">
                  {formatDkk(service.price)}
                </span>
              </Link>
            </li>
          ))}
      </ul>

      <FaqList items={behandlingerSeo.faq} />

      <p className="mt-12">
        <Link
          href="/book"
          data-btn
          className="inline-flex items-center rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
        >
          Book en tid
        </Link>
      </p>
    </div>
  );
}
