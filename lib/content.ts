import path from "node:path";
import { listMdxFiles, readMDX, CONTENT_ROOT } from "./mdx";

export type Article = {
  siteId: string;
  locale: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  coverImage?: string;
  ogImage?: string;
  publishedAt?: string;
  updatedAt?: string;
  affiliate?: { chesscom?: string };
  body?: string;
};

export function getArticle(
  siteId: string,
  locale: string,
  slug: string
): Article | null {
  const fp =
    path.join(CONTENT_ROOT, siteId, locale, "blog", ...slug.split("/")) +
    ".mdx";
  try {
    const { frontMatter, content } = readMDX(fp);
    return { siteId, locale, slug, ...frontMatter, body: content } as Article;
  } catch {
    return null;
  }
}

export function getArticleList(siteId: string, locale: string): Article[] {
  const dir = path.join(CONTENT_ROOT, siteId, locale, "blog");
  const files = listMdxFiles(dir);
  return files
    .map((fp) => {
      const { frontMatter } = readMDX(fp);
      const slug = fp
        .split(
          `${path.sep}${siteId}${path.sep}${locale}${path.sep}blog${path.sep}`
        )[1]
        .replace(/\.mdx$/, "");
      return { siteId, locale, slug, ...frontMatter } as Article;
    })
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}
