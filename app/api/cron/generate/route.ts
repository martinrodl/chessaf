import { NextResponse } from "next/server";

/**
 * Cron (Vercel) – spouští generátor:
 *  1) vybere topic (např. z fronty)
 *  2) vygeneruje MDX do /content/{siteId}/{locale}/blog/YYYY/MM/slug.mdx
 *  3) zavolá POST /api/revalidate
 *
 * TODO: Napoj MCP/LLM a git/DB zapis.
 */
export async function GET() {
  console.log("[cron] generate: start");
  // TODO implement logic
  console.log("[cron] generate: done (placeholder)");
  return NextResponse.json({ ok: true });
}
