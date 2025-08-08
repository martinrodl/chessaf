import path from "node:path";
import { readMDX, listArticles, CONTENT_ROOT } from "./mdx";

export type Article = {
  siteId: string;
  locale: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  publishedAt?: string;
  updatedAt?: string;
  coverImage?: string;
  ogImage?: string;
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
    return { siteId, locale, slug, ...frontMatter, body: content } as any;
  } catch {
    return null;
  }
}

export function getArticleList(siteId: string, locale: string) {
  return listArticles(siteId, locale)
    .map(({ fp, frontMatter }) => {
      const slug = fp
        .split(`${siteId}/${locale}/blog/`)[1]
        .replace(/\.mdx$/, "");
      return { siteId, locale, slug, ...frontMatter } as any;
    })
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}
