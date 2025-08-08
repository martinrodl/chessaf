import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from 'node:crypto';

function verifyHmac(secret: string, rawBody: string, signature?: string | null) {
  if (!signature) return false;
  if (!signature.startsWith('sha256=')) return false;
  const sig = signature.slice(7);
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch { return false; }
}

// Simple in-memory rate limiter (resets per instance)
const calls: Record<string, { count: number; ts: number }> = {};
function rateLimit(ip: string, limit: number) {
  const now = Date.now();
  const windowMs = 60_000;
  const rec = calls[ip] || { count: 0, ts: now };
  if (now - rec.ts > windowMs) { rec.count = 0; rec.ts = now; }
  rec.count += 1;
  calls[ip] = rec;
  return rec.count <= limit;
}

export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get("x-revalidate-token");
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secretHeader !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const limit = parseInt(process.env.REVALIDATE_RPM || '60', 10);
  if (!rateLimit(ip, limit)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  // Read raw body first for HMAC
  const rawBody = await req.text();
  if (!verifyHmac(secret, rawBody, req.headers.get('x-signature'))) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 });
  }

  let parsed: any;
  try { parsed = JSON.parse(rawBody); } catch { return NextResponse.json({ ok:false, error:'invalid_json' }, { status:400 }); }
  const { siteId, locale, slug, also = [] } = parsed;
  if (!siteId || !locale || !slug) {
    return NextResponse.json({ ok: false, error: "missing params" }, { status: 400 });
  }

  revalidatePath(`/${siteId}/${locale}/blog/${slug}`);
  revalidatePath(`/${siteId}/${locale}`);
  revalidatePath(`/sitemap.xml`);
  for (const p of also) revalidatePath(p);

  return NextResponse.json({ ok: true });
}
