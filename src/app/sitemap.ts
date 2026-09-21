import type { MetadataRoute } from "next";
import { business } from "@/config/business";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    { path: "", priority: 1 },
    { path: "/book", priority: 0.9 },
    { path: "/book/plejehjem", priority: 0.8 },
    { path: "/behandlinger", priority: 0.9 },
    { path: "/for-parorende", priority: 0.85 },
    { path: "/gavekort", priority: 0.8 },
    { path: "/bliv-frisor", priority: 0.6 },
    { path: "/priser", priority: 0.8 },
    { path: "/saadan-foregaar-det", priority: 0.75 },
    { path: "/omraade", priority: 0.7 },
    { path: "/om-mig", priority: 0.6 },
    { path: "/frisorer", priority: 0.65 },
    { path: "/kontakt", priority: 0.6 },
    { path: "/privatliv", priority: 0.2 },
    { path: "/betingelser", priority: 0.2 },
    { path: "/llms.txt", priority: 0.3 },
    { path: "/llms-full.txt", priority: 0.3 },
  ];

  const now = new Date();
  const servicePages = business.services.map((service) => ({
    url: `${business.siteUrl}/behandlinger/${service.id}`,
    lastModified: now,
    priority: service.contactOnly ? 0.7 : service.addon ? 0.6 : 0.85,
  }));

  return [
    ...staticPaths.map((entry) => ({
      url: `${business.siteUrl}${entry.path}`,
      lastModified: now,
      priority: entry.priority,
    })),
    ...servicePages,
    ...business.employees
      .filter((employee) => employee.active)
      .map((employee) => ({
        url: `${business.siteUrl}/frisorer/${employee.id}`,
        lastModified: now,
        priority: 0.65,
      })),
    ...business.areas.map((area) => ({
      url: `${business.siteUrl}/frisor/${area.slug}`,
      lastModified: now,
      priority: 0.7,
    })),
  ];
}
