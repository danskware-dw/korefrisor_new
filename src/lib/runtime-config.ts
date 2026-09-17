import { promises as fs } from "node:fs";
import path from "node:path";
import { business } from "@/config/business";
import type { AppConfig, DayHours, Employee, Service, Vacation } from "@/config/types";
import { readyAppSql } from "@/lib/db/client";
import type { Sql } from "postgres";

const FILE = path.join(process.cwd(), "data", "settings.json");

export type ConfigOverlay = Partial<
  Pick<
    AppConfig,
    | "name"
    | "tagline"
    | "ownerName"
    | "yearsOfExperience"
    | "phone"
    | "email"
    | "mobilePay"
    | "cvr"
    | "home"
    | "openingHours"
    | "bufferMinutes"
    | "minNoticeHours"
    | "maxAdvanceDays"
    | "blockedDates"
    | "vacations"
    | "employees"
    | "travel"
    | "services"
    | "siteUrl"
  >
>;

/** Fylder foto og udgangspunkt på, hvis ældre indstillinger mangler dem. */
export function normalizeEmployee(
  employee: Partial<Employee> & { id: string; name: string },
  home = business.home,
): Employee {
  return {
    id: employee.id,
    name: employee.name,
    role: employee.role?.trim() || "Frisør",
    image: employee.image || "/behandlinger/hjemmebesoeg.png",
    imageAlt: employee.imageAlt || `${employee.name}, frisør`,
    active: employee.active !== false,
    bio: employee.bio,
    qualifications: employee.qualifications,
    exampleImages: employee.exampleImages,
    base: {
      street: employee.base?.street ?? home.street,
      postalCode: employee.base?.postalCode ?? home.postalCode,
      city: employee.base?.city ?? home.city,
      lat: employee.base?.lat ?? home.lat,
      lon: employee.base?.lon ?? home.lon,
    },
  };
}

async function readFileOverlay(): Promise<ConfigOverlay> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as ConfigOverlay;
  } catch {
    return {};
  }
}

async function writeFileOverlay(overlay: ConfigOverlay): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(overlay, null, 2), "utf8");
}

async function writeSqlOverlay(sql: Sql, overlay: ConfigOverlay): Promise<void> {
  await sql`
    INSERT INTO settings (id, overlay)
    VALUES ('default', ${sql.json(overlay as never)})
    ON CONFLICT (id) DO UPDATE SET overlay = EXCLUDED.overlay
  `;
}

async function readOverlay(): Promise<ConfigOverlay> {
  const sql = await readyAppSql();
  if (sql) {
    const rows = await sql<{ overlay: ConfigOverlay }[]>`
      SELECT overlay FROM settings WHERE id = 'default' LIMIT 1
    `;
    if (rows[0]?.overlay) return rows[0].overlay;
    const file = await readFileOverlay();
    if (Object.keys(file).length > 0) await writeSqlOverlay(sql, file);
    return file;
  }
  return readFileOverlay();
}

async function writeOverlay(overlay: ConfigOverlay): Promise<void> {
  const sql = await readyAppSql();
  if (sql) {
    await writeSqlOverlay(sql, overlay);
    return;
  }
  await writeFileOverlay(overlay);
}

function mergeServices(overlay?: Service[]): Service[] {
  if (!overlay) return business.services;
  const ids = new Set(overlay.map((service) => service.id));
  const missing = business.services.filter((service) => !ids.has(service.id));
  return [...overlay, ...missing];
}

/** Den konfiguration hjemmesiden og dashboardet bruger lige nu. */
export async function getConfig(): Promise<AppConfig> {
  const overlay = await readOverlay();
  const home = { ...business.home, ...overlay.home };
  const rawEmployees = overlay.employees ?? business.employees;
  return {
    ...business,
    ...overlay,
    home,
    travel: { ...business.travel, ...overlay.travel },
    openingHours: { ...business.openingHours, ...overlay.openingHours },
    services: mergeServices(overlay.services),
    vacations: overlay.vacations ?? business.vacations,
    employees: rawEmployees.map((employee) => normalizeEmployee(employee, home)),
    blockedDates: overlay.blockedDates ?? business.blockedDates,
  };
}

export async function saveConfig(patch: ConfigOverlay): Promise<AppConfig> {
  const current = await readOverlay();
  const next = { ...current, ...patch };
  if (patch.home) next.home = { ...business.home, ...current.home, ...patch.home };
  if (patch.travel) next.travel = { ...business.travel, ...current.travel, ...patch.travel };
  await writeOverlay(next);
  return getConfig();
}

export async function saveServices(services: Service[]): Promise<void> {
  await saveConfig({ services });
}

export async function saveHours(
  openingHours: Record<number, DayHours>,
  extra?: { bufferMinutes?: number; minNoticeHours?: number; maxAdvanceDays?: number },
): Promise<void> {
  await saveConfig({ openingHours, ...extra });
}

export async function saveVacations(vacations: Vacation[]): Promise<void> {
  await saveConfig({ vacations });
}

export async function saveEmployees(employees: Employee[]): Promise<void> {
  await saveConfig({ employees });
}

export function isOnVacation(config: AppConfig, dateIso: string): boolean {
  return config.vacations.some((v) => dateIso >= v.from && dateIso <= v.to);
}

export function bookableServicesOf(config: AppConfig): Service[] {
  return config.services.filter((s) => !s.contactOnly);
}
