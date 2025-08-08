import { NextResponse } from "next/server";

/**
 * Cron (Vercel) – social publisher:
 *  1) najde nové články od posledního běhu
 *  2) připraví varianty postů (X/LinkedIn/FB) + UTM
 *  3) odešle přes API
 */
export async function GET() {
  console.log("[cron] social: start");
  // TODO implement publisher logic
  console.log("[cron] social: done (placeholder)");
  return NextResponse.json({ ok: true });
}
