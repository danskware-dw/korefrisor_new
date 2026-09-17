import postgres, { type Sql } from "postgres";
import { SCHEMA_SQL, EXCLUSION_SQL } from "./schema";

let appSql: Sql | null = null;
let schemaReady: Promise<void> | null = null;

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
}

export function createSql(url: string, max = 1): Sql {
  return postgres(url, { max, idle_timeout: 20, connect_timeout: 10 });
}

/** Lazy app client. Missing env is fine at build time. */
export function getAppSql(): Sql | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!appSql) appSql = createSql(url, 1);
  return appSql;
}

/** Plan name: lazy getDb(). */
export const getDb = getAppSql;

export async function applySchema(sql: Sql): Promise<void> {
  await sql.unsafe(SCHEMA_SQL);
  try {
    await sql.unsafe(EXCLUSION_SQL);
  } catch {
    // btree_gist may be unavailable; advisory lock still serializes writes.
  }
}

/** Apply schema once, then return the app client. */
export async function readyAppSql(): Promise<Sql | null> {
  const sql = getAppSql();
  if (!sql) return null;
  if (!schemaReady) {
    schemaReady = applySchema(sql).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
  return sql;
}
