import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-token");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { siteId, locale, slug, also = [] } = await req.json();
  if (!siteId || !locale || !slug) {
    return NextResponse.json({ ok: false, error: "missing params" }, { status: 400 });
  }

  revalidatePath(`/${siteId}/${locale}/blog/${slug}`);
  revalidatePath(`/${siteId}/${locale}`);
  revalidatePath(`/sitemap.xml`);
  for (const p of also) revalidatePath(p);

  return NextResponse.json({ ok: true });
}
