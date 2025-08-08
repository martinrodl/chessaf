import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-token");
  if (secret !== process.env.REVALIDATE_SECRET)
    return NextResponse.json({ ok: false }, { status: 401 });

  const { siteId, locale, slug } = await req.json();
  revalidatePath(`/${siteId}/${locale}/blog/${slug}`);
  revalidatePath(`/sitemap.xml`);
  return NextResponse.json({ ok: true });
}
