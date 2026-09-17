import { NextResponse } from "next/server";
import { readyAppSql } from "@/lib/db/client";
import { drainOutbox } from "@/lib/notify/drain";
import { drainCaptures } from "@/lib/payments/capture-worker";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sql = await readyAppSql();
  if (!sql) return NextResponse.json({ ok: true, skipped: true });
  const captures = await drainCaptures(sql);
  const messages = await drainOutbox(sql);
  return NextResponse.json({ ok: true, captures, messages });
}
