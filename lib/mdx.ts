import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const CONTENT_ROOT = path.join(process.cwd(), "content");

export function readMDX(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { frontMatter: data as any, content };
}

export function listArticles(siteId: string, locale: string) {
  const dir = path.join(CONTENT_ROOT, siteId, locale, "blog");
  const files: string[] = [];
  const walk = (p: string) => {
    for (const f of fs.readdirSync(p)) {
      const fp = path.join(p, f);
      const st = fs.statSync(fp);
      if (st.isDirectory()) walk(fp);
      else if (fp.endsWith(".mdx")) files.push(fp);
    }
  };
  walk(dir);
  return files.map((fp) => ({ fp, ...readMDX(fp) }));
}
