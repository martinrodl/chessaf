import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Simple in-memory rate limiter (resets on server restart / per lambda instance)
const calls: Record<string, { count: number; ts: number }> = {};
function rateLimit(ip: string, limit: number) {
  const now = Date.now();
  const windowMs = 60_000;
  const rec = calls[ip] || { count: 0, ts: now };
  if (now - rec.ts > windowMs) {
    rec.count = 0;
    rec.ts = now;
  }
  rec.count += 1;
  calls[ip] = rec;
  return rec.count <= limit;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-token");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const limit = parseInt(process.env.REVALIDATE_RPM || "60", 10);
  if (!rateLimit(ip, limit)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 }
    );
  }

  const { siteId, locale, slug, also = [] } = await req.json();
  if (!siteId || !locale || !slug) {
    return NextResponse.json(
      { ok: false, error: "missing params" },
      { status: 400 }
    );
  }

  revalidatePath(`/${siteId}/${locale}/blog/${slug}`);
  revalidatePath(`/${siteId}/${locale}`);
  revalidatePath(`/sitemap.xml`);
  for (const p of also) revalidatePath(p);

  return NextResponse.json({ ok: true });
}
