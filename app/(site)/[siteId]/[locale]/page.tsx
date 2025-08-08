import { getArticleList } from "@/lib/content";
export const revalidate = 86400;

export default function Home({
  params,
}: {
  params: { siteId: string; locale: string };
}) {
  const list = getArticleList(params.siteId, params.locale);
  return (
    <main className="p-6">
      <h1>Blog</h1>
      <ul>
        {list.map((a) => (
          <li key={a.slug}>
            <a href={`/${params.siteId}/${params.locale}/blog/${a.slug}`}>
              {a.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
