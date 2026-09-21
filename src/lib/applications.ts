import { randomUUID } from "node:crypto";
import { readyAppSql } from "@/lib/db/client";

export type JobApplication = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  city: string;
  message: string;
};

export type ApplicationDraft = {
  name: string;
  phone: string;
  city: string;
  message: string;
  honeypot?: string;
};

export type ParseResult =
  | { ok: true; spam: true }
  | { ok: true; spam?: false; value: Omit<JobApplication, "id" | "createdAt"> }
  | { ok: false; error: string };

/** Samme regel som `isDanishPhone` i booking-ui. */
function isDanishPhone(value: string): boolean {
  return /^(\+45)?\s?(\d\s?){8}$/.test(value.trim());
}

export function parseApplication(input: ApplicationDraft): ParseResult {
  if (input.honeypot?.trim()) return { ok: true, spam: true };

  const name = input.name.trim();
  const phone = input.phone.trim();
  const city = input.city.trim();
  const message = input.message.trim();

  if (name.length < 2) return { ok: false, error: "Skriv dit navn." };
  if (!isDanishPhone(phone)) {
    return { ok: false, error: "Skriv et dansk telefonnummer på 8 cifre." };
  }
  if (city.length < 2) return { ok: false, error: "Skriv by eller område, du kører fra." };
  if (message.length < 10) {
    return { ok: false, error: "Skriv lidt om dig selv — mindst et par sætninger." };
  }
  if (message.length > 2000) return { ok: false, error: "Beskeden er for lang." };

  return { ok: true, value: { name, phone, city, message } };
}

type ApplicationRow = {
  id: string;
  created_at: Date;
  name: string;
  phone: string;
  city: string;
  message: string;
};

function fromRow(row: ApplicationRow): JobApplication {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    name: row.name,
    phone: row.phone,
    city: row.city,
    message: row.message,
  };
}

export async function insertApplication(
  value: Omit<JobApplication, "id" | "createdAt">,
): Promise<JobApplication> {
  const sql = await readyAppSql();
  if (!sql) throw new Error("database");
  const row: ApplicationRow = {
    id: randomUUID(),
    created_at: new Date(),
    name: value.name,
    phone: value.phone,
    city: value.city,
    message: value.message,
  };
  await sql`
    INSERT INTO job_applications (id, created_at, name, phone, city, message)
    VALUES (${row.id}, ${row.created_at}, ${row.name}, ${row.phone}, ${row.city}, ${row.message})
  `;
  return fromRow(row);
}

export async function listApplications(): Promise<JobApplication[]> {
  const sql = await readyAppSql();
  if (!sql) return [];
  const rows = await sql<ApplicationRow[]>`
    SELECT * FROM job_applications ORDER BY created_at DESC
  `;
  return rows.map(fromRow);
}

export async function deleteApplication(id: string): Promise<void> {
  const sql = await readyAppSql();
  if (!sql) return;
  await sql`DELETE FROM job_applications WHERE id = ${id}`;
}
