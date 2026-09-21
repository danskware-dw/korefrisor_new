import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import { applySchema, createSql, databaseUrl } from "./client";
import type { Sql } from "postgres";

export type IsolatedDb = {
  sql: Sql;
  url: string;
  stop: () => Promise<void>;
};

function assertNotProduction(url: string): void {
  const prod = databaseUrl();
  if (prod && urlsEqual(prod, url)) {
    throw new Error("Concurrency tests must not use production DATABASE_URL.");
  }
}

function urlsEqual(a: string, b: string): boolean {
  try {
    const left = new URL(a);
    const right = new URL(b);
    return left.host === right.host && left.pathname === right.pathname;
  } catch {
    return a === b;
  }
}

function randomPort(): number {
  return 15000 + Math.floor(Math.random() * 20000);
}

/**
 * Throwaway Postgres for concurrency tests. Never the app DATABASE_URL.
 */
export async function createIsolatedTestDb(): Promise<IsolatedDb> {
  const fromEnv = process.env.TEST_DATABASE_URL;
  if (fromEnv) {
    assertNotProduction(fromEnv);
    const sql = createSql(fromEnv, 4);
    await applySchema(sql);
    await sql`TRUNCATE bookings, settings, payment_events, payment_operations, outbox, message_deliveries, job_applications CASCADE`;
    return {
      sql,
      url: fromEnv,
      stop: async () => {
        await sql.end({ timeout: 2 });
      },
    };
  }

  const port = randomPort();
  const databaseDir = mkdtempSync(path.join(tmpdir(), "korefrisor-pg-"));
  const cluster = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: "postgres",
    port,
    persistent: false,
    onLog: () => undefined,
    onError: () => undefined,
  });
  await cluster.initialise();
  await cluster.start();
  await cluster.createDatabase("testdb");
  const url = `postgres://postgres:postgres@127.0.0.1:${port}/testdb`;
  assertNotProduction(url);
  const sql = createSql(url, 4);
  await applySchema(sql);
  return {
    sql,
    url,
    stop: async () => {
      await sql.end({ timeout: 2 });
      await cluster.stop();
    },
  };
}
