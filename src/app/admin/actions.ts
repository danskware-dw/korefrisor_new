"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteBooking, getBooking, updateBooking, type Booking } from "@/lib/store";
import {
  getConfig,
  saveConfig,
  saveEmployees,
  saveHours,
  saveServices,
  saveVacations,
} from "@/lib/runtime-config";
import type { DayHours, Employee, Service, Vacation } from "@/config/types";

const COOKIE = "admin_adgang";

function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

export async function isLoggedIn(): Promise<boolean> {
  const password = adminPassword();
  if (!password) return false;
  return (await cookies()).get(COOKIE)?.value === password;
}

export async function requireAdmin(): Promise<void> {
  if (!(await isLoggedIn())) redirect("/admin");
}

export async function login(formData: FormData): Promise<void> {
  const password = adminPassword();
  const attempt = String(formData.get("kodeord") ?? "");

  if (password && attempt === password) {
    (await cookies()).set(COOKIE, password, {
      httpOnly: true,
      sameSite: "lax",
      // Kun HTTPS i rigtig drift (Vercel). Lokalt kører siden på http.
      secure: process.env.VERCEL === "1",
      maxAge: 60 * 60 * 12,
      path: "/",
    });
  }
  revalidatePath("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(COOKIE);
  revalidatePath("/admin");
  redirect("/admin");
}

function refresh(): void {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function setStatus(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as Booking["status"];
  const allowed: Booking["status"][] = [
    "afventer_betaling",
    "bekraeftet",
    "aflyst",
    "udfoert",
    "udeblevet",
    "udlobet",
  ];

  if (id && allowed.includes(status)) {
    const booking = await getBooking(id);
    if (!booking) return;

    const patch: Partial<Booking> = { status };
    if (status === "udfoert" && booking.payment.status === "afventer") {
      patch.payment = {
        ...booking.payment,
        status: "betalt",
        paidAt: new Date().toISOString(),
      };
    }

    await updateBooking(id, patch);
    refresh();
  }
}

export async function verifyManualPayment(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const booking = await getBooking(id);
  if (!booking) return;
  await updateBooking(id, {
    status: "bekraeftet",
    manualPaymentVerifiedAt: new Date().toISOString(),
    manualPaymentVerifiedBy: "admin",
    payment: {
      ...booking.payment,
      status: "betalt",
      capturedOre: Math.round(booking.payment.amountKr * 100),
      paidAt: new Date().toISOString(),
    },
  });
  refresh();
}

export async function markRefundDone(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const booking = await getBooking(id);
  if (!booking) return;
  await updateBooking(id, {
    refundPendingAt: undefined,
    payment: {
      ...booking.payment,
      status: "refunderet",
      refundedOre: booking.payment.capturedOre ?? Math.round(booking.payment.amountKr * 100),
    },
  });
  refresh();
}

export async function markBookingPaid(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const booking = await getBooking(id);
  if (!booking) return;
  await updateBooking(id, {
    status: "bekraeftet",
    payment: {
      ...booking.payment,
      status: "betalt",
      paidAt: new Date().toISOString(),
    },
  });
  refresh();
}

export async function removeBooking(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  if (id) await deleteBooking(id);
  refresh();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function serviceFromForm(formData: FormData, id: string): Service {
  const price = Number(formData.get("price") ?? 0);
  const durationMinutes = Number(formData.get("durationMinutes") ?? 45);
  return {
    id,
    name: String(formData.get("name") ?? "").trim() || "Klip",
    description: String(formData.get("description") ?? "").trim(),
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
    durationMinutes: Number.isFinite(durationMinutes)
        ? Math.min(240, Math.max(10, Math.round(durationMinutes)))
      : 45,
    image: String(formData.get("image") ?? "/behandlinger/klip.png"),
    imageAlt: String(formData.get("imageAlt") ?? "").trim() || "Klipning hjemme hos kunden.",
    contactOnly: formData.get("contactOnly") === "on",
    addon: formData.get("addon") === "on",
  };
}

export async function updateService(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  const config = await getConfig();
  const services = config.services.map((service) =>
    service.id === id ? serviceFromForm(formData, id) : service,
  );
  await saveServices(services);
  refresh();
}

export async function addService(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const config = await getConfig();
  let id = slugify(name) || `behandling-${Date.now()}`;
  if (config.services.some((s) => s.id === id)) id = `${id}-${Date.now()}`;
  await saveServices([...config.services, serviceFromForm(formData, id)]);
  refresh();
}

export async function removeService(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  const config = await getConfig();
  if (config.services.length <= 1) return;
  await saveServices(config.services.filter((service) => service.id !== id));
  refresh();
}

export async function saveInfo(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const years = Number(formData.get("yearsOfExperience") ?? 4);
  const lat = Number(formData.get("lat"));
  const lon = Number(formData.get("lon"));
  await saveConfig({
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    ownerName: String(formData.get("ownerName") ?? "").trim(),
    yearsOfExperience: Number.isFinite(years) ? years : 4,
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    mobilePay: String(formData.get("mobilePay") ?? "").trim(),
    cvr: String(formData.get("cvr") ?? "").trim(),
    home: {
      street: String(formData.get("street") ?? "").trim(),
      postalCode: String(formData.get("postalCode") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      country: "Danmark",
      lat: Number.isFinite(lat) ? lat : 55.6306,
      lon: Number.isFinite(lon) ? lon : 12.6453,
    },
  });
  refresh();
}

export async function saveOpeningHours(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const openingHours: Record<number, DayHours> = {};
  for (const day of [1, 2, 3, 4, 5, 6, 0]) {
    const closed = formData.get(`closed-${day}`) === "on";
    const from = String(formData.get(`from-${day}`) ?? "09:00");
    const to = String(formData.get(`to-${day}`) ?? "17:00");
    openingHours[day] = closed ? null : { from, to };
  }
  const bufferMinutes = Number(formData.get("bufferMinutes") ?? 30);
  const minNoticeHours = Number(formData.get("minNoticeHours") ?? 24);
  const maxAdvanceDays = Number(formData.get("maxAdvanceDays") ?? 60);
  await saveHours(openingHours, {
    bufferMinutes: Number.isFinite(bufferMinutes) ? bufferMinutes : 30,
    minNoticeHours: Number.isFinite(minNoticeHours) ? minNoticeHours : 24,
    maxAdvanceDays: Number.isFinite(maxAdvanceDays) ? maxAdvanceDays : 60,
  });
  refresh();
}

export async function addVacation(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return;
  const config = await getConfig();
  const vacation: Vacation = {
    id: randomUUID(),
    from,
    to: to < from ? from : to,
    note: String(formData.get("note") ?? "").trim(),
  };
  await saveVacations([...config.vacations, vacation]);
  refresh();
}

export async function removeVacation(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  const config = await getConfig();
  await saveVacations(config.vacations.filter((item) => item.id !== id));
  refresh();
}

export async function addEmployee(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const config = await getConfig();
  const employee = await employeeFromForm(formData, randomUUID(), config);
  await saveEmployees([...config.employees, employee]);
  refresh();
}

export async function updateEmployee(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const config = await getConfig();
  const existing = config.employees.find((item) => item.id === id);
  if (!existing) return;
  const updated = await employeeFromForm(formData, id, config, existing);
  await saveEmployees(
    config.employees.map((item) => (item.id === id ? updated : item)),
  );
  refresh();
}

export async function setEmployeeActive(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "1";
  const config = await getConfig();
  await saveEmployees(
    config.employees.map((item) => (item.id === id ? { ...item, active } : item)),
  );
  refresh();
}

export async function removeEmployee(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const id = String(formData.get("id") ?? "");
  const config = await getConfig();
  await saveEmployees(config.employees.filter((item) => item.id !== id));
  refresh();
}

export async function assignBookingEmployee(formData: FormData): Promise<void> {
  if (!(await isLoggedIn())) return;
  const bookingId = String(formData.get("bookingId") ?? "");
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!bookingId) return;

  if (!employeeId) {
    await updateBooking(bookingId, { employee: undefined });
    refresh();
    return;
  }

  const config = await getConfig();
  const employee = config.employees.find((item) => item.id === employeeId);
  if (!employee) return;
  await updateBooking(bookingId, {
    employee: { id: employee.id, name: employee.name },
  });
  refresh();
}

async function employeeFromForm(
  formData: FormData,
  id: string,
  config: Awaited<ReturnType<typeof getConfig>>,
  existing?: Employee,
): Promise<Employee> {
  const name = String(formData.get("name") ?? "").trim() || existing?.name || "Frisør";
  const street =
    String(formData.get("street") ?? "").trim() ||
    existing?.base.street ||
    config.home.street;
  const postalCode =
    String(formData.get("postalCode") ?? "").trim() ||
    existing?.base.postalCode ||
    config.home.postalCode;
  const city =
    String(formData.get("city") ?? "").trim() ||
    existing?.base.city ||
    config.home.city;
  const image =
    String(formData.get("image") ?? "").trim() ||
    existing?.image ||
    "/behandlinger/hjemmebesoeg.png";
  const activeValues = formData.getAll("active").map(String);
  const active =
    activeValues.length > 0
      ? activeValues.includes("1") || activeValues.includes("on")
      : (existing?.active ?? true);

  let lat = existing?.base.lat ?? config.home.lat;
  let lon = existing?.base.lon ?? config.home.lon;
  const query = [street, postalCode, city].filter(Boolean).join(", ");
  const addressChanged =
    !existing ||
    street !== existing.base.street ||
    postalCode !== existing.base.postalCode ||
    city !== existing.base.city;

  if (addressChanged && query && !street.includes("[RET DETTE]")) {
    try {
      const url = new URL("https://api.dataforsyningen.dk/adresser/autocomplete");
      url.searchParams.set("q", query);
      url.searchParams.set("per_side", "1");
      url.searchParams.set("type", "adresse");
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = (await response.json()) as {
          adresse?: { x: number; y: number };
        }[];
        const hit = data[0]?.adresse;
        if (hit?.y && hit?.x) {
          lat = hit.y;
          lon = hit.x;
        }
      }
    } catch {
      /* behold eksisterende koordinater */
    }
  }

  return {
    id,
    name,
    role: String(formData.get("role") ?? "").trim() || existing?.role || "Frisør",
    image,
    imageAlt: String(formData.get("imageAlt") ?? "").trim() || `${name}, frisør`,
    active,
    bio: String(formData.get("bio") ?? "").trim() || existing?.bio,
    qualifications: String(formData.get("qualifications") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    exampleImages: existing?.exampleImages,
    base: { street, postalCode, city, lat, lon },
  };
}
