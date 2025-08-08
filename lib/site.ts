export function getSiteFromUrl(host?: string) {
  if (!host) return "default";
  if (host.includes("example.cz")) return "cz";
  return "default";
}
