import { NextResponse } from "next/server";
// vezmi poslední články a pošli na X/LinkedIn (publisher skript)
export async function GET() {
  return NextResponse.json({ ok: true });
}
