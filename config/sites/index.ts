import cz from "./cz";
import def from "./default";
export const SITES = { cz, default: def } as const;
export type SiteId = keyof typeof SITES;
export const getSite = (id: string) => SITES[(id as SiteId) || "default"];
