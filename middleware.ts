import { NextResponse } from "next/server";

const hostToSiteId: Record<string, string> = {
  "localhost:3000": "cz",
  "example.cz": "cz",
  "example.com": "default",
};

export function middleware(req: Request) {
  const url = new URL(req.url);
  (url.searchParams as any).siteId = hostToSiteId[url.host] ?? "default";
  return NextResponse.next();
}
