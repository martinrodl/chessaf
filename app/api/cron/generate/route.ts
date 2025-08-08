import { NextResponse } from "next/server";
// sem zavolej vlastní generator (nebo externí službu)
// uloží MDX do /content/... a pak POSTne /api/revalidate
export async function GET() {
  return NextResponse.json({ ok: true });
}
