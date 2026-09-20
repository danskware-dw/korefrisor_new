import type { Metadata } from "next";
import { business } from "@/config/business";
import type { PageSeo } from "@/content/seo";

export function pageMetadata(
  seo: PageSeo,
  path: string,
  ogImage = "/behandlinger/hjemmebesoeg.png",
): Metadata {
  const title = `${seo.title} | ${business.name}`;
  return {
    title: { absolute: title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: seo.description,
      images: [{ url: ogImage }],
    },
  };
}
